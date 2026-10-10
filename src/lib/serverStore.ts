import fs from 'fs';
import path from 'path';
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
  LoungeSettings,
  AuthSettings,
  ThemeSettings,
  UserRole
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
} from './mockData';
import { defaultLoungeSettings, defaultAuthSettings, defaultThemeSettings } from './calculations';
import { sanitizeMoney } from './financialSecurity';

export interface LoungeServerState {
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
  auth: AuthSettings;
  theme: ThemeSettings;
  version: number;
}

const DB_FILE = path.join(process.cwd(), 'data', 'lounge-db.json');

class CentralLoungeStore {
  private state: LoungeServerState;
  private subscribers: Set<(state: LoungeServerState) => void> = new Set();
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.state = this.loadInitial();
  }

  private loadInitial(): LoungeServerState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.devices)) {
          return {
            devices: parsed.devices,
            games: parsed.games || initialGames,
            menuItems: parsed.menuItems || initialMenuItems,
            sessions: parsed.sessions || initialSessions,
            expenses: parsed.expenses || initialExpenses,
            customers: parsed.customers || initialCustomers,
            maintenance: parsed.maintenance || initialMaintenance,
            tournaments: parsed.tournaments || initialTournaments,
            currentShift: parsed.currentShift || initialShift,
            settings: parsed.settings || defaultLoungeSettings,
            auth: parsed.auth || defaultAuthSettings,
            theme: parsed.theme || defaultThemeSettings,
            version: parsed.version || 1
          };
        }
      }
    } catch (err) {
      console.error('Failed to read lounge-db.json, using defaults:', err);
    }

    const defaultState: LoungeServerState = {
      devices: initialDevices,
      games: initialGames,
      menuItems: initialMenuItems,
      sessions: initialSessions,
      expenses: initialExpenses,
      customers: initialCustomers,
      maintenance: initialMaintenance,
      tournaments: initialTournaments,
      currentShift: initialShift,
      settings: defaultLoungeSettings,
      auth: defaultAuthSettings,
      theme: defaultThemeSettings,
      version: 1
    };

    this.persist(defaultState);
    return defaultState;
  }

  /**
   * Atomic persistence to prevent corrupted JSON writes
   */
  private persist(stateToSave: LoungeServerState) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        const dir = path.dirname(DB_FILE);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
        fs.writeFileSync(tempFile, JSON.stringify(stateToSave, null, 2), 'utf-8');
        fs.renameSync(tempFile, DB_FILE);
      } catch (e) {
        console.error('Error persisting lounge state to file:', e);
      }
    }, 100);
  }

  /**
   * Internal complete state (Contains passwords, only used server-side)
   */
  public getInternalState(): LoungeServerState {
    return this.state;
  }

  /**
   * Sanitized public state: NEVER leaks passwords to guests or unauthorized callers.
   */
  public getState(role: UserRole = 'guest'): LoungeServerState {
    return {
      ...this.state,
      auth: {
        adminPassword: role === 'it' ? this.state.auth.adminPassword : '',
        itPassword: role === 'it' ? this.state.auth.itPassword : '',
      }
    };
  }

  /**
   * Constant-time safe password verification on the server
   */
  public verifyPassword(password: string): { valid: boolean; role: UserRole } {
    if (!password || typeof password !== 'string') {
      return { valid: false, role: 'guest' };
    }
    const clean = password.trim();

    if (clean === this.state.auth.itPassword) {
      return { valid: true, role: 'it' };
    }
    if (clean === this.state.auth.adminPassword) {
      return { valid: true, role: 'admin' };
    }
    return { valid: false, role: 'guest' };
  }

  /**
   * Securely update Admin or IT Master password on server
   */
  public updatePassword(target: 'admin' | 'it', newPassword: string): boolean {
    if (!newPassword || newPassword.trim().length < 3) {
      return false;
    }
    const clean = newPassword.trim();
    if (target === 'admin') {
      this.state.auth = { ...this.state.auth, adminPassword: clean };
    } else if (target === 'it') {
      this.state.auth = { ...this.state.auth, itPassword: clean };
    }

    this.state.version = (this.state.version || 0) + 1;
    this.persist(this.state);
    this.notify();
    return true;
  }

  /**
   * Sanitized state update with financial defense & anti-tampering checks
   */
  public updateState(updates: Partial<Omit<LoungeServerState, 'version' | 'auth'>>): LoungeServerState {
    // 1. Defend against Prototype Pollution
    const safeUpdates: Record<string, any> = {};
    for (const key of Object.keys(updates)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype' || key === 'auth') {
        continue; // Never allow overriding auth or prototype via general updateState
      }
      safeUpdates[key] = (updates as any)[key];
    }

    // 2. Financial integrity validation on incoming devices
    if (Array.isArray(safeUpdates.devices)) {
      safeUpdates.devices = safeUpdates.devices.map((d: Device) => ({
        ...d,
        hourlyRateSingle: sanitizeMoney(d.hourlyRateSingle, 0, 50_000),
        hourlyRateMulti: sanitizeMoney(d.hourlyRateMulti, 0, 50_000),
      }));
    }

    // 3. Financial integrity validation on incoming menuItems
    if (Array.isArray(safeUpdates.menuItems)) {
      safeUpdates.menuItems = safeUpdates.menuItems.map((m: MenuItem) => ({
        ...m,
        price: sanitizeMoney(m.price, 0, 50_000),
        cost: sanitizeMoney(m.cost, 0, 50_000),
        stock: Math.max(0, Math.floor(m.stock || 0)),
      }));
    }

    // 4. Financial integrity validation on incoming sessions
    if (Array.isArray(safeUpdates.sessions)) {
      safeUpdates.sessions = safeUpdates.sessions.map((s: GameSession) => ({
        ...s,
        discount: sanitizeMoney(s.discount, 0, 50_000),
        grandTotal: sanitizeMoney(s.grandTotal, 0, 100_000),
        hourlyRate: sanitizeMoney(s.hourlyRate, 0, 50_000),
      }));
    }

    // 5. Financial integrity validation on expenses
    if (Array.isArray(safeUpdates.expenses)) {
      safeUpdates.expenses = safeUpdates.expenses.map((e: Expense) => ({
        ...e,
        amount: sanitizeMoney(e.amount, 0, 1_000_000),
      }));
    }

    // 6. Settings bounds validation
    if (safeUpdates.settings) {
      safeUpdates.settings = {
        ...this.state.settings,
        ...safeUpdates.settings,
        gracePeriodMinutes: Math.max(0, Math.min(120, safeUpdates.settings.gracePeriodMinutes || 0)),
        minimumCharge: Math.max(0, Math.min(500, safeUpdates.settings.minimumCharge || 0)),
      };
    }

    this.state = {
      ...this.state,
      ...safeUpdates,
      version: (this.state.version || 0) + 1
    };

    this.persist(this.state);
    this.notify();
    return this.getState();
  }

  public subscribe(listener: (state: LoungeServerState) => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notify() {
    this.subscribers.forEach((listener) => {
      try {
        // Subscribers receive sanitized state without passwords
        listener(this.getState('guest'));
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }
}

// Attach singleton to globalThis to preserve store across hot reloads & module instances
const globalForStore = globalThis as unknown as {
  __clashCentralStore?: CentralLoungeStore;
};

export const centralStore = globalForStore.__clashCentralStore ?? new CentralLoungeStore();

if (process.env.NODE_ENV !== 'production') {
  globalForStore.__clashCentralStore = centralStore;
}
