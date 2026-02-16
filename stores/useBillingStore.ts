
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Order } from '../types';
import { getCurrentUserId } from '../utils/auth';

interface Invoice extends Order {
    invoice_number: string;
    shipping_bill_number: string;
}

export interface SavedCard {
    id: string;
    last4: string;
    brand: string;
    expiry_month: number;
    expiry_year: number;
    is_default: boolean;
    card_holder_name?: string;
}

interface BillingState {
    invoices: Invoice[];
    cards: SavedCard[];
    walletBalance: number;
    loading: boolean;
    error: string | null;

    fetchInvoices: () => Promise<void>;
    fetchWallet: () => Promise<void>;
    fetchCards: () => Promise<void>;
    addCard: (card: Omit<SavedCard, 'id' | 'is_default'>) => Promise<void>;
    deleteCard: (id: string) => Promise<void>;
    setDefaultCard: (id: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
    invoices: [],
    cards: [],
    walletBalance: 0,
    loading: false,
    error: null,

    fetchInvoices: async () => {
        set({ loading: true });
        try {
            const userId = getCurrentUserId();
            if (!userId) {
                set({ invoices: [], loading: false });
                return;
            }

            // Invoices are essentially Completed/Paid orders
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    offers!fk_orders_accepted_offer(*),
                    store:stores(*)
                `)
                .in('status', ['COMPLETED', 'DELIVERED', 'SHIPPED'])
                .eq('customer_id', userId)
                .order('created_at', { ascending: false });

            // Note: Adjusted offers foreign key based on schema (fk_orders_accepted_offer)

            if (error) {
                // Fallback for foreign key name if changed
                console.warn('Billing fetch error (first attempt):', error);
            }

            const mappedInvoices = (data || []).map((order: any) => ({
                ...order,
                invoice_number: `INV-${order.order_number}`,
                shipping_bill_number: `SHP-${order.order_number}`,
                offers: order.offers ? [order.offers] : [],
                store: order.store || undefined
            }));

            set({ invoices: mappedInvoices });
        } catch (err: any) {
            console.error('Error fetching invoices:', err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    fetchWallet: async () => {
        // Future: Fetch wallet balance from transactions table
        set({ walletBalance: 0 });
    },

    fetchCards: async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('user_cards')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false });

            if (error) throw error;
            set({ cards: data || [] });
        } catch (err: any) {
            console.error('Error fetching cards:', err);
            // Don't set global error to avoid blocking UI
        } finally {
            set({ loading: false });
        }
    },

    addCard: async (cardData) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        set({ loading: true });
        try {
            // Check if it's the first card (make default)
            const isFirst = get().cards.length === 0;

            const { data, error } = await supabase
                .from('user_cards')
                .insert([{
                    user_id: userId,
                    ...cardData,
                    is_default: isFirst
                }])
                .select()
                .single();

            if (error) throw error;

            set((state) => ({
                cards: [...state.cards, data]
            }));
        } catch (err: any) {
            set({ error: err.message });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    deleteCard: async (id) => {
        try {
            const { error } = await supabase
                .from('user_cards')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                cards: state.cards.filter(c => c.id !== id)
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    setDefaultCard: async (id) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        try {
            // Transaction-like logic to unset others and set new default
            // Supabase doesn't support complex transactions via client easily, so we do two updates
            await supabase
                .from('user_cards')
                .update({ is_default: false })
                .eq('user_id', userId);

            const { error } = await supabase
                .from('user_cards')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                cards: state.cards.map(c => ({
                    ...c,
                    is_default: c.id === id
                }))
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    }
}));
