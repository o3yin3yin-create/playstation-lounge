import { Device, Game, MenuItem, GameSession, Expense, Shift, CustomerLoyalty, MaintenanceItem, Tournament } from '../types';

export const initialGames: Game[] = [];

export const initialDevices: Device[] = [
  {
    id: "dev-1789767509526",
    name: "screen 1",
    type: "PS4",
    games: [],
    notes: "55 inch",
    status: "available",
    hourlyRateMulti: 35,
    controllersCount: 2,
    hourlyRateSingle: 25
  },
  {
    id: "dev-1789767546092",
    name: "screen 2",
    type: "VIP_ROOM",
    games: [],
    notes: "70 inch",
    status: "available",
    vipConsoleType: "PS4",
    hourlyRateMulti: 50,
    controllersCount: 2,
    hourlyRateSingle: 35
  },
  {
    id: "dev-1789768860803",
    name: "screen3",
    type: "VIP_ROOM",
    games: [],
    notes: "55",
    status: "available",
    vipConsoleType: "PS4",
    hourlyRateMulti: 50,
    controllersCount: 2,
    hourlyRateSingle: 35
  }
];

export const initialMenuItems: MenuItem[] = [];

export const initialSessions: GameSession[] = [];

export const initialExpenses: Expense[] = [];

export const initialCustomers: CustomerLoyalty[] = [];

export const initialMaintenance: MaintenanceItem[] = [];

export const initialTournaments: Tournament[] = [];

export const initialShift: Shift = {
  id: 'shift-1',
  openedAt: new Date().toISOString(),
  cashierName: 'Admin',
  startingCash: 0,
  status: 'open'
};
