import { create } from 'zustand';

export interface WalletTransaction {
  id: string;
  orderId?: string;
  paymentId?: string;
  amount: number;
  transactionType?: string;
  type?: 'CREDIT' | 'DEBIT';
  currency: string;
  status: string;
  createdAt: string;
  description?: string;
  metadata?: any;
  order?: any;
}

export interface WalletStats {
  totalSpent: number;
  totalPurchases: number;
  monthlyRewards: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  referralCode: string;
  referralCount: number;
  customerBalance: number;
  completedOrders: number;
  totalOrdersCount: number;
  acceptanceRate: number;
  refundedAmount: number;
  pendingRewards: number;
  profitPercentage: number;
  name?: string;
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
                // Add instantly to UI (v2026 Mapping Hardening)
                useCustomerWalletStore.getState().addTransactionLocally({
                    id: newTx.id,
                    orderId: newTx.order_id,
                    amount: Number(newTx.amount),
                    transactionType: newTx.transaction_type,
                    type: newTx.type,
                    currency: newTx.currency,
                    status: newTx.status,
                    createdAt: newTx.created_at,
                    order: newTx.order, // Usually null in raw CDC payload
                    metadata: newTx.metadata
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
                    loyaltyPoints: Number(payload.new.loyalty_points),
                    loyaltyTier: payload.new.loyalty_tier,
                    totalSpent: Number(payload.new.total_spent),
                    referralCount: Number(payload.new.referral_count),
                    referralCode: payload.new.referral_code
                });
            }
        )
        .subscribe();

    // 3. Listen for Wallet Transactions (Rewards, Commissions, P2P)
    const walletSub = supabase
        .channel('public:wallet_transactions')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` },
            (payload) => {
                const newTx = payload.new as any;
                // Add to list and trigger full sync to update all calculated stats (monthly rewards etc)
                useCustomerWalletStore.getState().addTransactionLocally({
                    id: newTx.id,
                    amount: Number(newTx.amount),
                    transactionType: newTx.transaction_type,
                    type: newTx.type,
                    currency: newTx.currency,
                    status: newTx.status,
                    createdAt: newTx.created_at,
                    description: newTx.description,
                    metadata: newTx.metadata
                });
                
                // Silent sync to refresh monthly rewards and balance from the server ground truth
                useCustomerWalletStore.getState().fetchWalletData(true);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            txSub.unsubscribe();
            userSub.unsubscribe();
            walletSub.unsubscribe();
        }
    };
};
