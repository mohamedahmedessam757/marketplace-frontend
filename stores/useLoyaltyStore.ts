
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';

interface LoyaltyTransaction {
    id: string;
    points: number;
    type: 'EARN' | 'REDEEM' | 'BONUS' | 'REFUND';
    description: string;
    created_at: string;
}

interface Review {
    id: string;
    store_id: string; // or store_name if joined
    rating: number;
    comment: string;
    status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
    created_at: string;
    store?: { name: string }; // For joined data
}

interface LoyaltyState {
    points: number;
    transactions: LoyaltyTransaction[];
    reviews: Review[];
    loading: boolean;
    error: string | null;
    fetchLoyaltyData: () => Promise<void>;
    redeemPoints: (amount: number, description: string) => Promise<boolean>;
}

export const useLoyaltyStore = create<LoyaltyState>((set, get) => ({
    points: 0,
    transactions: [],
    reviews: [],
    loading: false,
    error: null,

    fetchLoyaltyData: async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        set({ loading: true, error: null });
        try {
            // 1. Fetch User Points
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('loyalty_points')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            // 2. Fetch Transactions
            const { data: txData, error: txError } = await supabase
                .from('loyalty_transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (txError) throw txError;

            // 3. Fetch Reviews (Real Data)
            // Note: In real app, we would join with stores table to get store name
            // For now, we fetch raw reviews. If stores table exists, we'd use:
            // .select('*, store:stores(name)')

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (reviewsError) {
                // If reviews table doesn't exist yet (migration pending), just log and default to empty
                console.warn('Reviews table might be missing:', reviewsError.message);
            }

            set({
                points: userData.loyalty_points || 0,
                transactions: txData || [],
                reviews: reviewsData || []
            });

        } catch (error: any) {
            console.error('Error fetching loyalty data:', error);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },

    redeemPoints: async (amount: number, description: string) => {
        const userId = getCurrentUserId();
        if (!userId) return false;

        const currentPoints = get().points;
        if (currentPoints < amount) {
            set({ error: 'Insufficient points' });
            return false;
        }

        set({ loading: true, error: null });

        try {
            // 1. Deduct points
            const newBalance = currentPoints - amount;
            const { error: updateError } = await supabase
                .from('users')
                .update({ loyalty_points: newBalance })
                .eq('id', userId);

            if (updateError) throw updateError;

            // 2. Add Transaction
            const { data: tx, error: txError } = await supabase
                .from('loyalty_transactions')
                .insert([{
                    user_id: userId,
                    points: -amount,
                    type: 'REDEEM',
                    description: description
                }])
                .select()
                .single();

            if (txError) throw txError;

            // 3. Update Local State
            set(state => ({
                points: newBalance,
                transactions: [tx, ...state.transactions]
            }));

            return true;

        } catch (error: any) {
            console.error('Error redeeming points:', error);
            set({ error: error.message });
            return false;
        } finally {
            set({ loading: false });
        }
    }
}));
