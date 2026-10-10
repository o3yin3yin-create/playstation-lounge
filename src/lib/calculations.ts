import { GameSession, Device, LoungeSettings, AuthSettings, ThemeSettings } from '../types';

export const defaultLoungeSettings: LoungeSettings = {
  gracePeriodMinutes: 5,
  minimumCharge: 15,
};

export const defaultAuthSettings: AuthSettings = {
  adminPassword: 'admin123',
  itPassword: '3Yin-3Yin',
};

export const defaultThemeSettings: ThemeSettings = {
  primaryColor: '#F25623',
  backgroundColor: '#171717',
  surfaceColor: '#1E1E1E',
  cardColor: '#242424',
  borderColor: '#4D4D4D',
  presetName: 'Clash Orange',
};

export interface ThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  borderColor: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'clash_orange',
    name: 'Clash Orange',
    primaryColor: '#F25623',
    backgroundColor: '#171717',
    surfaceColor: '#1E1E1E',
    cardColor: '#242424',
    borderColor: '#4D4D4D',
  },
  {
    id: 'neon_cyan',
    name: 'Neon Cyan',
    primaryColor: '#00E5FF',
    backgroundColor: '#0D1117',
    surfaceColor: '#161B22',
    cardColor: '#21262D',
    borderColor: '#30363D',
  },
  {
    id: 'cyber_purple',
    name: 'Electric Purple',
    primaryColor: '#A855F7',
    backgroundColor: '#0F0A1C',
    surfaceColor: '#18112C',
    cardColor: '#231B3D',
    borderColor: '#3B2D61',
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Matrix',
    primaryColor: '#10B981',
    backgroundColor: '#0A140F',
    surfaceColor: '#122018',
    cardColor: '#1B2E24',
    borderColor: '#2B4738',
  },
  {
    id: 'crimson_red',
    name: 'Crimson Red',
    primaryColor: '#EF4444',
    backgroundColor: '#180D0D',
    surfaceColor: '#241414',
    cardColor: '#301C1C',
    borderColor: '#4A2C2C',
  },
  {
    id: 'gold_luxury',
    name: 'Gold Luxury',
    primaryColor: '#F59E0B',
    backgroundColor: '#15120C',
    surfaceColor: '#201B12',
    cardColor: '#2B2519',
    borderColor: '#443A26',
  },
  {
    id: 'sapphire_blue',
    name: 'Sapphire Blue',
    primaryColor: '#3B82F6',
    backgroundColor: '#0B132B',
    surfaceColor: '#1C2541',
    cardColor: '#253258',
    borderColor: '#3A4B75',
  },
  {
    id: 'stealth_slate',
    name: 'Stealth Slate',
    primaryColor: '#E2E8F0',
    backgroundColor: '#090D16',
    surfaceColor: '#131926',
    cardColor: '#1E2638',
    borderColor: '#334155',
  },
];

export function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyThemeToDocument(theme: ThemeSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const primary = theme.primaryColor || '#F25623';
  const bg = theme.backgroundColor || '#171717';
  const surface = theme.surfaceColor || '#1E1E1E';
  const card = theme.cardColor || '#242424';
  const border = theme.borderColor || '#4D4D4D';

  root.style.setProperty('--clash-primary', primary);
  root.style.setProperty('--clash-primary-glow', hexToRgba(primary, 0.35));
  root.style.setProperty('--clash-primary-subtle', hexToRgba(primary, 0.15));
  root.style.setProperty('--clash-bg', bg);
  root.style.setProperty('--clash-surface', surface);
  root.style.setProperty('--clash-card', card);
  root.style.setProperty('--clash-border', border);

  if (document.body) {
    document.body.style.backgroundColor = bg;
  }
}

/**
 * Format currency in Egyptian Pounds (EGP)
 */
export function formatCurrency(amount: number): string {
  return `${Math.round(amount * 100) / 100} EGP`;
}

/**
 * Format duration in minutes to readable English string (e.g. 1h 45m)
 */
export function formatMinutesArabic(totalMinutes: number): string {
  if (totalMinutes < 0) totalMinutes = 0;
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export const formatMinutes = formatMinutesArabic;

/**
 * Format seconds to timer display (HH:MM:SS)
 */
export function formatTimer(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculate active session statistics (elapsed seconds, elapsed minutes, remaining minutes, cost)
 * Applies business rules: Grace Period (free if <= gracePeriodMinutes) and Minimum Charge.
 */
export function calculateSessionLiveStats(
  session: GameSession, 
  customNow?: Date,
  settings: LoungeSettings = defaultLoungeSettings
) {
  const startTime = new Date(session.startTime).getTime();
  const current = (session.endTime ? new Date(session.endTime) : (customNow || new Date())).getTime();
  const elapsedMs = Math.max(0, current - startTime);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedMinutes = elapsedSeconds / 60;

  // Hourly cost calculation (exact minute-based calculation)
  const rawTimeCost = (elapsedMinutes / 60) * session.hourlyRate;
  let timeCost = rawTimeCost;
  let appliedRule: 'grace_period' | 'minimum_charge' | 'standard' = 'standard';

  // Apply Grace Period
  if (settings && elapsedMinutes <= settings.gracePeriodMinutes) {
    timeCost = 0;
    appliedRule = 'grace_period';
  } 
  // Apply Minimum Charge
  else if (settings && settings.minimumCharge > 0 && rawTimeCost < settings.minimumCharge) {
    timeCost = settings.minimumCharge;
    appliedRule = 'minimum_charge';
  }

  // Orders cost calculation
  const ordersCost = session.orders.reduce((sum, ord) => sum + ord.price * ord.quantity, 0);

  // Remaining minutes for fixed session
  let remainingSeconds = 0;
  let isOvertime = false;
  let progressPercentage = 100;

  if (session.sessionType === 'fixed' && session.plannedMinutes) {
    const totalPlannedSeconds = session.plannedMinutes * 60;
    const diffSeconds = totalPlannedSeconds - elapsedSeconds;
    
    if (diffSeconds > 0) {
      remainingSeconds = diffSeconds;
      progressPercentage = Math.min(100, Math.round((elapsedSeconds / totalPlannedSeconds) * 100));
    } else {
      remainingSeconds = 0;
      isOvertime = true;
      progressPercentage = 100;
    }
  }

  const grandTotal = Math.max(0, (timeCost + ordersCost) - (session.discount || 0));

  return {
    elapsedSeconds,
    elapsedMinutes: Math.floor(elapsedMinutes),
    exactMinutes: elapsedMinutes,
    remainingSeconds,
    remainingMinutes: Math.ceil(remainingSeconds / 60),
    isOvertime,
    progressPercentage,
    rawTimeCost: Math.round(rawTimeCost),
    timeCost: Math.round(timeCost),
    appliedRule,
    ordersCost,
    grandTotal: Math.round(grandTotal),
  };
}

/**
 * Sound effects using standard Web Audio API
 */
export function playSound(type: 'beep' | 'warning' | 'finished' | 'cash') {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'warning') {
      [0, 0.15].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.1);
      });
    } else if (type === 'finished') {
      [400, 600, 800].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.18;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } else if (type === 'cash') {
      [987.77, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    }
  } catch {
    // Audio policy fallback
  }
}
