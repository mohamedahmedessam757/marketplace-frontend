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
}

interface MerchantWalletState {
  balance: {
    available: number;
    pending: number;
    frozen: number;
    totalSales: number;
  };
  transactions: Transaction[];
  isLoading: boolean;

  // Actions
  fetchWallet: () => Promise<void>;
}

export const useMerchantWalletStore = create<MerchantWalletState>((set) => ({
  balance: {
    available: 0,
    pending: 0,
    frozen: 0,
    totalSales: 0
  },
  transactions: [],
  isLoading: true,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const { client } = await import('../services/api/client');
      const [walletRes, txRes] = await Promise.all([
        client.get('/payments/merchant/wallet'),
        client.get('/payments/merchant/transactions')
      ]);

      const wallet = walletRes.data;
      set({
        balance: {
          available: Number(wallet.balance) || 0,
          pending: Number(wallet.pendingBalance) || 0,
          frozen: Number(wallet.frozenBalance) || 0,
          totalSales: Number(wallet.lifetimeEarnings) || 0
        },
        transactions: txRes.data,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch merchant wallet', error);
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
