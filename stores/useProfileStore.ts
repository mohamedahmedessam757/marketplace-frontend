
import { create } from 'zustand';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

export interface Card {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'mada';
  expiry: string;
  holder: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    date: string;
    status: 'success' | 'pending' | 'failed';
    merchant: string;
}

export interface Address {
  id: string;
  title: string;
  details: string;
  city: string;
  isDefault: boolean;
}

export interface Session {
  id: string;
  device: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ProfileState {
  user: UserProfile;
  cards: Card[];
  transactions: Transaction[];
  addresses: Address[];
  sessions: Session[];
  settings: {
    notifications: boolean;
    language: 'ar' | 'en';
  };
  updateUser: (data: Partial<UserProfile>) => void;
  updateSettings: (data: Partial<ProfileState['settings']>) => void;
  
  // Card Actions
  addCard: (card: Omit<Card, 'id' | 'brand'>) => void; // brand inferred
  
  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;

  // Address Actions
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Session Actions
  terminateSession: (id: string) => void;
  terminateAllSessions: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: {
    name: 'Mohammed Ali',
    email: 'mohammed@example.com',
    phone: '0551234567'
  },
  cards: [
    { id: '1', last4: '4242', brand: 'visa', expiry: '12/25', holder: 'MOHAMMED ALI' },
    { id: '2', last4: '8899', brand: 'mastercard', expiry: '08/24', holder: 'MOHAMMED ALI' }
  ],
  transactions: [
      { id: 'tx-1', amount: 1200, currency: 'SAR', date: '2024-01-10', status: 'success', merchant: 'Jeddah Parts' },
      { id: 'tx-2', amount: 850, currency: 'SAR', date: '2024-02-15', status: 'success', merchant: 'Seoul Auto' }
  ],
  addresses: [
    { id: '1', title: 'Home', details: 'Olaya St, Building 12', city: 'Riyadh', isDefault: true },
    { id: '2', title: 'Office', details: 'King Road, Tower A', city: 'Jeddah', isDefault: false }
  ],
  sessions: [
    { id: 's1', device: 'Chrome', os: 'Windows 11', location: 'Riyadh, KSA', ip: '192.168.1.1', lastActive: 'Now', isCurrent: true },
    { id: 's2', device: 'iPhone 13', os: 'iOS 17.2', location: 'Riyadh, KSA', ip: '10.0.0.5', lastActive: '2 hours ago', isCurrent: false },
  ],
  settings: {
    notifications: true,
    language: 'ar'
  },
  
  updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
  updateSettings: (data) => set((state) => ({ settings: { ...state.settings, ...data } })),
  
  addCard: (card) => set((state) => {
      // Simple brand inference
      const brand = Math.random() > 0.5 ? 'visa' : 'mastercard'; 
      const newCard: Card = { ...card, id: Date.now().toString(), brand };
      return { cards: [...state.cards, newCard] };
  }),

  addTransaction: (tx) => set((state) => ({
      transactions: [{ ...tx, id: `TX-${Date.now()}`, date: new Date().toISOString().split('T')[0] }, ...state.transactions]
  })),

  addAddress: (address) => set((state) => {
    const isFirst = state.addresses.length === 0;
    const newAddress = { ...address, id: Date.now().toString(), isDefault: isFirst || address.isDefault };
    const updatedAddresses = address.isDefault 
        ? state.addresses.map(a => ({ ...a, isDefault: false })) 
        : state.addresses;
    return { addresses: [...updatedAddresses, newAddress] };
  }),

  removeAddress: (id) => set((state) => ({
    addresses: state.addresses.filter(a => a.id !== id)
  })),

  setDefaultAddress: (id) => set((state) => ({
    addresses: state.addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }))
  })),

  terminateSession: (id) => set((state) => ({
    sessions: state.sessions.filter(s => s.id !== id)
  })),

  terminateAllSessions: () => set((state) => ({
    sessions: state.sessions.filter(s => s.isCurrent)
  }))
}));
