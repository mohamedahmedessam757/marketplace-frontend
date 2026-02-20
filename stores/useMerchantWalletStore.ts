
import { create } from 'zustand';

export interface Transaction {
  id: string;
  date: string;
  type: 'sale' | 'payout' | 'deduction';
  orderId?: number;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  description?: string;
}

interface MerchantWalletState {
  balance: {
    available: number;
    pending: number;
    totalSales: number;
  };
  transactions: Transaction[];

  // Actions
  fetchWallet: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateBalance: (available: number, pending: number, total: number) => void;
}

// Mock initial data
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TX-901', date: '2024-02-20', type: 'sale', orderId: 1005, amount: 350, status: 'completed', description: 'Order #1005 Revenue' },
  { id: 'TX-902', date: '2024-02-21', type: 'deduction', orderId: 1005, amount: -35, status: 'completed', description: 'Platform Commission (10%)' },
  { id: 'TX-903', date: '2024-02-22', type: 'sale', orderId: 1006, amount: 3200, status: 'pending', description: 'Order #1006 Revenue (In Warranty)' },
  { id: 'TX-800', date: '2024-02-15', type: 'payout', amount: -1500, status: 'completed', description: 'Weekly Payout to IBAN ***982' },
];

export const useMerchantWalletStore = create<MerchantWalletState>((set) => ({
  balance: {
    available: 1850,
    pending: 3200,
    totalSales: 25400
  },
  transactions: INITIAL_TRANSACTIONS,

  fetchWallet: async () => {
    // Currently populated with MOCK data, but this method fulfills the Global Pre-Fetch architecture requirement
    // In the future this will be replaced with supabase.from('wallet').select('*')
    return Promise.resolve();
  },

  addTransaction: (tx) => set((state) => ({
    transactions: [{ ...tx, id: `TX-${Date.now()}` }, ...state.transactions]
  })),

  updateBalance: (available, pending, total) => set({
    balance: { available, pending, totalSales: total }
  })
}));
