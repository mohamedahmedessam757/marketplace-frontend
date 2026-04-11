import { create } from 'zustand';
import { supabase } from '../services/supabase';

export interface Transaction {
  id: string;
  createdAt: string;
  type: string;
  transactionType: string;
  orderId?: string;
  amount: number;
  balanceAfter?: number;
  description?: string;
  payment?: {
    orderId?: string;
    order?: {
      id?: string;
      orderNumber?: string;
      status?: string;
    };
  };
}

interface MerchantWalletState {
  stats: {
    available: number;
    pending: number;
    frozen: number;
    totalSales: number;
    netEarnings: number;
    completedOrders: number;
    loyaltyTier: string;
    performanceScore: number;
    rating: number;
    storeName: string;
    referralCode?: string;
    referralCount: number;
    loyaltyPoints: number;
    pendingRewards: number;
    monthlyRewards: number;
    profitPercentage: number;
  };
  transactions: Transaction[];
  notifications: any[];
  isLoading: boolean;

  // Actions
  fetchWallet: () => Promise<void>;
}

export const useMerchantWalletStore = create<MerchantWalletState>((set) => ({
  stats: {
    available: 0,
    pending: 0,
    frozen: 0,
    totalSales: 0,
    netEarnings: 0,
    completedOrders: 0,
    loyaltyTier: 'BRONZE',
    performanceScore: 0,
    rating: 0,
    storeName: '',
    referralCount: 0,
    loyaltyPoints: 0,
    pendingRewards: 0,
    monthlyRewards: 0,
    profitPercentage: 0
  },
  transactions: [],
  notifications: [],
  isLoading: true,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const { client } = await import('../services/api/client');
      const response = await client.get('/payments/merchant/dashboard');
      const { stats, transactions, notifications } = response.data;

      set({
        stats: stats,
        transactions: transactions,
        notifications: notifications || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch merchant wallet dashboard', error);
      set({ isLoading: false });
    }
  }
}));

// Real-time subscription outside the store so we can call it where needed
let channel: ReturnType<typeof supabase.channel> | null = null;

export const subscribeToMerchantWalletUpdates = (userId: string) => {
    if (channel) {
        supabase.removeChannel(channel);
    }

    channel = supabase.channel(`merchant-wallet-${userId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` },
            payload => {
                console.log('Real-time merchant wallet update:', payload);
                useMerchantWalletStore.getState().fetchWallet();
            }
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores', filter: `owner_id=eq.${userId}` },
            payload => {
                console.log('Real-time store balance update:', payload);
                useMerchantWalletStore.getState().fetchWallet();
            }
        )
        .subscribe();

    return () => {
        if (channel) {
            supabase.removeChannel(channel);
            channel = null;
        }
    };
};
