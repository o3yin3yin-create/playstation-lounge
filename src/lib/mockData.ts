import { Device, Game, MenuItem, GameSession, Expense, Shift, CustomerLoyalty, MaintenanceItem, Tournament } from '../types';

export const initialGames: Game[] = [
  {
    id: 'game-1',
    title: 'EA SPORTS FC 25',
    genre: 'Sports / Football',
    image: '',
    psVersion: 'Both',
    playersCount: '1 - 4 Players',
    isPopular: true
  },
  {
    id: 'game-2',
    title: 'eFootball PES 2024',
    genre: 'Sports / Football',
    image: '',
    psVersion: 'Both',
    playersCount: '1 - 4 Players',
    isPopular: true
  },
  {
    id: 'game-3',
    title: 'Mortal Kombat 1',
    genre: 'Fighting / Action',
    image: '',
    psVersion: 'PS5',
    playersCount: '1 - 2 Players',
    isPopular: true
  },
  {
    id: 'game-4',
    title: 'Grand Theft Auto V (GTA V)',
    genre: 'Open World / Action',
    image: '',
    psVersion: 'Both',
    playersCount: '1 Player',
    isPopular: true
  },
  {
    id: 'game-5',
    title: 'Tekken 8',
    genre: 'Fighting',
    image: '',
    psVersion: 'PS5',
    playersCount: '1 - 2 Players',
    isPopular: true
  },
  {
    id: 'game-6',
    title: "Marvel's Spider-Man 2",
    genre: 'Adventure / Action',
    image: '',
    psVersion: 'PS5',
    playersCount: '1 Player',
    isPopular: true
  },
  {
    id: 'game-7',
    title: 'Call of Duty: Modern Warfare III',
    genre: 'Shooter / Multiplayer',
    image: '',
    psVersion: 'Both',
    playersCount: '1 - 2 Players',
    isPopular: true
  },
  {
    id: 'game-8',
    title: 'It Takes Two',
    genre: 'Co-op Adventure',
    image: '',
    psVersion: 'Both',
    playersCount: '2 Players',
    isPopular: false
  },
  {
    id: 'game-9',
    title: 'God of War Ragnarök',
    genre: 'Action / Adventure',
    image: '',
    psVersion: 'Both',
    playersCount: '1 Player',
    isPopular: false
  },
  {
    id: 'game-10',
    title: 'Rocket League',
    genre: 'Sports / Vehicular',
    image: '',
    psVersion: 'Both',
    playersCount: '1 - 4 Players',
    isPopular: false
  }
];

export const initialDevices: Device[] = [
  {
    id: "dev-1789767509526",
    name: "screen 1",
    type: "PS4",
    games: [
      "game-1",
      "game-2",
      "game-3",
      "game-7",
      "game-1789767900974"
    ],
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
    games: [
      "game-1",
      "game-2",
      "game-3"
    ],
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
    games: [
      "game-1",
      "game-2",
      "game-3",
      "game-4"
    ],
    notes: "55",
    status: "available",
    vipConsoleType: "PS4",
    hourlyRateMulti: 50,
    controllersCount: 2,
    hourlyRateSingle: 35
  }
];

export const initialMenuItems: MenuItem[] = [
  // Hot
  { id: 'menu-1', name: 'Turkish Coffee', category: 'hot', price: 25, cost: 7, stock: 80, available: true },
  { id: 'menu-2', name: 'Espresso Double', category: 'hot', price: 35, cost: 12, stock: 50, available: true },
  { id: 'menu-3', name: 'Karak Tea with Milk', category: 'hot', price: 30, cost: 9, stock: 65, available: true },
  { id: 'menu-4', name: 'Mint Green Tea', category: 'hot', price: 15, cost: 3, stock: 120, available: true },
  { id: 'menu-5', name: 'Latte / Cappuccino', category: 'hot', price: 40, cost: 14, stock: 45, available: true },
  
  // Cold
  { id: 'menu-7', name: 'Pepsi / Coca Cola Can', category: 'cold', price: 20, cost: 13, stock: 150, available: true },
  { id: 'menu-8', name: '7Up / Sprite Can', category: 'cold', price: 20, cost: 13, stock: 90, available: true },
  { id: 'menu-9', name: 'Schweppes Pomegranate', category: 'cold', price: 25, cost: 15, stock: 60, available: true },
  { id: 'menu-10', name: 'Spiro Spathis Soda', category: 'cold', price: 20, cost: 12, stock: 100, available: true },
  { id: 'menu-11', name: 'Mineral Water', category: 'cold', price: 10, cost: 4, stock: 200, available: true },

  // Energy & Fresh
  { id: 'menu-15', name: 'Red Bull Energy Drink', category: 'energy', price: 65, cost: 48, stock: 40, available: true },
  { id: 'menu-16', name: 'Sting Energy Drink', category: 'energy', price: 20, cost: 12, stock: 80, available: true },
  { id: 'menu-12', name: 'Fresh Mango Juice', category: 'fresh', price: 40, cost: 16, stock: 30, available: true },
  { id: 'menu-13', name: 'Lemon Mint Smoothie', category: 'fresh', price: 35, cost: 10, stock: 40, available: true },

  // Snacks
  { id: 'menu-18', name: 'Indomie Special Noodles', category: 'snack', price: 25, cost: 10, stock: 90, available: true },
  { id: 'menu-19', name: 'Crispy Chicken Sandwich', category: 'snack', price: 60, cost: 32, stock: 20, available: true },
  { id: 'menu-20', name: 'Potato Chips', category: 'snack', price: 20, cost: 13, stock: 75, available: true },
];

const now = new Date();
const fortyMinsAgo = new Date(now.getTime() - 40 * 60 * 1000).toISOString();
const seventyMinsAgo = new Date(now.getTime() - 70 * 60 * 1000).toISOString();
const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString();

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
