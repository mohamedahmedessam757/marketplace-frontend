
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Order } from '../types';
import { getCurrentUserId } from '../utils/auth';

interface ReturnsState {
    returns: Order[];
    disputes: Order[];
    loading: boolean;
    error: string | null;

    fetchReturnsAndDisputes: () => Promise<void>;
    requestReturn: (orderId: string, reason: string) => Promise<boolean>;
    cancelReturn: (orderId: string) => Promise<boolean>;
    escalateDispute: (orderId: string, reason: string) => Promise<boolean>;
}

export const useReturnsStore = create<ReturnsState>((set, get) => ({
    returns: [],
    disputes: [],
    loading: false,
    error: null,

    fetchReturnsAndDisputes: async () => {
        set({ loading: true, error: null });
        try {
            const userId = getCurrentUserId();
            if (!userId) {
                set({ returns: [], disputes: [], loading: false });
                return;
            }

            // Fetch all orders related to returns and disputes
            const { data, error } = await supabase
                .from('orders')
                .select(`
            *,
            offers!offers_order_id_fkey(*),
            store:stores(*)
        `)
                .in('status', ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED', 'DISPUTED', 'REFUNDED'])
                .eq('customer_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            const returns: Order[] = [];
            const disputes: Order[] = [];

            (data || []).forEach((order: any) => {
                const mappedOrder = {
                    ...order,
                    offers: order.offers || [],
                    store: order.store || undefined
                };

                if (order.status === 'DISPUTED') {
                    disputes.push(mappedOrder);
                } else {
                    returns.push(mappedOrder);
                }
            });

            set({ returns, disputes, loading: false });
        } catch (err: any) {
            console.error('Error fetching returns:', err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    requestReturn: async (orderId: string, reason: string) => {
        try {
            const userId = getCurrentUserId();
            const { error } = await supabase
                .from('orders')
                .update({ status: 'RETURN_REQUESTED' })
                .eq('id', orderId);

            if (error) throw error;

            // Log the reason in audit_logs
            await supabase.from('audit_logs').insert({
                order_id: orderId,
                action: 'RETURN_REQUESTED',
                entity: 'ORDER',
                actor_type: 'CUSTOMER',
                actor_id: userId,
                reason: reason,
                new_state: 'RETURN_REQUESTED'
            });

            await get().fetchReturnsAndDisputes();
            return true;
        } catch (err) {
            console.error('Failed to request return:', err);
            return false;
        }
    },

    cancelReturn: async (orderId: string) => {
        try {
            const userId = getCurrentUserId();
            const { error } = await supabase
                .from('orders')
                .update({ status: 'DELIVERED' }) // Revert to delivered (simplified)
                .eq('id', orderId);

            if (error) throw error;

            await supabase.from('audit_logs').insert({
                order_id: orderId,
                action: 'RETURN_CANCELLED',
                entity: 'ORDER',
                actor_type: 'CUSTOMER',
                actor_id: userId,
                new_state: 'DELIVERED'
            });

            await get().fetchReturnsAndDisputes();
            return true;
        } catch (err) {
            console.error('Failed to cancel return:', err);
            return false;
        }
    },

    escalateDispute: async (orderId: string, reason: string) => {
        try {
            const userId = getCurrentUserId();
            const { error } = await supabase
                .from('orders')
                .update({ status: 'DISPUTED' })
                .eq('id', orderId);

            if (error) throw error;

            await supabase.from('audit_logs').insert({
                order_id: orderId,
                action: 'DISPUTE_ESCALATED',
                entity: 'ORDER',
                actor_type: 'CUSTOMER',
                actor_id: userId,
                reason: reason,
                new_state: 'DISPUTED'
            });

            await get().fetchReturnsAndDisputes();
            return true;
        } catch (err) {
            console.error('Failed to escalate dispute:', err);
            return false;
        }
    }
}));
