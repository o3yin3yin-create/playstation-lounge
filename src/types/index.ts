export type ConsoleType = 'PS5' | 'PS4' | 'VIP_ROOM';
export type DeviceStatus = 'available' | 'busy' | 'maintenance';
export type PlayMode = 'single' | 'multi';
export type SessionType = 'open' | 'fixed';

export interface Game {
  id: string;
  title: string;
  genre: string;
  image: string;
  psVersion: 'PS4' | 'PS5' | 'Both';
  playersCount: string;
  isPopular?: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: ConsoleType;
  vipConsoleType?: 'PS5' | 'PS4';
  status: DeviceStatus;
  hourlyRateSingle: number;
  hourlyRateMulti: number;
  controllersCount: number;
  games: string[]; // game IDs
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'hot' | 'cold' | 'fresh' | 'energy' | 'snack';
  price: number;
  cost: number;
  stock: number;
  image?: string;
  available: boolean;
}

export interface SessionOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  timestamp: string;
}

export interface GameSession {
  id: string;
  deviceId: string;
  deviceName: string;
  mode: PlayMode;
  sessionType: SessionType;
  plannedMinutes?: number; // for fixed sessions (e.g. 60, 90, 120)
  startTime: string; // ISO string
  endTime?: string; // ISO string
  orders: SessionOrderItem[];
  discount: number; // in EGP or currency
  customerName?: string;
  customerPhone?: string;
  status: 'active' | 'completed' | 'cancelled';
  hourlyRate: number; // rate applied for this session
  totalTimeMinutes?: number;
  totalTimeCost?: number;
  totalOrdersCost?: number;
  grandTotal?: number;
  paymentMethod?: 'cash' | 'card' | 'vodafone_cash';
}

export interface Expense {
  id: string;
  title: string;
  category: 'rent' | 'electricity' | 'maintenance' | 'supplies' | 'salaries' | 'other';
  amount: number;
  date: string;
  notes?: string;
  recordedBy?: string;
}

export interface Shift {
  id: string;
  openedAt: string;
  closedAt?: string;
  cashierName: string;
  startingCash: number;
  actualClosingCash?: number;
  expectedCash?: number;
  cashDifference?: number;
  status: 'open' | 'closed';
}

export interface CustomerLoyalty {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalHours: number;
  totalSpent: number;
  lastVisit: string;
}

export interface MaintenanceItem {
  id: string;
  deviceId: string;
  deviceName: string;
  itemType: 'controller' | 'console' | 'hdmi' | 'screen' | 'headset';
  issue: string;
  cost: number;
  status: 'pending' | 'repaired';
  createdAt: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  date: string;
  entryFee: number;
  prizePool: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  participants: { id: string; name: string; phone: string; score?: number }[];
  winner?: string;
}

export interface LoungeSettings {
  gracePeriodMinutes: number; // Duration (e.g. 5 min) where session is free if ended early
  minimumCharge: number;      // Minimum gaming charge in EGP (e.g. 15 or 20)
}

export type UserRole = 'guest' | 'admin' | 'it';

export interface AuthSettings {
  adminPassword: string; // Password for Admin/Cashier access
  itPassword: string;    // Password for IT/Master access
}

export interface ThemeSettings {
  primaryColor: string;      // Accent / brand color (default: '#F25623')
  backgroundColor: string;   // Main background (default: '#171717')
  surfaceColor: string;      // Cards & containers (default: '#1E1E1E')
  cardColor: string;         // Inner elements & inputs (default: '#242424')
  borderColor: string;       // Dividers & borders (default: '#4D4D4D')
  presetName?: string;       // Active preset name
}



