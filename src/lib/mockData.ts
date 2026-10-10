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
    id: 'dev-1',
    name: 'Device 01',
    type: 'VIP_ROOM',
    status: 'busy',
    hourlyRateSingle: 80,
    hourlyRateMulti: 120,
    controllersCount: 4,
    games: ['game-1', 'game-2', 'game-3', 'game-4', 'game-5', 'game-6', 'game-7'],
    notes: '75" 4K TV • Sound System • VIP Room'
  },
  {
    id: 'dev-2',
    name: 'Device 02',
    type: 'PS5',
    status: 'busy',
    hourlyRateSingle: 50,
    hourlyRateMulti: 70,
    controllersCount: 2,
    games: ['game-1', 'game-2', 'game-3', 'game-5', 'game-6'],
    notes: '55" 4K 120Hz Screen'
  },
  {
    id: 'dev-3',
    name: 'Device 03',
    type: 'PS5',
    status: 'available',
    hourlyRateSingle: 50,
    hourlyRateMulti: 70,
    controllersCount: 4,
    games: ['game-1', 'game-2', 'game-4', 'game-7', 'game-10'],
    notes: '55" 4K Screen'
  },
  {
    id: 'dev-4',
    name: 'Device 04',
    type: 'PS5',
    status: 'available',
    hourlyRateSingle: 50,
    hourlyRateMulti: 70,
    controllersCount: 2,
    games: ['game-1', 'game-2', 'game-3', 'game-8'],
    notes: '50" 4K Screen'
  },
  {
    id: 'dev-5',
    name: 'Device 05',
    type: 'PS4',
    status: 'available',
    hourlyRateSingle: 35,
    hourlyRateMulti: 50,
    controllersCount: 2,
    games: ['game-1', 'game-2', 'game-4', 'game-9'],
    notes: '43" Full HD Screen'
  },
  {
    id: 'dev-6',
    name: 'Device 06',
    type: 'PS4',
    status: 'busy',
    hourlyRateSingle: 35,
    hourlyRateMulti: 50,
    controllersCount: 4,
    games: ['game-1', 'game-2', 'game-7', 'game-8', 'game-10'],
    notes: '43" Full HD Screen'
  },
  {
    id: 'dev-7',
    name: 'Device 07',
    type: 'PS4',
    status: 'available',
    hourlyRateSingle: 35,
    hourlyRateMulti: 50,
    controllersCount: 2,
    games: ['game-1', 'game-2', 'game-4'],
    notes: '43" Full HD Screen'
  },
  {
    id: 'dev-8',
    name: 'Device 08',
    type: 'PS4',
    status: 'maintenance',
    hourlyRateSingle: 35,
    hourlyRateMulti: 50,
    controllersCount: 2,
    games: ['game-1', 'game-2'],
    notes: 'Under controller maintenance'
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
