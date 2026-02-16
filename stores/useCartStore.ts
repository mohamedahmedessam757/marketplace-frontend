
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';

export interface CartItemType {
    id: string;
    name: string;
    price: number;
    partImage?: string;
    expiryDate: Date;
    storeName: string;
}

interface CartState {
    items: CartItemType[];
    loading: boolean;
    error: string | null;
    shippingMode: 'separate' | 'combined'; // New state
    shippingCost: number; // New state
    setShippingMode: (mode: 'separate' | 'combined') => void; // New action
    fetchCartItems: () => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    shippingMode: 'separate', // Default
    shippingCost: 0,

    setShippingMode: (mode) => {
        const items = get().items;
        // Mock calculation logic: 
        // Separate: 50 SAR per item
        // Combined: 50 SAR base + 20 SAR per extra item
        const baseRate = 50;
        const extraRate = 20;

        let cost = 0;
        if (items.length > 0) {
            if (mode === 'separate') {
                cost = items.length * baseRate;
            } else {
                cost = baseRate + ((items.length - 1) * extraRate);
            }
        }

        set({ shippingMode: mode, shippingCost: cost });
    },

    fetchCartItems: async () => {
        set({ loading: true, error: null });
        try {
            const userId = getCurrentUserId();
            console.log('[useCartStore] getCurrentUserId returned:', userId);
            if (!userId) {
                console.log('[useCartStore] No user ID, returning empty cart');
                set({ items: [], loading: false });
                return;
            }

            // Fetch orders that are ready for checkout/payment
            // Cart shows orders that have an accepted offer but not yet paid
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    part_name,
                    total_amount,
                    vehicle_make,
                    vehicle_model,
                    created_at,
                    offers_deadline_at,
                    store_id,
                    stores(name)
                `)
                .eq('status', 'AWAITING_PAYMENT')
                .eq('customer_id', userId);

            console.log('[useCartStore] Supabase query result:', { data, error });

            if (error) {
                console.error('[useCartStore] Supabase error:', error);
                throw error;
            }

            const realCartItems: CartItemType[] = (data || []).map((order: any) => ({
                id: order.id,
                name: `${order.vehicle_make} ${order.vehicle_model} - ${order.part_name}`,
                price: Number(order.total_amount) || 0,
                storeName: order.stores?.name || 'Verified Seller',
                expiryDate: new Date(order.offers_deadline_at || Date.now() + 48 * 3600 * 1000)
            }));

            console.log('[useCartStore] Mapped cart items:', realCartItems.length);

            // Recalculate shipping cost based on current mode
            const currentMode = get().shippingMode;
            const baseRate = 50;
            const extraRate = 20;
            let cost = 0;
            if (realCartItems.length > 0) {
                if (currentMode === 'separate') {
                    cost = realCartItems.length * baseRate;
                } else {
                    cost = baseRate + ((realCartItems.length - 1) * extraRate);
                }
            }

            set({ items: realCartItems, loading: false, shippingCost: cost });
        } catch (err: any) {
            console.error('[useCartStore] Error:', err);
            set({ error: err.message, loading: false, items: [] });
        }
    },

    removeFromCart: async (id: string) => {
        try {
            const { error } = await supabase.from('orders').delete().eq('id', id);
            if (error) throw error;

            set((state) => ({
                items: state.items.filter(item => item.id !== id)
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    }
}));
