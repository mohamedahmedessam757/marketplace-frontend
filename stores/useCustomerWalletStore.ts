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
  loyaltyPoints: number;
  loyaltyTier: string;
  referralCount: number;
  customerBalance: number;
  completedOrders: number;
  refundedAmount: number;
}

interface CustomerWalletState {
  stats: WalletStats | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  fetchWalletData: () => Promise<void>;
}

export const useCustomerWalletStore = create<CustomerWalletState>((set) => ({
  stats: null,
  transactions: [],
  isLoading: true,
  fetchWalletData: async () => {
    set({ isLoading: true });
    try {
      const { client } = await import('../services/api/client');
      const [walletRes, txRes] = await Promise.all([
        client.get('/payments/customer/wallet'),
        client.get('/payments/customer/transactions')
      ]);

      set({
        stats: walletRes.data,
        transactions: txRes.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch customer wallet data', error);
      set({ isLoading: false });
    }
  }
}));

// Setup realtime listener for wallet transactions
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';

export const subscribeToWalletUpdates = () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    return supabase
        .channel('public:payment_transactions')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'payment_transactions', filter: `customer_id=eq.${userId}` },
            () => {
                useCustomerWalletStore.getState().fetchWalletData();
            }
        )
        .subscribe();
};
