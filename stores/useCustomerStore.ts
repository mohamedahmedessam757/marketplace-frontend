import { create } from 'zustand';

export interface Device {
  id: string;
  name: string;
  type: string;
  lastActive: string;
  ip: string;
}

export interface SecurityLog {
  id: string;
  action: string;
  createdAt: string;
  ipAddress: string;
  details: any;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
  avatar?: string;
  balance?: number;
  ltv?: number;
  successRate?: number;
  ordersCount?: number;
  adminNotes?: string;
  Session?: any[];
  securityLogs?: SecurityLog[];
  orders?: any[];
  disputes?: any[];
}

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  fetchCustomerById: (id: string) => Promise<Customer | null>;
  toggleStatus: (id: string) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/users/admin/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.ok ? await response.json() : [];
      set({ customers: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchCustomerById: async (id: string) => {
    const token = localStorage.getItem('access_token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/users/admin/customers/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    return response.json();
  },

  toggleStatus: async (id: string) => {
    // Optimistic Update
    set((state) => ({
      customers: state.customers.map(c =>
        c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : c
      )
    }));

    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await Patch(`${API_URL}/users/admin/customers/${id}/status`, token);
      if (!response.ok) throw new Error('Failed to toggle status');
    } catch (err) {
      console.error(err);
      // Revert if failed (Simple refetch for safety)
      get().fetchCustomers();
    }
  },

  updateNotes: async (id: string, notes: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/users/admin/customers/${id}/notes`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      if (!response.ok) throw new Error('Failed to update notes');

      set((state) => ({
        customers: state.customers.map(c => String(c.id) === String(id) ? { ...c, adminNotes: notes } : c)
      }));
    } catch (err) {
      console.error(err);
    }
  }
}));

// Helper for fetch PATCH
async function Patch(url: string, token: string | null) {
  return fetch(url, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
