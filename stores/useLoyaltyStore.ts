
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';
import { io, Socket } from 'socket.io-client';

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
    loyaltyPoints: number; // 2026 Field
    tier: 'BASIC' | 'SILVER' | 'GOLD' | 'VIP' | 'PARTNER';
    totalSpent: number;
    referralCode: string;
    referralCount: number; // 2026 Field
    transactions: LoyaltyTransaction[];
    reviews: Review[];
    loading: boolean;
    error: string | null;
    socket: Socket | null;
    initSocket: () => void;
    fetchLoyaltyData: () => Promise<void>;
    redeemPoints: (amount: number, description: string) => Promise<boolean>;
    disconnectSocket: () => void;
}

export const useLoyaltyStore = create<LoyaltyState>((set, get) => ({
    points: 0,
    loyaltyPoints: 0,
    tier: 'BASIC',
    totalSpent: 0,
    referralCode: '',
    referralCount: 0,
    transactions: [],
    reviews: [],
    loading: false,
    error: null,
    socket: null,

    initSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket) return;

        const userId = getCurrentUserId();
        if (!userId) return;

        const newSocket = io(`${import.meta.env.VITE_API_URL}/loyalty`, {
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Connected to Loyalty WebSockets');
            newSocket.emit('joinLoyalty', { targetId: userId, role: 'CUSTOMER' });
        });

        newSocket.on('loyaltyUpdated', (data: any) => {
            console.log('Real-time loyalty update:', data);
            set(state => ({
                tier: data.tier || state.tier,
                totalSpent: data.totalSpent !== undefined ? data.totalSpent : state.totalSpent,
                loyaltyPoints: data.loyaltyPoints !== undefined ? data.loyaltyPoints : state.loyaltyPoints,
                points: data.loyaltyPoints !== undefined ? data.loyaltyPoints : state.points
            }));
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    fetchLoyaltyData: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Initialize WebSockets when data is fetched
        get().initSocket();

        set({ loading: true, error: null });
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/loyalty/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch loyalty data');
            const data = await response.json();

            set({
                tier: data.loyaltyTier || 'BASIC',
                loyaltyPoints: data.loyaltyPoints || 0,
                totalSpent: Number(data.totalSpent) || 0,
                referralCode: data.referralCode || '',
                referralCount: data.referralCount || 0,
                reviews: data.submittedReviews || []
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

