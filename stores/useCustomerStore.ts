
import { create } from 'zustand';

export interface Device {
  id: string;
  name: string;
  type: string;
  lastActive: string;
  ip: string;
}

export interface LoginLog {
  id: string;
  date: string;
  status: 'success' | 'failed';
  ip: string;
  method: 'email' | 'google' | 'apple';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
  avatar?: string;
  balance: number;
  devices: Device[];
  loginHistory: LoginLog[];
}

interface CustomerState {
  customers: Customer[];
  toggleStatus: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '100', // Matches Math.floor(1001/10) roughly for demo linkage
    name: 'Mohammed Ahmed',
    email: 'mohammed@example.com',
    phone: '0551234567',
    status: 'ACTIVE',
    joinedAt: '2023-05-12',
    balance: 150,
    devices: [
      { id: 'd1', name: 'iPhone 13', type: 'Mobile', lastActive: 'Now', ip: '192.168.1.1' },
      { id: 'd2', name: 'Chrome Windows', type: 'Desktop', lastActive: '2 days ago', ip: '10.0.0.5' }
    ],
    loginHistory: [
      { id: 'l1', date: '2024-03-10 10:00 AM', status: 'success', ip: '192.168.1.1', method: 'email' },
      { id: 'l2', date: '2024-03-09 02:30 PM', status: 'failed', ip: '192.168.1.1', method: 'email' }
    ]
  },
  {
    id: '101',
    name: 'Sarah Khalid',
    email: 'sarah@example.com',
    phone: '0569876543',
    status: 'ACTIVE',
    joinedAt: '2023-08-20',
    balance: 0,
    devices: [
      { id: 'd3', name: 'Samsung S22', type: 'Mobile', lastActive: '1 hour ago', ip: '192.168.1.20' }
    ],
    loginHistory: [
      { id: 'l3', date: '2024-03-10 09:00 AM', status: 'success', ip: '192.168.1.20', method: 'google' }
    ]
  },
  {
    id: '102',
    name: 'Yousef Omar',
    email: 'yousef@example.com',
    phone: '0543332211',
    status: 'SUSPENDED',
    joinedAt: '2023-01-15',
    balance: 500,
    devices: [],
    loginHistory: []
  }
];

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: MOCK_CUSTOMERS,
  toggleStatus: (id) => set((state) => ({
    customers: state.customers.map(c => 
      c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : c
    )
  })),
  getCustomerById: (id) => get().customers.find(c => c.id === id)
}));
