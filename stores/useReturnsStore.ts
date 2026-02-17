import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Return, Dispute } from '../types';
import { getCurrentUserId } from '../utils/auth';

interface ReturnsState {
    returns: Return[];
    disputes: Dispute[];
    loading: boolean;
    error: string | null;

    fetchReturnsAndDisputes: () => Promise<void>;
    requestReturn: (orderId: string, reason: string, description: string, files: File[]) => Promise<boolean>;
    cancelReturn: (orderId: string) => Promise<boolean>;
    escalateDispute: (orderId: string, reason: string, description: string, files: File[]) => Promise<boolean>;
}

export const useReturnsStore = create<ReturnsState>((set, get) => ({
    returns: [],
    disputes: [],
    loading: false,
    error: null,

    fetchReturnsAndDisputes: async () => {
        set({ loading: true, error: null });
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const response = await fetch(`${API_URL}/returns/my-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch returns history');
            }

            const data = await response.json();

            set({
                returns: data.returns || [],
                disputes: data.disputes || [],
                loading: false
            });
        } catch (err: any) {
            console.error('Error fetching returns/disputes:', err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    requestReturn: async (orderId: string, reason: string, description: string, files: File[]) => {
        set({ loading: true, error: null });
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No authentication token found');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('reason', reason);
            formData.append('description', description);

            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append('files', file);
                });
            }

            const response = await fetch(`${API_URL}/returns/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to request return');
            }

            await get().fetchReturnsAndDisputes();
            return true;
        } catch (error: any) {
            console.error('Failed to request return:', error);
            const errorMessage = typeof error === 'object' && error.message ? error.message : 'Failed to request return';
            set({ error: errorMessage });
            return false;
        } finally {
            set({ loading: false });
        }
    },

    cancelReturn: async (orderId: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'DELIVERED' })
                .eq('id', orderId);

            if (error) throw error;

            await get().fetchReturnsAndDisputes();
            return true;
        } catch (err) {
            console.error('Failed to cancel return:', err);
            return false;
        }
    },

    escalateDispute: async (orderId: string, reason: string, description: string, files: File[]) => {
        set({ loading: true, error: null });
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No authentication token found');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('reason', reason);
            formData.append('description', description);

            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append('files', file);
                });
            }

            const response = await fetch(`${API_URL}/returns/dispute`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to escalate dispute');
            }

            await get().fetchReturnsAndDisputes();
            return true;
        } catch (error: any) {
            console.error('Failed to escalate dispute:', error);
            const errorMessage = typeof error === 'object' && error.message ? error.message : 'Failed to escalate dispute';
            set({ error: errorMessage });
            return false;
        } finally {
            set({ loading: false });
        }
    }
}));
