'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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

export type SyncStatus = 'synced' | 'syncing' | 'offline';

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
  
  // Offline-First & Sync Status
  syncStatus: SyncStatus;
  isOnline: boolean;
  forceSync: () => Promise<void>;

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
  downloadBackupJSON: () => void;
}

const LoungeContext = createContext<LoungeContextType | undefined>(undefined);

const STORAGE_KEY = 'playstation_lounge_state_prod_v1';
const COMPLETED_SESSIONS_KEY = 'clash_locally_completed_sessions_v1';
const AUTH_TOKEN_KEY = 'clash_auth_token';
const AUTH_ROLE_KEY = 'clash_auth_role';

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

  // Sync state & network status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Refs for race-condition prevention and stomping defense
  const isIncomingUpdate = useRef(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const completedSessionsRef = useRef<Set<string>>(new Set());
  const hasPendingChangesRef = useRef(false);
  const lastMutationTimeRef = useRef(0);
  const syncDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a live reference to current sessions for synchronous checks
  const sessionsRef = useRef<GameSession[]>(initialSessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Keep a live reference to current devices
  const devicesRef = useRef<Device[]>(initialDevices);
  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  // 1. Initial Local-First Eager Load (Synchronous from Disk before any Network call)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    // Read stored completed sessions set to prevent resurrection of closed sessions
    try {
      const savedCompleted = localStorage.getItem(COMPLETED_SESSIONS_KEY);
      if (savedCompleted) {
        const ids: string[] = JSON.parse(savedCompleted);
        if (Array.isArray(ids)) {
          ids.forEach((id) => completedSessionsRef.current.add(id));
        }
      }
    } catch {}

    // Read cached state immediately
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.devices) && parsed.devices.length > 0) setDevices(parsed.devices);
          if (Array.isArray(parsed.games)) setGames(parsed.games);
          if (Array.isArray(parsed.menuItems)) setMenuItems(parsed.menuItems);
          if (Array.isArray(parsed.sessions)) {
            // Apply completed sessions filter
            const safeSessions = parsed.sessions.map((s: GameSession) => {
              if (completedSessionsRef.current.has(s.id) && s.status === 'active') {
                return { ...s, status: 'completed' as const };
              }
              return s;
            });
            setSessions(safeSessions);
          }
          if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
          if (Array.isArray(parsed.customers)) setCustomers(parsed.customers);
          if (Array.isArray(parsed.maintenance)) setMaintenance(parsed.maintenance);
          if (Array.isArray(parsed.tournaments)) setTournaments(parsed.tournaments);
          if (parsed.currentShift) setCurrentShift(parsed.currentShift);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.auth) setAuthSettings(parsed.auth);
          if (parsed.theme) {
            setTheme(parsed.theme);
            applyThemeToDocument(parsed.theme);
          }
        }
      }
    } catch (e) {
      console.warn('[Offline-First] Local cache parse warning:', e);
    }

    // Read cached role
    try {
      const savedRole = localStorage.getItem(AUTH_ROLE_KEY) as UserRole;
      if (savedRole === 'admin' || savedRole === 'it') {
        setCurrentRole(savedRole);
      }
    } catch {}

    setIsLoaded(true);

    // Listen to network status
    const handleOnline = () => {
      setIsOnline(true);
      if (hasPendingChangesRef.current) {
        debouncedPushToServer();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Validate session against server on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/auth/me', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && (data.role === 'admin' || data.role === 'it')) {
          setCurrentRole(data.role);
          try {
            localStorage.setItem(AUTH_ROLE_KEY, data.role);
          } catch {}
        } else {
          // If server says guest, but we are offline, preserve saved role
          if (navigator.onLine) {
            setCurrentRole('guest');
            try {
              localStorage.removeItem(AUTH_ROLE_KEY);
              localStorage.removeItem(AUTH_TOKEN_KEY);
            } catch {}
          }
        }
      })
      .catch(() => {
        // Network offline: preserve local role
      });
  }, []);

  // 3. Theme sync to DOM
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // 4. Construct live state payload
  const getCurrentPayload = useCallback(() => {
    return {
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
      _updatedAt: Date.now(),
    };
  }, [devices, games, menuItems, sessions, expenses, customers, maintenance, tournaments, currentShift, settings, authSettings, theme]);

  // 5. Server Push Engine (With Retry & Offline Support)
  const pushToServer = useCallback(async (customPayload?: any) => {
    const payload = customPayload || getCurrentPayload();
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('syncing');
      const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/lounge', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSyncStatus('synced');
        hasPendingChangesRef.current = false;
      } else if (res.status === 401) {
        // Staff credentials needed or expired; keep local data safe
        setSyncStatus('offline');
      } else {
        setSyncStatus('offline');
      }
    } catch {
      setSyncStatus('offline');
    }
  }, [getCurrentPayload]);

  // 6. Debounced Push Worker (Batches multiple quick local mutations)
  const debouncedPushToServer = useCallback((customPayload?: any) => {
    if (syncDebounceTimerRef.current) {
      clearTimeout(syncDebounceTimerRef.current);
    }
    syncDebounceTimerRef.current = setTimeout(() => {
      pushToServer(customPayload);
    }, 400);
  }, [pushToServer]);

  // 7. Force manual sync on demand
  const forceSync = useCallback(async () => {
    await pushToServer();
  }, [pushToServer]);

  // 8. Smart Server State Merger (Never stomps on local mutations)
  const applyServerState = useCallback((incoming: any) => {
    if (!incoming || typeof incoming !== 'object') return;

    // Protection: If local changes happened within 10 seconds and have not synced, do not overwrite sessions!
    const isRecentlyMutated = hasPendingChangesRef.current && (Date.now() - lastMutationTimeRef.current < 10000);

    isIncomingUpdate.current = true;

    // --- SESSIONS MERGE (CRITICAL) ---
    // Rule: Once a session is completed locally, an incoming server 'active' status MUST NEVER revert it back to active!
    setSessions((prevSessions) => {
      if (!Array.isArray(incoming.sessions)) return prevSessions;

      const localMap = new Map<string, GameSession>();
      prevSessions.forEach((s) => localMap.set(s.id, s));

      const mergedMap = new Map<string, GameSession>();

      // Keep all local sessions first
      prevSessions.forEach((s) => {
        mergedMap.set(s.id, s);
      });

      // Integrate server sessions
      incoming.sessions.forEach((srvSession: GameSession) => {
        const locSession = localMap.get(srvSession.id);
        const isLocallyCompleted = completedSessionsRef.current.has(srvSession.id) || (locSession && locSession.status === 'completed');

        if (!locSession) {
          // Session only on server
          if (!completedSessionsRef.current.has(srvSession.id)) {
            mergedMap.set(srvSession.id, srvSession);
          }
        } else {
          // Session in both
          if (isLocallyCompleted) {
            // Keep local completed session! Do NOT resurrect as active!
            mergedMap.set(srvSession.id, locSession);
          } else if (srvSession.status === 'completed') {
            // Server completed it, accept completed
            mergedMap.set(srvSession.id, srvSession);
          } else {
            // Both active: merge orders
            const locOrderIds = new Set(locSession.orders.map((o) => o.id));
            const extraOrders = (srvSession.orders || []).filter((o) => !locOrderIds.has(o.id));
            mergedMap.set(srvSession.id, {
              ...locSession,
              orders: [...locSession.orders, ...extraOrders],
            });
          }
        }
      });

      const finalSessions = Array.from(mergedMap.values());
      sessionsRef.current = finalSessions;
      return finalSessions;
    });

    // --- DEVICES MERGE ---
    // Rule: Derive device status strictly from merged sessions: If no active session exists for device, it MUST be available!
    setDevices((prevDevices) => {
      const baseDevices = Array.isArray(incoming.devices) && incoming.devices.length > 0 ? incoming.devices : prevDevices;
      const activeDeviceIds = new Set(
        sessionsRef.current
          .filter((s) => s.status === 'active' && !completedSessionsRef.current.has(s.id))
          .map((s) => s.deviceId)
      );

      const finalDevices = baseDevices.map((d: Device) => ({
        ...d,
        status: activeDeviceIds.has(d.id) ? 'busy' : (d.status === 'maintenance' ? 'maintenance' : 'available'),
      }));
      devicesRef.current = finalDevices;
      return finalDevices;
    });

    // --- EXPENSES MERGE ---
    setExpenses((prevExp) => {
      if (!Array.isArray(incoming.expenses)) return prevExp;
      const localExpIds = new Set(prevExp.map((e) => e.id));
      const newFromSrv = incoming.expenses.filter((e: Expense) => !localExpIds.has(e.id));
      return [...prevExp, ...newFromSrv];
    });

    // Non-conflicting entities
    if (!isRecentlyMutated) {
      if (Array.isArray(incoming.games)) setGames(incoming.games);
      if (Array.isArray(incoming.menuItems)) setMenuItems(incoming.menuItems);
      if (Array.isArray(incoming.customers)) setCustomers(incoming.customers);
      if (Array.isArray(incoming.maintenance)) setMaintenance(incoming.maintenance);
      if (Array.isArray(incoming.tournaments)) setTournaments(incoming.tournaments);
      if (incoming.currentShift) setCurrentShift(incoming.currentShift);
      if (incoming.settings) setSettings(incoming.settings);
      if (incoming.theme) {
        setTheme(incoming.theme);
        applyThemeToDocument(incoming.theme);
      }
    }

    setIsLoaded(true);

    // Update local storage with safe merged state
    try {
      const mergedPayload = {
        devices: devicesRef.current,
        games: incoming.games || games,
        menuItems: incoming.menuItems || menuItems,
        sessions: sessionsRef.current,
        expenses: incoming.expenses || expenses,
        customers: incoming.customers || customers,
        maintenance: incoming.maintenance || maintenance,
        tournaments: incoming.tournaments || tournaments,
        currentShift: incoming.currentShift || currentShift,
        settings: incoming.settings || settings,
        auth: authSettings,
        theme: incoming.theme || theme,
        _updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedPayload));
    } catch {}
  }, [authSettings, currentShift, customers, expenses, games, maintenance, menuItems, settings, theme, tournaments]);

  // 9. Sync & Event Source Initialization
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    // Cross-tab broadcast synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('clash_realtime_sync');
        bc.onmessage = (event) => {
          if (event.data) {
            applyServerState(event.data);
          }
        };
        broadcastChannelRef.current = bc;
      } catch {}
    }

    // Initial server fetch
    fetch('/api/lounge')
      .then((res) => res.json())
      .then((data) => {
        applyServerState(data);
      })
      .catch(() => {
        // Fallback to offline state
        setSyncStatus('offline');
      });

    // SSE connection
    try {
      eventSource = new EventSource('/api/lounge/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          applyServerState(parsed);
        } catch {}
      };
    } catch {}

    // Polling heartbeat every 12 seconds
    pollInterval = setInterval(() => {
      fetch('/api/lounge')
        .then((res) => res.json())
        .then((data) => {
          applyServerState(data);
        })
        .catch(() => {
          setSyncStatus('offline');
        });
    }, 12000);

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, [applyServerState]);

  // 10. Local Mutation Observer (Synchronous Local Persistence + Cross-tab Broadcast + Debounced Server Sync)
  useEffect(() => {
    if (!isLoaded) return;
    if (isIncomingUpdate.current) {
      isIncomingUpdate.current = false;
      return;
    }

    const payload = getCurrentPayload();

    // 1. Synchronous disk write to localStorage (Guaranteed 0ms offline safety)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}

    // 2. Broadcast to other open tabs
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(payload);
      } catch {}
    }

    // 3. Flag unsynced mutation
    hasPendingChangesRef.current = true;
    lastMutationTimeRef.current = Date.now();

    // 4. Trigger debounced background sync
    debouncedPushToServer(payload);
  }, [devices, games, menuItems, sessions, expenses, customers, maintenance, tournaments, currentShift, settings, authSettings, theme, isLoaded, getCurrentPayload, debouncedPushToServer]);

  // ==========================================
  // STATE ACTION METHODS
  // ==========================================

  const getActiveSessionForDevice = (deviceId: string) => {
    return sessions.find(
      (s) => s.deviceId === deviceId && s.status === 'active' && !completedSessionsRef.current.has(s.id)
    );
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

    // 1. Calculate live totals
    const tempUndiscounted = { ...session, endTime, discount: 0 };
    const rawStats = calculateSessionLiveStats(tempUndiscounted, undefined, settings);
    const subtotal = rawStats.timeCost + rawStats.ordersCost;

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

    // 2. CRITICAL: Register in permanent local completed set to prevent server resurrection
    completedSessionsRef.current.add(sessionId);
    try {
      localStorage.setItem(
        COMPLETED_SESSIONS_KEY,
        JSON.stringify(Array.from(completedSessionsRef.current))
      );
    } catch {}

    // 3. Update local session state
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? completedSession : s))
    );

    // 4. Free device immediately
    setDevices((prev) =>
      prev.map((d) => (d.id === session.deviceId ? { ...d, status: 'available' } : d))
    );

    // 5. Loyalty points
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
    if (!sanitized) return;

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
    
    const shiftSessions = sessions.filter(
      (s) => s.status === 'completed' && new Date(s.endTime || s.startTime).getTime() >= shiftStartTime
    );
    const revenue = shiftSessions.reduce((sum, s) => sum + Math.max(0, s.grandTotal || 0), 0);

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

  // Auth Operations
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
          localStorage.setItem(AUTH_ROLE_KEY, data.role);
          if (data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          }
        } catch {}

        // Push pending mutations right away now that we are authenticated
        debouncedPushToServer();
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
      localStorage.removeItem(AUTH_ROLE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {}
  };

  const updateAdminPassword = async (newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 3) return false;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers,
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
      const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ target: 'it', newPassword: newPassword.trim() }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  const downloadBackupJSON = () => {
    const backupData = {
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
      theme,
      exportedAt: new Date().toISOString(),
      version: 1,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `clash-lounge-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
        syncStatus,
        isOnline,
        forceSync,
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
        downloadBackupJSON,
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
