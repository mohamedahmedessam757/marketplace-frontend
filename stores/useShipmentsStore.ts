
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';

export interface ShipmentItem {
    name: string;
    quantity: number;
}

export interface Shipment {
    id: string;
    trackingNumber: string;
    carrier: string;
    status: 'received' | 'transit' | 'distribution' | 'out' | 'delivered';
    estimatedDelivery: string;
    origin: string;
    destination: string;
    items: ShipmentItem[];
}

interface ShipmentsState {
    shipments: Shipment[];
    loading: boolean;
    error: string | null;
    fetchShipments: () => Promise<void>;
}

export const useShipmentsStore = create<ShipmentsState>((set) => ({
    shipments: [],
    loading: false,
    error: null,

    fetchShipments: async () => {
        set({ loading: true, error: null });
        try {
            const userId = getCurrentUserId();
            console.log('[useShipmentsStore] getCurrentUserId returned:', userId);
            if (!userId) {
                console.log('[useShipmentsStore] No user ID, returning empty shipments');
                set({ shipments: [], loading: false });
                return;
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    status,
                    vehicle_make,
                    vehicle_model,
                    vehicle_year,
                    part_name,
                    updated_at
                `)
                .in('status', ['SHIPPED', 'DELIVERED'])
                .eq('customer_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            console.log('[useShipmentsStore] Query returned', data?.length, 'shipments:', data);

            // Group by order_number (Tracking Number)
            const groupedShipments: Record<string, Shipment> = {};

            (data || []).forEach((order: any) => {
                const trackingNum = order.order_number;

                if (!groupedShipments[trackingNum]) {
                    groupedShipments[trackingNum] = {
                        id: order.id, // Use first ID as group ID
                        trackingNumber: trackingNum,
                        carrier: 'Tashleh Express',
                        status: order.status === 'SHIPPED' ? 'transit' :
                            order.status === 'DELIVERED' ? 'delivered' : 'transit',
                        estimatedDelivery: new Date(new Date(order.updated_at).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                        origin: 'Central Warehouse',
                        destination: 'Customer Address',
                        items: []
                    };
                }

                groupedShipments[trackingNum].items.push({
                    name: `${order.vehicle_make} ${order.vehicle_model} ${order.part_name}`,
                    quantity: 1
                });
            });

            const realShipments = Object.values(groupedShipments);
            set({ shipments: realShipments, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    }
}));
