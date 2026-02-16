import { create } from 'zustand';
import { StatusType } from '../components/ui/Badge';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';
import { useBillingStore } from './useBillingStore';
import { ordersApi } from '../services/api/orders';
import { supabase } from '../services/supabase';

// --- FSM CONFIGURATION (Must match Backend) ---
const TRANSITION_RULES: Record<StatusType, StatusType[]> = {
    AWAITING_OFFERS: ['AWAITING_PAYMENT', 'CANCELLED'],
    AWAITING_PAYMENT: ['PREPARATION', 'CANCELLED'],
    PREPARATION: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'RETURNED', 'DISPUTED'],
    DELIVERED: ['COMPLETED', 'RETURNED', 'DISPUTED'],
    COMPLETED: [],
    CANCELLED: [],
    RETURNED: ['COMPLETED'],
    DISPUTED: ['COMPLETED', 'RETURNED', 'REFUNDED'],
    REFUNDED: [],
    RETURN_REQUESTED: ['RETURN_APPROVED', 'DISPUTED'],
    RETURN_APPROVED: ['RETURNED'],
    RESOLVED: ['COMPLETED']
};

export const SLA_LIMITS: Partial<Record<StatusType, number>> = {
    AWAITING_OFFERS: 24,
    AWAITING_PAYMENT: 24,
    PREPARATION: 48,
    SHIPPED: 336,
    DELIVERED: 168,
    DISPUTED: 72
};

export interface OrderOffer {
    id: number;
    storeId?: string; // Store ID for vendor identification
    merchantName: string;
    storeRating: number;
    storeReviewCount: number;
    storeLogo?: string;
    storeCity?: string;
    price: number; // Final Total Price
    unitPrice: number; // Part Price only
    shippingCost: number;
    isShippingIncluded: boolean;
    condition: string;
    warranty: string;
    deliveryTime: string;
    notes?: string;
    submittedAt: string;
    offerImage?: string;
    weight?: number; // In Kg
    partType?: string; // Original, Commercial, etc.
}

export interface Order {
    id: number;
    orderNumber?: string;
    // Customer Info
    customer: {
        id: string;
        name: string;
        avatar?: string;
        email?: string;
        phone?: string;
    };

    // Merchant Info
    merchantId?: string;
    merchantName?: string;

    // Legacy Fields (Must keep for backward compatibility)
    part: string;
    car: string;
    vin?: string;
    partDescription?: string;
    partImages?: (string | File)[];

    // New Fields for Enhanced Workflow
    vehicle?: {
        make: string;
        model: string; // "Vehicle Type"
        year: string;
        vin: string;
        vinImage?: File;
    };
    parts?: {
        id: string;
        name: string;
        description: string;
        images: (string | File)[];
        video?: string | File;
        notes?: string;
    }[];
    preferences?: {
        condition: 'new' | 'used';
        warranty: boolean;
    };
    requestType?: 'single' | 'multiple';
    shippingType?: 'separate' | 'combined';

    // Status & Dates
    status: StatusType;
    date: string; // Display Date
    createdAt: string;
    updatedAt: string;
    offerAcceptedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;

    // Financials
    price?: string; // Total Price

    // Offers
    offersCount: number;
    offers?: OrderOffer[];

    // Logistics
    waybillNumber?: string;
    courier?: string;
    expectedDeliveryDate?: string;
    waybillImage?: string | File;

