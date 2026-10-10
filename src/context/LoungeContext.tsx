'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Device,
  Game,
  MenuItem,
  GameSession,
  Expense,
  Shift,
  CustomerLoyalty,
  MaintenanceItem,
  Tournament,
  PlayMode,
  SessionType,
  SessionOrderItem,
  LoungeSettings,
  UserRole,
  AuthSettings,
  ThemeSettings
} from '../types';
import {
  initialDevices,
  initialGames,
  initialMenuItems,
  initialSessions,
  initialExpenses,
  initialCustomers,
  initialMaintenance,
  initialTournaments,
  initialShift
} from '../lib/mockData';
import { 
  calculateSessionLiveStats, 
  playSound, 
  defaultLoungeSettings, 
  defaultAuthSettings,
  defaultThemeSettings,
  applyThemeToDocument
} from '../lib/calculations';
import {
  sanitizeMoney,
  sanitizeQuantity,
  sanitizeDiscount,
  sanitizeExpenseInput,
  sanitizeShiftCash,
  sanitizeText,
  sanitizePhone
} from '../lib/financialSecurity';

interface LoungeContextType {
  devices: Device[];
  games: Game[];
  menuItems: MenuItem[];
  sessions: GameSession[];
  expenses: Expense[];
  customers: CustomerLoyalty[];
  maintenance: MaintenanceItem[];
  tournaments: Tournament[];
  currentShift: Shift;
  settings: LoungeSettings;
  updateSettings: (newSettings: Partial<LoungeSettings>) => void;
  
  // Dynamic Global Theme
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  
  // Auth & Roles
  currentRole: UserRole;
  authSettings: AuthSettings;
  login: (password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => Promise<void>;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
  updateITPassword: (newPassword: string) => Promise<boolean>;
  
  // Actions
  startSession: (params: {
    deviceId: string;
    mode: PlayMode;
    sessionType: SessionType;
    plannedMinutes?: number;
    customerName?: string;
    customerPhone?: string;
  }) => void;
  
  endSession: (params: {
    sessionId: string;
    discount?: number;
    paymentMethod?: 'cash' | 'card' | 'vodafone_cash';
  }) => GameSession | undefined;

  addOrderToSession: (sessionId: string, menuItemId: string, quantity: number) => void;
  removeOrderFromSession: (sessionId: string, orderItemId: string) => void;
  
  transferSession: (sessionId: string, targetDeviceId: string) => void;
  
  // Quick Cafe Sale (Takeaway)
  quickCafeSale: (items: { menuItemId: string; quantity: number }[], customerName?: string) => void;

  // Management
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  updateDeviceRates: (deviceId: string, single: number, multi: number) => void;
  updateDeviceGames: (deviceId: string, gameIds: string[]) => void;
  addDevice: (device: Omit<Device, 'id' | 'status'>) => void;
  updateDevice: (deviceId: string, updates: Partial<Device>) => void;
  deleteDevice: (deviceId: string) => void;
  addGame: (game: Omit<Game, 'id'>) => void;
  deleteGame: (gameId: string) => void;
  updateMenuItemStock: (menuItemId: string, newStock: number) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  
  // Shift
  closeShift: (actualClosingCash: number) => void;
  openNewShift: (startingCash: number, cashierName: string) => void;

  // Maintenance
  addMaintenanceLog: (item: Omit<MaintenanceItem, 'id' | 'createdAt'>) => void;
  resolveMaintenanceLog: (id: string) => void;

  // Tournaments
  addTournamentParticipant: (tournamentId: string, name: string, phone: string) => void;

  // Helpers
  getActiveSessionForDevice: (deviceId: string) => GameSession | undefined;
}

const LoungeContext = createContext<LoungeContextType | undefined>(undefined);

const STORAGE_KEY = 'playstation_lounge_state_v3';

export const LoungeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [games, setGames] = useState<Game[]>(initialGames);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [sessions, setSessions] = useState<GameSession[]>(initialSessions);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [customers, setCustomers] = useState<CustomerLoyalty[]>(initialCustomers);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(initialMaintenance);
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [currentShift, setCurrentShift] = useState<Shift>(initialShift);
  const [settings, setSettings] = useState<LoungeSettings>(defaultLoungeSettings);
  const [authSettings, setAuthSettings] = useState<AuthSettings>(defaultAuthSettings);
  const [theme, setTheme] = useState<ThemeSettings>(defaultThemeSettings);
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');
  const [isLoaded, setIsLoaded] = useState(false);

