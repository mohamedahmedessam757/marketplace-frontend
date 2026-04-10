import { create } from 'zustand';

export interface WalletTransaction {
  id: string;
  orderId: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  order: any;
}

export interface WalletStats {
  totalSpent: number;
  monthlySpent: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  referralCode: string;
  referralCount: number;
  customerBalance: number;
  completedOrders: number;
  totalOrdersCount: number;
  acceptanceRate: number;
  refundedAmount: number;
  pendingEarnings: number;
}

interface CustomerWalletState {
  stats: WalletStats | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  fetchWalletData: (silent?: boolean) => Promise<void>;
  updateStatsLocally: (updates: Partial<WalletStats>) => void;
  addTransactionLocally: (tx: WalletTransaction) => void;
}

export const useCustomerWalletStore = create<CustomerWalletState>((set, get) => ({
  stats: null,
  transactions: [],
  isLoading: true,

  fetchWalletData: async (silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const { client } = await import('../services/api/client');
      // Use the consolidated dashboard API for maximum speed (single round trip)
      const res = await client.get('/payments/customer/dashboard');

      set({
        stats: res.data.stats,
        transactions: res.data.transactions,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch customer wallet data', error);
      set({ isLoading: false });
    }
  },

  updateStatsLocally: (updates) => {
    const current = get().stats;
    if (current) {
      set({ stats: { ...current, ...updates } });
    }
  },

  addTransactionLocally: (tx) => {
    const currentTx = get().transactions;
    // Check for duplicates before adding
    if (!currentTx.some(existing => existing.id === tx.id)) {
      set({ transactions: [tx, ...currentTx] });
    }
  }
}));

// Setup zero-lag realtime listener
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';

export const subscribeToWalletUpdates = () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    // 1. Listen for new transactions (Delta Update: Instant UI update, no re-fetch)
    const txSub = supabase
        .channel('public:payment_transactions')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'payment_transactions', filter: `customer_id=eq.${userId}` },
            (payload) => {
                const newTx = payload.new as any;
                // Add instantly to UI
                useCustomerWalletStore.getState().addTransactionLocally({
                    ...newTx,
                    order: newTx.order // Note: In reality might need a minimal order fetch or wait for background sync
                });
                
                // Trigger a silent background sync to ensure relations (like order details) are fully populated
                useCustomerWalletStore.getState().fetchWalletData(true);
            }
        )
        .subscribe();

    // 2. Listen for balance/points/tier updates (Instant Sync)
    const userSub = supabase
        .channel('public:users')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
            (payload) => {
                // Update stats instantly from DB payload
                useCustomerWalletStore.getState().updateStatsLocally({
                    customerBalance: Number(payload.new.customer_balance),
                    loyaltyPoints: payload.new.loyalty_points,
                    loyaltyTier: payload.new.loyalty_tier,
                    totalSpent: Number(payload.new.total_spent),
                    referralCount: payload.new.referral_count
                });
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            txSub.unsubscribe();
            userSub.unsubscribe();
        }
    };
};