    // Returns
    returnWaybillNumber?: string;
    returnShippedAt?: string;
}

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    pollingInterval: any;
    subscription: any;
    lastFetchRole: string | null; // Track which role fetched the current data

    fetchOrders: () => Promise<void>;
    silentFetch: () => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
    clearOrders: () => void; // Clear orders when switching roles
    resetForRole: (role: string) => void; // Reset store if role changed
    addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'offersCount' | 'createdAt' | 'updatedAt' | 'offers'>) => Promise<void>;
    addOfferToOrder: (orderId: number, offer: Omit<OrderOffer, 'id' | 'submittedAt'>) => void;
    transitionOrder: (id: number, targetStatus: StatusType, actor?: string, metadata?: any) => Promise<{ success: boolean; message?: string }>;
    forceStatus: (id: number, status: StatusType, adminNote: string) => void;
    processPaymentWebhook: (event: 'succeeded' | 'failed' | 'refunded', orderId: number) => void;

    checkSLA: () => void;
    getOrder: (id: number) => Order | undefined;
    getValidTransitions: (currentStatus: StatusType) => StatusType[];
    updateOrderStatus: (id: number, status: StatusType) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    isLoading: false,
    error: null,
    pollingInterval: null as any, // Store interval ID
    subscription: null,
    lastFetchRole: null,

    clearOrders: () => {
        set({ orders: [], error: null, lastFetchRole: null });
    },

    resetForRole: (role: string) => {
        const { lastFetchRole, stopPolling, clearOrders } = get();
        // If role changed, reset everything
        if (lastFetchRole && lastFetchRole !== role) {
            stopPolling();
            clearOrders();
        }
        // Always set the current role for tracking
        set({ lastFetchRole: role });
    },

    startPolling: () => {
        const { pollingInterval } = get();
        if (pollingInterval) return; // Already polling

        // 1. Setup Realtime Subscription first
        const channel = supabase.channel('orders-realtime-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    console.log('🔔 Realtime Order Update Recieved');
                    get().silentFetch();
                }
            )
            .subscribe();

        // 2. Initial Fetch immediately
        get().fetchOrders();

        // 3. Start Polling (Redundancy/Backup)
        const interval = setInterval(() => {
            get().silentFetch();
        }, 10000);

        set({ pollingInterval: interval, subscription: channel });
    },

    stopPolling: () => {
        const { pollingInterval, subscription } = get();

        if (pollingInterval) {
            clearInterval(pollingInterval);
        }

        if (subscription) {
            supabase.removeChannel(subscription);
        }

        set({ pollingInterval: null, subscription: null });
    },

    silentFetch: async () => {
        const { isLoading } = get();
        if (isLoading) return; // Prevent concurrent fetches

        try {
            const data = await ordersApi.getAll();
            const mappedOrders: Order[] = data.map((o: any) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                car: `${o.vehicleMake} ${o.vehicleModel} ${o.vehicleYear}`,
                part: o.partName,
                partDescription: o.partDescription,
                partImages: o.partImages || [],
                // Ensure we map parts correctly if they exist in response
                parts: o.parts ? o.parts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    images: p.images || [],
                    video: p.video || null,
                    notes: p.notes
                })) : [],
                vin: o.vin,
                status: o.status,
                date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                offersCount: o.offers ? o.offers.length : 0,
                offers: o.offers ? o.offers.map((offer: any) => ({
                    id: offer.id,
                    storeId: offer.store?.id || offer.storeId,
                    merchantName: offer.store?.name || 'Unknown Store',
                    storeRating: offer.store?.rating || 0,
                    storeReviewCount: offer.store?._count?.reviews || 0,
                    storeLogo: offer.store?.logo || null,
                    storeCity: offer.store?.city || 'Saudi Arabia',

                    // Price Logic
                    price: Number(offer.finalPrice || (Number(offer.unitPrice) + Number(offer.shippingCost || 0) + Number(offer.commission || 0))),
                    shippingCost: Number(offer.shippingCost || 0),
                    isShippingIncluded: Number(offer.shippingCost || 0) === 0,

                    condition: offer.condition || 'Used',
                    warranty: offer.hasWarranty ? (offer.warrantyDuration || 'Yes') : 'No',
                    deliveryTime: offer.deliveryDays || 'N/A',
                    notes: offer.notes,
                    submittedAt: offer.createdAt,
                    offerImage: offer.offerImage,
                    weight: offer.weight || 0,
                    partType: offer.partType || 'Original'
                })) : [],
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                customer: o.customer,
                price: o.acceptedOffer ? o.acceptedOffer.unitPrice : null,
                merchantName: o.acceptedOffer?.store?.name || null,
            }));

            // Only update if difference? safely just set for now since React handles diffing.
            set({ orders: mappedOrders, error: null });
        } catch (err) {
            // Silently fail on poll error (don't break UI)
            console.error('Polling failed', err);
        }
    },

    fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await ordersApi.getAll();
            // Transform Backend Data to Frontend Interface
            const mappedOrders: Order[] = data.map((o: any) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                car: `${o.vehicleMake} ${o.vehicleModel} ${o.vehicleYear}`,
                part: o.partName,
                partDescription: o.partDescription,
                partImages: o.partImages || [],
                // Ensure we map parts correctly if they exist in response
                parts: o.parts ? o.parts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    images: p.images || [],
                    video: p.video || null,
                    notes: p.notes
                })) : [],
                vin: o.vin,
                status: o.status,
                date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                offersCount: o.offers ? o.offers.length : 0,
                offers: o.offers ? o.offers.map((offer: any) => ({
                    id: offer.id,
                    storeId: offer.store?.id || offer.storeId,
                    merchantName: offer.store?.name || 'Unknown Store',
                    storeRating: offer.store?.rating || 0,
                    storeReviewCount: offer.store?._count?.reviews || 0,
                    storeLogo: offer.store?.logo || null,
                    storeCity: offer.store?.city || 'Saudi Arabia',

                    // Price Logic
                    price: Number(offer.finalPrice || (Number(offer.unitPrice) + Number(offer.shippingCost || 0) + Number(offer.commission || 0))),
                    shippingCost: Number(offer.shippingCost || 0),
                    isShippingIncluded: Number(offer.shippingCost || 0) === 0,

                    condition: offer.condition || 'Used',
                    warranty: offer.hasWarranty ? (offer.warrantyDuration || 'Yes') : 'No',
                    deliveryTime: offer.deliveryDays || 'N/A',
                    notes: offer.notes,
                    submittedAt: offer.createdAt,
                    offerImage: offer.offerImage,
                    weight: offer.weight || 0,
                    partType: offer.partType || 'Original'
                })) : [],
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                customer: o.customer,
                // Ensure price/merchant are mapped if available (from accepted offer?)
                price: o.acceptedOffer ? o.acceptedOffer.unitPrice : null,
                merchantName: o.acceptedOffer?.store?.name || null,
            }));
            set({ orders: mappedOrders, isLoading: false });
        } catch (err) {
            set({ error: 'Failed to fetch orders', isLoading: false });
        }
    },

    addOrder: async (newOrderData) => {
        // Basic Parsing of "Car" string: "Toyota Camry 2023"
        const parts = newOrderData.car.split(' ');
        const year = parseInt(parts[parts.length - 1]);
        const make = parts[0] || 'Unknown';
        const model = parts.slice(1, parts.length - 1).join(' ') || 'Unknown';

        try {
            const backendPayload = {
                vehicleMake: make,
                vehicleModel: model,
                vehicleYear: isNaN(year) ? 2024 : year,
                partName: newOrderData.part,
                vin: newOrderData.vin
            };

            await ordersApi.create(backendPayload);
            // Refresh orders
            await get().fetchOrders();

            // Audit logging is handled by backend
            // useAuditStore.getState().logAction(...);

        } catch (err) {
            console.error('Failed to create order', err);
        }
    },

    addOfferToOrder: (orderId, offerData) => {
        // Mock Implementation for now as Phase 4 didn't cover Offers API fully yet
        set((state) => ({
            orders: state.orders.map(o => {
                // Compare as string/number safely
                // @ts-ignore
                if (o.id != orderId) return o;
                return {
                    ...o,
                    status: o.status === 'AWAITING_OFFERS' ? 'AWAITING_PAYMENT' : o.status,
                    offersCount: o.offersCount + 1,
                    offers: [...o.offers, { ...offerData, id: Date.now(), submittedAt: new Date().toISOString() }]
                };
            })
        }));
    },

    transitionOrder: async (id, targetStatus, actor = 'SYSTEM', metadata = {}) => {
        // Optimistic Update or Wait? Let's wait for API
        try {
            await ordersApi.transition(id, targetStatus, JSON.stringify(metadata));

            set((state) => ({
                orders: state.orders.map(o => {
                    // @ts-ignore
                    if (o.id != id) return o;
                    const now = new Date().toISOString();
                    return { ...o, status: targetStatus, updatedAt: now };
                })
            }));

            return { success: true };
        } catch (err: any) {
            console.error(err);
            return { success: false, message: err.response?.data?.message || 'Transition Failed' };
        }
    },

    forceStatus: (id, status, adminNote) => {
        // Admin Force - Call transition with special flag if backend supports, 
        // or just normal transition for now.
        get().transitionOrder(id, status, 'ADMIN_FORCE', { note: adminNote });
    },

    processPaymentWebhook: (event, orderId) => {
        // Implementation pending Stripe Backend
    },

    checkSLA: () => {
        // ... keep existing logic
    },

    getOrder: (id) => get().orders.find(o => o.id.toString() === id.toString()),
    getValidTransitions: (status) => TRANSITION_RULES[status] || [],
    updateOrderStatus: (id, status) => get().transitionOrder(id, status, 'LEGACY_CALL')
}));