  const isIncomingUpdate = useRef(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Validate session against server on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && (data.role === 'admin' || data.role === 'it')) {
          setCurrentRole(data.role);
          try {
            localStorage.setItem('clash_auth_role', data.role);
          } catch {}
        } else {
          setCurrentRole('guest');
          try {
            localStorage.removeItem('clash_auth_role');
          } catch {}
        }
      })
      .catch(() => {
        // Fallback to local session if offline
        try {
          const savedRole = localStorage.getItem('clash_auth_role') as UserRole;
          if (savedRole === 'admin' || savedRole === 'it') {
            setCurrentRole(savedRole);
          }
        } catch {}
      });
  }, []);

  // Sync theme variables to DOM whenever theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Initialize Real-time synchronization
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const applyState = (data: any) => {
      if (!data || typeof data !== 'object') return;
      isIncomingUpdate.current = true;
      if (Array.isArray(data.devices)) setDevices(data.devices);
      if (Array.isArray(data.games)) setGames(data.games);
      if (Array.isArray(data.menuItems)) setMenuItems(data.menuItems);
      if (Array.isArray(data.sessions)) setSessions(data.sessions);
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (Array.isArray(data.customers)) setCustomers(data.customers);
      if (Array.isArray(data.maintenance)) setMaintenance(data.maintenance);
      if (Array.isArray(data.tournaments)) setTournaments(data.tournaments);
      if (data.currentShift) setCurrentShift(data.currentShift);
      if (data.settings) setSettings(data.settings);
      if (data.auth) setAuthSettings(data.auth);
      if (data.theme) {
        setTheme(data.theme);
        applyThemeToDocument(data.theme);
      }
      setIsLoaded(true);

      // Cache locally
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {}
    };

    // 1. Same-computer BroadcastChannel for 0ms instant tab synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('clash_realtime_sync');
        bc.onmessage = (event) => {
          if (event.data) {
            applyState(event.data);
          }
        };
        broadcastChannelRef.current = bc;
      } catch {}
    }

    // 2. Fetch current central state from backend server
    fetch('/api/lounge')
      .then((res) => res.json())
      .then((data) => {
        applyState(data);
      })
      .catch((err) => {
        console.warn('Initial server fetch failed, loading local cache:', err);
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) applyState(JSON.parse(saved));
        } catch {}
        setIsLoaded(true);
      });

    // 3. Real-Time Server-Sent Events (SSE) for multi-device cross-network live sync
    try {
      eventSource = new EventSource('/api/lounge/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          applyState(parsed);
        } catch {}
      };
    } catch (e) {
      console.error('SSE initialization error:', e);
    }

    // 4. Background heartbeat polling fallback every 4 seconds
    pollInterval = setInterval(() => {
      fetch('/api/lounge')
        .then((res) => res.json())
        .then((data) => {
          applyState(data);
        })
        .catch(() => {});
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, []);

  // Save changes to Central Server and Broadcast to other tabs
  useEffect(() => {
    if (!isLoaded) return;
    if (isIncomingUpdate.current) {
      isIncomingUpdate.current = false;
      return;
    }

    const payload = {
      devices,
      games,
      menuItems,
      sessions,
      expenses,
      customers,
      maintenance,
      tournaments,
      currentShift,
      settings,
      auth: authSettings,
      theme,
    };

    // 1. Broadcast locally to all open browser tabs
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(payload);
      } catch {}
    }

    // 2. Save to local storage for offline resilience
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}

    // 3. Sync to central Next.js server (Authenticated Staff/Admin/IT only)
    if (currentRole === 'admin' || currentRole === 'it') {
      fetch('/api/lounge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      }).catch((err) => console.error('Failed to sync to central server:', err));
    }
  }, [devices, games, menuItems, sessions, expenses, customers, maintenance, tournaments, currentShift, settings, authSettings, theme, isLoaded, currentRole]);

  const getActiveSessionForDevice = (deviceId: string) => {
    return sessions.find((s) => s.deviceId === deviceId && s.status === 'active');
  };

  const startSession = ({
    deviceId,
    mode,
    sessionType,
    plannedMinutes,
    customerName,
    customerPhone,
  }: {
    deviceId: string;
    mode: PlayMode;
    sessionType: SessionType;
    plannedMinutes?: number;
    customerName?: string;
    customerPhone?: string;
  }) => {
    const targetDevice = devices.find((d) => d.id === deviceId);
    if (!targetDevice) return;

    const rawRate = mode === 'single' ? targetDevice.hourlyRateSingle : targetDevice.hourlyRateMulti;
    const rate = sanitizeMoney(rawRate, 0, 50_000);

    const safePlannedMinutes = sessionType === 'fixed'
      ? Math.max(10, Math.min(1440, Math.floor(plannedMinutes || 60)))
      : undefined;

    const newSession: GameSession = {
      id: `sess-${Date.now()}`,
      deviceId,
      deviceName: sanitizeText(targetDevice.name, 60),
      mode,
      sessionType,
      plannedMinutes: safePlannedMinutes,
      startTime: new Date().toISOString(),
      orders: [],
      discount: 0,
      customerName: sanitizeText(customerName || 'Cash Customer', 60),
      customerPhone: sanitizePhone(customerPhone),
      status: 'active',
      hourlyRate: rate,
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update device status to busy
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'busy' } : d))
    );

    playSound('beep');
  };

  const endSession = ({
    sessionId,
    discount = 0,
    paymentMethod = 'cash',
  }: {
    sessionId: string;
    discount?: number;
    paymentMethod?: 'cash' | 'card' | 'vodafone_cash';
  }) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== 'active') return;

    const endTime = new Date().toISOString();

    // 1. Calculate raw subtotal with zero discount
    const tempUndiscounted = { ...session, endTime, discount: 0 };
    const rawStats = calculateSessionLiveStats(tempUndiscounted, undefined, settings);
    const subtotal = rawStats.timeCost + rawStats.ordersCost;

    // 2. Strictly sanitize and cap discount: 0 <= discount <= subtotal
    const safeDiscount = sanitizeDiscount(discount, subtotal);

    const tempSessionWithEnd = { ...session, endTime, discount: safeDiscount };
    const stats = calculateSessionLiveStats(tempSessionWithEnd, undefined, settings);

    const completedSession: GameSession = {
      ...tempSessionWithEnd,
      endTime,
      discount: safeDiscount,
      status: 'completed',
      totalTimeMinutes: stats.exactMinutes,
      totalTimeCost: stats.timeCost,
      totalOrdersCost: stats.ordersCost,
      grandTotal: Math.max(0, stats.grandTotal),
      paymentMethod,
    };

    // Update session
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? completedSession : s))
    );

    // Free the device
    setDevices((prev) =>
      prev.map((d) => (d.id === session.deviceId ? { ...d, status: 'available' } : d))
    );

    // Update loyalty points if customer phone is provided
    if (session.customerPhone) {
      const hoursPlayed = Math.max(1, Math.round(stats.exactMinutes / 60));
      const earnedPoints = hoursPlayed * 10;
      setCustomers((prev) => {
        const existing = prev.find((c) => c.phone === session.customerPhone);
        if (existing) {
          return prev.map((c) =>
            c.phone === session.customerPhone
              ? {
                  ...c,
                  points: c.points + earnedPoints,
                  totalHours: c.totalHours + hoursPlayed,
                  totalSpent: c.totalSpent + stats.grandTotal,
                  lastVisit: 'Today',
                }
              : c
          );
        } else {
          return [
            ...prev,
            {
              id: `cust-${Date.now()}`,
              name: session.customerName || 'Customer',
              phone: session.customerPhone!,
              points: earnedPoints,
              totalHours: hoursPlayed,
              totalSpent: stats.grandTotal,
              lastVisit: 'Today',
            },
          ];
        }
      });
    }

    playSound('cash');
    return completedSession;
  };

  const addOrderToSession = (sessionId: string, menuItemId: string, quantity: number) => {
    const item = menuItems.find((m) => m.id === menuItemId);
    if (!item) return;

    const safeQty = sanitizeQuantity(quantity, 50);

    const newOrder: SessionOrderItem = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId,
      name: sanitizeText(item.name, 80),
      price: sanitizeMoney(item.price, 0, 50_000),
      quantity: safeQty,
      timestamp: new Date().toISOString(),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            orders: [...s.orders, newOrder],
          };
        }
        return s;
      })
    );

    // Deduct stock
    setMenuItems((prev) =>
      prev.map((m) => (m.id === menuItemId ? { ...m, stock: Math.max(0, m.stock - safeQty) } : m))
    );

    playSound('beep');
  };

  const removeOrderFromSession = (sessionId: string, orderItemId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const target = s.orders.find((o) => o.id === orderItemId);
          if (target) {
            // restore stock
            setMenuItems((mPrev) =>
              mPrev.map((m) =>
                m.id === target.menuItemId ? { ...m, stock: m.stock + target.quantity } : m
              )
            );
          }
          return {
            ...s,
            orders: s.orders.filter((o) => o.id !== orderItemId),
          };
        }
        return s;
      })
    );
  };

  const transferSession = (sessionId: string, targetDeviceId: string) => {
    const targetDev = devices.find((d) => d.id === targetDeviceId);
    const session = sessions.find((s) => s.id === sessionId);
    if (!targetDev || !session || targetDev.status === 'busy') return;

    const previousDeviceId = session.deviceId;
    const rawRate = session.mode === 'single' ? targetDev.hourlyRateSingle : targetDev.hourlyRateMulti;
    const newRate = sanitizeMoney(rawRate, 0, 50_000);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              deviceId: targetDeviceId,
              deviceName: targetDev.name,
              hourlyRate: newRate,
            }
          : s
      )
    );

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === previousDeviceId) return { ...d, status: 'available' };
        if (d.id === targetDeviceId) return { ...d, status: 'busy' };
        return d;
      })
    );
  };

  const quickCafeSale = (items: { menuItemId: string; quantity: number }[], customerName?: string) => {
    const orders: SessionOrderItem[] = [];
    let total = 0;

    items.forEach((it) => {
      const m = menuItems.find((x) => x.id === it.menuItemId);
      if (m) {
        const safeQty = sanitizeQuantity(it.quantity, 50);
        const itemPrice = sanitizeMoney(m.price, 0, 50_000);
        orders.push({
          id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: it.menuItemId,
          name: sanitizeText(m.name, 80),
          price: itemPrice,
          quantity: safeQty,
          timestamp: new Date().toISOString(),
        });
        total += itemPrice * safeQty;

        // deduct stock
        setMenuItems((prev) =>
          prev.map((menu) =>
            menu.id === it.menuItemId ? { ...menu, stock: Math.max(0, menu.stock - safeQty) } : menu
          )
        );
      }
    });

    const safeTotal = Math.max(0, Math.round(total * 100) / 100);

    const takeawaySession: GameSession = {
      id: `takeaway-${Date.now()}`,
      deviceId: 'takeaway',
      deviceName: 'Takeaway Cafe Order',
      mode: 'single',
      sessionType: 'open',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      orders,
      discount: 0,
      customerName: sanitizeText(customerName || 'Takeaway Customer', 60),
      status: 'completed',
      hourlyRate: 0,
      totalTimeMinutes: 0,
      totalTimeCost: 0,
      totalOrdersCost: safeTotal,
      grandTotal: safeTotal,
      paymentMethod: 'cash',
    };

    setSessions((prev) => [takeawaySession, ...prev]);
    playSound('cash');
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const sanitized = sanitizeExpenseInput(expense);
    if (!sanitized) {
      console.warn('Invalid expense rejected: amount must be strictly greater than 0');
      return;
    }

    const newExp: Expense = {
      ...sanitized,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const updateDeviceRates = (deviceId: string, single: number, multi: number) => {
    const safeSingle = sanitizeMoney(single, 0, 50_000);
    const safeMulti = sanitizeMoney(multi, 0, 50_000);
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, hourlyRateSingle: safeSingle, hourlyRateMulti: safeMulti } : d))
    );
  };

  const updateDeviceGames = (deviceId: string, gameIds: string[]) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, games: gameIds } : d))
    );
  };

  const addDevice = (device: Omit<Device, 'id' | 'status'>) => {
    const newDevice: Device = {
      ...device,
      name: sanitizeText(device.name, 60),
      hourlyRateSingle: sanitizeMoney(device.hourlyRateSingle, 0, 50_000),
      hourlyRateMulti: sanitizeMoney(device.hourlyRateMulti, 0, 50_000),
      id: `dev-${Date.now()}`,
      status: 'available',
    };
    setDevices((prev) => [...prev, newDevice]);
  };

  const updateDevice = (deviceId: string, updates: Partial<Device>) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        return {
          ...d,
          ...updates,
          hourlyRateSingle: updates.hourlyRateSingle !== undefined ? sanitizeMoney(updates.hourlyRateSingle, 0, 50_000) : d.hourlyRateSingle,
          hourlyRateMulti: updates.hourlyRateMulti !== undefined ? sanitizeMoney(updates.hourlyRateMulti, 0, 50_000) : d.hourlyRateMulti,
        };
      })
    );
  };

  const deleteDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    setSessions((prev) =>
      prev.map((s) => (s.deviceId === deviceId && s.status === 'active' ? { ...s, status: 'cancelled' } : s))
    );
  };

  const addGame = (game: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...game,
      title: sanitizeText(game.title, 80),
      id: `game-${Date.now()}`,
    };
    setGames((prev) => [...prev, newGame]);
  };

  const deleteGame = (gameId: string) => {
    setGames((prev) => prev.filter((g) => g.id !== gameId));
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        games: d.games.filter((g) => g !== gameId),
      }))
    );
  };

  const updateMenuItemStock = (menuItemId: string, newStock: number) => {
    const safeStock = Math.max(0, Math.floor(newStock || 0));
    setMenuItems((prev) =>
      prev.map((m) => (m.id === menuItemId ? { ...m, stock: safeStock } : m))
    );
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      name: sanitizeText(item.name, 80),
      price: sanitizeMoney(item.price, 0, 50_000),
      cost: sanitizeMoney(item.cost, 0, 50_000),
      stock: Math.max(0, Math.floor(item.stock || 0)),
      id: `menu-${Date.now()}`,
    };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const closeShift = (actualClosingCash: number) => {
    const safeActualCash = sanitizeShiftCash(actualClosingCash);
    const shiftStartTime = new Date(currentShift.openedAt).getTime();
    
    // Calculate total revenue since shift opened
    const shiftSessions = sessions.filter(
      (s) => s.status === 'completed' && new Date(s.endTime || s.startTime).getTime() >= shiftStartTime
    );
    const revenue = shiftSessions.reduce((sum, s) => sum + Math.max(0, s.grandTotal || 0), 0);

    // Calculate shift expenses
    const shiftExpenses = expenses.filter(
      (e) => new Date(e.date).getTime() >= shiftStartTime
    );
    const totalExp = shiftExpenses.reduce((sum, e) => sum + Math.max(0, e.amount), 0);

    const expected = Math.max(0, currentShift.startingCash + revenue - totalExp);
    const diff = safeActualCash - expected;

    setCurrentShift((prev) => ({
      ...prev,
      closedAt: new Date().toISOString(),
      actualClosingCash: safeActualCash,
      expectedCash: expected,
      cashDifference: diff,
      status: 'closed',
    }));
  };

  const openNewShift = (startingCash: number, cashierName: string) => {
    const safeStarting = sanitizeShiftCash(startingCash);
    setCurrentShift({
      id: `shift-${Date.now()}`,
      openedAt: new Date().toISOString(),
      cashierName: sanitizeText(cashierName || 'Cashier', 60),
      startingCash: safeStarting,
      status: 'open',
    });
  };

  const addMaintenanceLog = (item: Omit<MaintenanceItem, 'id' | 'createdAt'>) => {
    const newLog: MaintenanceItem = {
      ...item,
      id: `maint-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaintenance((prev) => [newLog, ...prev]);
  };

  const resolveMaintenanceLog = (id: string) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'repaired' } : m))
    );
  };

  const addTournamentParticipant = (tournamentId: string, name: string, phone: string) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              participants: [
                ...t.participants,
                { id: `p-${Date.now()}`, name, phone },
              ],
            }
          : t
      )
    );
  };

  const updateSettings = (newSettings: Partial<LoungeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newTheme };
      applyThemeToDocument(updated);
      return updated;
    });
  };

  const login = async (password: string) => {
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentRole(data.role);
        try {
          localStorage.setItem('clash_auth_role', data.role);
        } catch {}
        return { success: true, role: data.role as UserRole };
      } else {
        return { success: false, error: data.error || 'Authentication failed.' };
      }
    } catch {
      return { success: false, error: 'Network error connecting to authentication server.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    setCurrentRole('guest');
    try {
      localStorage.removeItem('clash_auth_role');
    } catch {}
  };

  const updateAdminPassword = async (newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 3) return false;
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target: 'admin', newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  const updateITPassword = async (newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 3) return false;
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target: 'it', newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  return (
    <LoungeContext.Provider
      value={{
        devices,
        games,
        menuItems,
        sessions,
        expenses,
        customers,
        maintenance,
        tournaments,
        currentShift,
        settings,
        updateSettings,
        theme,
        updateTheme,
        currentRole,
        authSettings,
        login,
        logout,
        updateAdminPassword,
        updateITPassword,
        startSession,
        endSession,
        addOrderToSession,
        removeOrderFromSession,
        transferSession,
        quickCafeSale,
        addExpense,
        updateDeviceRates,
        updateDeviceGames,
        addDevice,
        updateDevice,
        deleteDevice,
        addGame,
        deleteGame,
        updateMenuItemStock,
        addMenuItem,
        closeShift,
        openNewShift,
        addMaintenanceLog,
        resolveMaintenanceLog,
        addTournamentParticipant,
        getActiveSessionForDevice,
      }}
    >
      {children}
    </LoungeContext.Provider>
  );
};

export const useLounge = () => {
  const context = useContext(LoungeContext);
  if (!context) {
    throw new Error('useLounge must be used within a LoungeProvider');
  }
  return context;
};
