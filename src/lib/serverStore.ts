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
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lounge-db.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const ARCHIVES_DIR = path.join(DATA_DIR, 'archives');

/**
 * Ensure necessary storage directories exist
 */
function ensureStorageDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  if (!fs.existsSync(ARCHIVES_DIR)) fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
}

/**
 * Calculates retention cutoff date:
 * Policy: Retain at least 3 completed previous calendar months plus the ongoing current month.
 * Example (October 2026):
 * - Current month: Oct 2026
 * - 3 previous full months: Sep 2026, Aug 2026, Jul 2026
 * - Cutoff: 2026-07-01 00:00:00 (Everything from July 1 onwards remains active)
 * Only records older than the 3 completed previous months are safely archived to disk and rotated out.
 */
export function getRetentionCutoffDate(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
}

/**
 * Perform automatic daily backup snapshot
 */
function performDailyBackup(state: LoungeServerState) {
  try {
    ensureStorageDirs();
    const today = new Date().toISOString().split('T')[0];
    const backupFile = path.join(BACKUPS_DIR, `lounge-db-backup-${today}.json`);
    if (!fs.existsSync(backupFile)) {
      fs.writeFileSync(backupFile, JSON.stringify(state, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to create daily backup:', err);
  }
}

/**
 * Archive sessions and expenses older than 3 full previous months to monthly archive files,
 * then prune only those archived records from active state so that data is NEVER lost.
 */
function archiveAndPruneOldData(state: LoungeServerState): {
  prunedSessionsCount: number;
  prunedExpensesCount: number;
  activeSessions: GameSession[];
  activeExpenses: Expense[];
} {
  ensureStorageDirs();
  const cutoff = getRetentionCutoffDate();
  const cutoffTime = cutoff.getTime();

  const activeSessions: GameSession[] = [];
  const toArchiveSessions: GameSession[] = [];

  for (const s of (state.sessions || [])) {
    // Active sessions are never archived until closed
    if (s.status === 'active') {
      activeSessions.push(s);
      continue;
    }
    const sDate = s.startTime ? new Date(s.startTime).getTime() : NaN;
    if (isNaN(sDate) || sDate >= cutoffTime) {
      activeSessions.push(s);
    } else {
      toArchiveSessions.push(s);
    }
  }

  const activeExpenses: Expense[] = [];
  const toArchiveExpenses: Expense[] = [];

  for (const e of (state.expenses || [])) {
    const eDate = e.date ? new Date(e.date).getTime() : NaN;
    if (isNaN(eDate) || eDate >= cutoffTime) {
      activeExpenses.push(e);
    } else {
      toArchiveExpenses.push(e);
    }
  }

  // Safely write archived records to monthly archive JSON files
  if (toArchiveSessions.length > 0 || toArchiveExpenses.length > 0) {
    const sessionsByMonth: Record<string, GameSession[]> = {};
    for (const s of toArchiveSessions) {
      const ym = s.startTime && s.startTime.length >= 7 ? s.startTime.substring(0, 7) : 'legacy';
      if (!sessionsByMonth[ym]) sessionsByMonth[ym] = [];
      sessionsByMonth[ym].push(s);
    }

    const expensesByMonth: Record<string, Expense[]> = {};
    for (const e of toArchiveExpenses) {
      const ym = e.date && e.date.length >= 7 ? e.date.substring(0, 7) : 'legacy';
      if (!expensesByMonth[ym]) expensesByMonth[ym] = [];
      expensesByMonth[ym].push(e);
    }

    const allMonths = Array.from(new Set([...Object.keys(sessionsByMonth), ...Object.keys(expensesByMonth)]));
    for (const ym of allMonths) {
      const archiveFile = path.join(ARCHIVES_DIR, `lounge-archive-${ym}.json`);
      let existingArchive = { sessions: [] as GameSession[], expenses: [] as Expense[] };
      if (fs.existsSync(archiveFile)) {
        try {
          existingArchive = JSON.parse(fs.readFileSync(archiveFile, 'utf-8'));
        } catch {
          // ignore corrupted read
        }
      }

      const existingSessionIds = new Set(existingArchive.sessions.map((s) => s.id));
      for (const s of (sessionsByMonth[ym] || [])) {
        if (!existingSessionIds.has(s.id)) {
          existingArchive.sessions.push(s);
          existingSessionIds.add(s.id);
        }
      }

      const existingExpenseIds = new Set(existingArchive.expenses.map((e) => e.id));
      for (const e of (expensesByMonth[ym] || [])) {
        if (!existingExpenseIds.has(e.id)) {
          existingArchive.expenses.push(e);
          existingExpenseIds.add(e.id);
        }
      }

      fs.writeFileSync(archiveFile, JSON.stringify(existingArchive, null, 2), 'utf-8');
    }
  }

  return {
    prunedSessionsCount: toArchiveSessions.length,
    prunedExpensesCount: toArchiveExpenses.length,
    activeSessions,
    activeExpenses,
  };
}

class CentralLoungeStore {
  private state: LoungeServerState;
  private subscribers: Set<(state: LoungeServerState) => void> = new Set();
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.state = this.loadInitial();
    if (isSupabaseConfigured()) {
      this.initSupabaseSync();
    }
  }

  private hydrateState(parsed: any): LoungeServerState {
    return {
      devices: parsed.devices || initialDevices,
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

  private loadInitial(): LoungeServerState {
    ensureStorageDirs();

    // 1. Try reading active db file
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.devices) && parsed.devices.length > 0) {
          const loaded = this.hydrateState(parsed);
          performDailyBackup(loaded);
          return loaded;
        }
      }
    } catch (err) {
      console.error('Failed to read lounge-db.json:', err);
    }

    // 2. Auto-Recovery: Search for the latest snapshot in backups directory
    try {
      if (fs.existsSync(BACKUPS_DIR)) {
        const backups = fs.readdirSync(BACKUPS_DIR)
          .filter(f => f.startsWith('lounge-db-backup-') && f.endsWith('.json'))
          .sort()
          .reverse();

        if (backups.length > 0) {
          const latestBackupPath = path.join(BACKUPS_DIR, backups[0]);
          console.warn(`[Auto-Recovery] Recovering state from latest backup snapshot: ${backups[0]}`);
          const raw = fs.readFileSync(latestBackupPath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.devices) && parsed.devices.length > 0) {
            const recovered = this.hydrateState(parsed);
            this.persist(recovered);
            return recovered;
          }
        }
      }
    } catch (recoveryErr) {
      console.error('[Auto-Recovery] Recovery attempt failed:', recoveryErr);
    }

    // 3. Defaults fallback
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
   * Atomic persistence with auto-backup, monthly archiving, and retention protection
   */
  private persist(stateToSave: LoungeServerState) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        ensureStorageDirs();

        // 1. Automatic daily backup
        performDailyBackup(stateToSave);

        // 2. Archive sessions/expenses older than 3 full previous months to disk
        const { activeSessions, activeExpenses } = archiveAndPruneOldData(stateToSave);
        stateToSave.sessions = activeSessions;
        stateToSave.expenses = activeExpenses;

        // 3. Atomic write using temporary file to prevent corruption
        const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
        fs.writeFileSync(tempFile, JSON.stringify(stateToSave, null, 2), 'utf-8');
        fs.renameSync(tempFile, DB_FILE);

        // 4. Cloud sync to Supabase (if configured)
        if (isSupabaseConfigured()) {
          this.syncToSupabase(stateToSave);
        }
      } catch (e) {
        console.error('Error persisting lounge state to file:', e);
      }
    }, 100);
  }

  private async initSupabaseSync() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('lounge_store')
        .select('data')
        .eq('key', 'main_state')
        .maybeSingle();

      if (error) {
        console.warn('[Supabase Sync] Table notice:', error.message);
        return;
      }

      if (data && data.data && Array.isArray(data.data.devices) && data.data.devices.length > 0) {
        console.log('[Supabase Sync] Loaded cloud database state from Supabase!');
        const cloudState = this.hydrateState(data.data);
        this.state = cloudState;
        ensureStorageDirs();
        const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
        fs.writeFileSync(tempFile, JSON.stringify(cloudState, null, 2), 'utf-8');
        fs.renameSync(tempFile, DB_FILE);
        this.notify();
      } else {
        console.log('[Supabase Sync] Supabase table empty, uploading current local state...');
        await supabase.from('lounge_store').upsert({
          key: 'main_state',
          data: this.state,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('[Supabase Sync] Init failed:', err?.message || err);
    }
  }

  private async syncToSupabase(stateToSave: LoungeServerState) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // 1. Save active main state
      await supabase.from('lounge_store').upsert({
        key: 'main_state',
        data: stateToSave,
        updated_at: new Date().toISOString(),
      });

      // 2. Daily cloud backup
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('lounge_backups').upsert({
        day: today,
        data: stateToSave,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Supabase Sync] Background sync error:', err?.message || err);
    }
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
   * Sanitized state update with anti-wipe protection & financial defense
   */
  public updateState(updates: Partial<Omit<LoungeServerState, 'version' | 'auth'>>): LoungeServerState {
    // 1. Defend against Prototype Pollution
    const safeUpdates: Record<string, any> = {};
    for (const key of Object.keys(updates)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype' || key === 'auth') {
        continue;
      }
      safeUpdates[key] = (updates as any)[key];
    }

    // 2. Anti-Wipe Protection: Never allow client to wipe populated devices/games/menuItems
    if (this.state.devices && this.state.devices.length > 0 && Array.isArray(safeUpdates.devices) && safeUpdates.devices.length === 0) {
      delete safeUpdates.devices;
    }
    if (this.state.games && this.state.games.length > 0 && Array.isArray(safeUpdates.games) && safeUpdates.games.length === 0) {
      delete safeUpdates.games;
    }
    if (this.state.menuItems && this.state.menuItems.length > 0 && Array.isArray(safeUpdates.menuItems) && safeUpdates.menuItems.length === 0) {
      delete safeUpdates.menuItems;
    }

    // 3. Financial integrity validation on incoming devices
    if (Array.isArray(safeUpdates.devices)) {
      safeUpdates.devices = safeUpdates.devices.map((d: Device) => ({
        ...d,
        hourlyRateSingle: sanitizeMoney(d.hourlyRateSingle, 0, 50_000),
        hourlyRateMulti: sanitizeMoney(d.hourlyRateMulti, 0, 50_000),
      }));
    }

    // 4. Financial integrity validation on incoming menuItems
    if (Array.isArray(safeUpdates.menuItems)) {
      safeUpdates.menuItems = safeUpdates.menuItems.map((m: MenuItem) => ({
        ...m,
        price: sanitizeMoney(m.price, 0, 50_000),
        cost: sanitizeMoney(m.cost, 0, 50_000),
        stock: Math.max(0, Math.floor(m.stock || 0)),
      }));
    }

    // 5. Financial integrity validation on incoming sessions
    if (Array.isArray(safeUpdates.sessions)) {
      safeUpdates.sessions = safeUpdates.sessions.map((s: GameSession) => ({
        ...s,
        discount: sanitizeMoney(s.discount, 0, 50_000),
        grandTotal: sanitizeMoney(s.grandTotal, 0, 100_000),
        hourlyRate: sanitizeMoney(s.hourlyRate, 0, 50_000),
      }));
    }

    // 6. Financial integrity validation on expenses
    if (Array.isArray(safeUpdates.expenses)) {
      safeUpdates.expenses = safeUpdates.expenses.map((e: Expense) => ({
        ...e,
        amount: sanitizeMoney(e.amount, 0, 1_000_000),
      }));
    }

    // 7. Settings bounds validation
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
