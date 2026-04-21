import { create } from 'zustand';
import { StatusType } from '../components/ui/Badge';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';
import { useBillingStore } from './useBillingStore';
import { ordersApi } from '../services/api/orders';
import { supabase } from '../services/supabase';

// Module-level debounce timer to prevent realtime spam and race conditions with DB transactions
let realtimeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const REALTIME_DEBOUNCE_MS = 1500;

// --- FSM CONFIGURATION (Must match Backend) ---
const TRANSITION_RULES: Record<StatusType, StatusType[]> = {
    AWAITING_OFFERS: ['AWAITING_PAYMENT', 'CANCELLED'],
    AWAITING_PAYMENT: ['PREPARATION', 'CANCELLED'],
    PREPARATION: ['PREPARED', 'DELAYED_PREPARATION', 'CANCELLED'],
    PREPARED: ['VERIFICATION', 'SHIPPED', 'CANCELLED'],
    VERIFICATION: ['VERIFICATION_SUCCESS', 'NON_MATCHING', 'CANCELLED'],
    VERIFICATION_SUCCESS: ['READY_FOR_SHIPPING', 'CANCELLED'],
    READY_FOR_SHIPPING: ['SHIPPED', 'CANCELLED'],
    NON_MATCHING: ['CORRECTION_PERIOD', 'CANCELLED'],
    CORRECTION_PERIOD: ['CORRECTION_SUBMITTED', 'CANCELLED'],
    CORRECTION_SUBMITTED: ['VERIFICATION_SUCCESS', 'NON_MATCHING', 'CANCELLED'],
    DELAYED_PREPARATION: ['PREPARED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'RETURNED', 'DISPUTED'],
    DELIVERED: ['COMPLETED', 'RETURNED', 'DISPUTED'],
    COMPLETED: [],
    CANCELLED: [],
    RETURNED: ['COMPLETED'],
    DISPUTED: ['COMPLETED', 'RETURNED', 'REFUNDED'],
    REFUNDED: [],
    RETURN_REQUESTED: ['RETURN_APPROVED', 'DISPUTED'],
    RETURN_APPROVED: ['RETURNED'],
    RESOLVED: ['COMPLETED'],
    // Shipment Detailed Statuses (Read-only or transition via logistics system)
    RECEIVED_AT_HUB: [],
    QUALITY_CHECK_PASSED: [],
    PACKAGED_FOR_SHIPPING: [],
    AWAITING_CARRIER_PICKUP: [],
    PICKED_UP_BY_CARRIER: [],
    IN_TRANSIT_TO_DESTINATION: [],
    ARRIVED_AT_LOCAL_FACILITY: [],
    CUSTOMS_CLEARANCE: [],
    AT_LOCAL_WAREHOUSE: [],
    OUT_FOR_DELIVERY: [],
    DELIVERY_ATTEMPTED: [],
    DELIVERED_TO_CUSTOMER: [],
    RETURN_TO_SENDER_INITIATED: [],
    RETURNED_TO_SENDER: []
};

export const SLA_LIMITS: Partial<Record<StatusType, number>> = {
    AWAITING_OFFERS: 24,
    AWAITING_PAYMENT: 24, // 24 hours to pay
    PREPARATION: 48,      // 48 hours to prepare
    DELAYED_PREPARATION: 24, // 24 extra hours to prepare (Penalty period)
    SHIPPED: 72,          // 3 days to deliver
    DELIVERED: 72,
    DISPUTED: 72
};

export interface OrderOffer {
    id: string;
    offerNumber?: string;
    storeId?: string; // Store ID for vendor identification
    storeCode?: string; // Store unit code D-XXXX
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
    status?: string; // pending | accepted | rejected
    offerImage?: string;
    weight?: number; // In Kg
    partType?: string; // Original, Commercial, etc.
    orderPartId?: string; // Links to specific part
    partName?: string; // Part name for display
}

export interface Order {
    id: string;
    orderNumber?: string;
    // Customer Info
    customer: {
        id: string;
        name: string;
        customerCode?: string; // ADDED
        avatar?: string;
        email?: string;
        phone?: string;
    };

    // Merchant Info
    merchantId?: string;
    merchantName?: string;

    // Admin Features
    adminNotes?: string;

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
    conditionPref?: 'new' | 'used' | string;
    warrantyPreferred?: boolean;

    // Status & Dates
    status: StatusType;
    date: string; // Display Date
    createdAt: string;
    updatedAt: string;
    paymentDeadlineAt?: string;
    delayedPreparationDeadlineAt?: string;
    payments?: any[];
    offerAcceptedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;

    // Financials
    price?: number; // Total Price

    // Offers
    offersCount: number;
    offers?: OrderOffer[];
    acceptedOffer?: OrderOffer; // Back-compat: First accepted offer
    acceptedOffers?: OrderOffer[]; // New: List of all accepted/paid offers
    _count?: {
        offers?: number;
    };

    // Verification
    verificationDocuments?: any[];
    verificationSubmittedAt?: string;
    correctionDeadlineAt?: string;

    // Logistics
    waybillNumber?: string;
    courier?: string;
    expectedDeliveryDate?: string;
    waybillImage?: string | File;
    shipments?: any[];
    shippingWaybills?: any[];
    invoices?: any[];

    // Returns
    returnWaybillNumber?: string;
    returnShippedAt?: string;

    // Review
    review?: any;
}

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    isFetchingMore: boolean;
    error: string | null;
    subscription: any;
    lastFetchRole: string | null;
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;

    fetchOrders: (params?: { search?: string; status?: string; page?: number; retry?: number }) => Promise<void>;
    fetchMoreOrders: (params?: { search?: string; status?: string }) => Promise<void>;
    silentFetch: () => Promise<void>;
    mapBackendOrders: (items: any[]) => Order[];
    startRealtime: (userId?: string, role?: string) => void;
    stopRealtime: () => void;
    clearOrders: () => void;
    resetForRole: (role: string) => void;
    addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'offersCount' | 'createdAt' | 'updatedAt' | 'offers'>) => Promise<void>;
    addOfferToOrder: (orderId: string, offer: Omit<OrderOffer, 'id'>) => void;
    acceptOffer: (orderId: string, partId: string, offerId: string) => Promise<void>;
    rejectOffer: (orderId: string, offerId: string, reason: string, customReason?: string) => Promise<void>;
    transitionOrder: (id: string, targetStatus: StatusType, actor?: string, metadata?: any) => Promise<{ success: boolean; message?: string }>;
    forceStatus: (id: string, status: StatusType, adminNote: string) => void;
    processPaymentWebhook: (event: 'succeeded' | 'failed' | 'refunded', orderId: string) => void;

    checkSLA: () => void;
    getOrder: (id: string) => Order | undefined;
    getValidTransitions: (currentStatus: StatusType) => StatusType[];
    updateOrderStatus: (id: string, status: StatusType) => void;
    adminUpdateOffer: (offerId: string, updateDto: any) => Promise<void>;
    adminDeleteOffer: (offerId: string) => Promise<void>;
    updateAdminNotes: (orderId: string, notes: string) => Promise<void>;
    confirmOrderReceived: (id: string, note?: string) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    isLoading: false,
    isFetchingMore: false,
    error: null,
    subscription: null,
    lastFetchRole: null,
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,

    clearOrders: () => {
        set({ 
            orders: [], 
            error: null, 
            lastFetchRole: null, 
            page: 1, 
            total: 0, 
            hasMore: false,
            isFetchingMore: false 
        });
    },

    resetForRole: (role: string) => {
        const { lastFetchRole, stopRealtime, clearOrders } = get();
        // If role changed, reset everything
        if (lastFetchRole && lastFetchRole !== role) {
            stopRealtime();
            clearOrders();
        }
        // Always set the current role for tracking
        set({ lastFetchRole: role });
    },

    startRealtime: (userId?: string, role?: string) => {
        const { subscription } = get();
        if (subscription) return; // Already listening

        let filterString: string | undefined = undefined;
        if (userId && role === 'customer') {
            filterString = `customer_id=eq.${userId}`;
        }
        // For admin and merchants, we listen globally or via backend API constraints, 
        // relying on the API fetch to securely filter the records after the ping.

        // 1. Setup Realtime Subscription first
        const handleRealtimeEvent = (source: string) => {
            console.log(`⚡ Realtime Update: ${source} changed. Debouncing fetch...`);
            if (realtimeDebounceTimer) clearTimeout(realtimeDebounceTimer);
            realtimeDebounceTimer = setTimeout(() => {
                get().silentFetch();
            }, REALTIME_DEBOUNCE_MS);
        };

        const channel = supabase.channel(`orders-realtime-${userId || 'global'}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders', filter: filterString },
                () => handleRealtimeEvent('orders table')
            )
            .subscribe();

        // 2. Initial Fetch immediately
        get().fetchOrders();

        // Also listen to offers table for real-time offer status changes
        const offersChannel = supabase.channel(`offers-realtime-${userId || 'global'}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
                handleRealtimeEvent('offers table');
            })
            .subscribe();

        set({ subscription: { ordersChannel: channel, offersChannel } });
    },

    stopRealtime: () => {
        const { subscription } = get();
        if (subscription) {
            if (subscription.ordersChannel) supabase.removeChannel(subscription.ordersChannel);
            if (subscription.offersChannel) supabase.removeChannel(subscription.offersChannel);
        }
        set({ subscription: null });
    },

    fetchOrders: async (params = {}) => {
        const { search, status, page = 1 } = params;
        set({ isLoading: true, error: null });

        try {
            const result = await ordersApi.getAll({ 
                page, 
                limit: get().limit, 
                search, 
                status 
            });

            const mappedOrders = get().mapBackendOrders(result.items);

            set({
                orders: mappedOrders,
                total: result.total,
                page: result.page || page,
                hasMore: result.hasMore,
                isLoading: false
            });
        } catch (err: any) {
            set({ 
                error: err.response?.data?.message || 'Failed to fetch orders', 
                isLoading: false 
            });
        }
    },

    fetchMoreOrders: async (params = {}) => {
        const { isLoading, isFetchingMore, hasMore, page, limit, orders } = get();
        if (isLoading || isFetchingMore || !hasMore) return;

        set({ isFetchingMore: true });

        try {
            const nextPage = page + 1;
            const result = await ordersApi.getAll({ 
                page: nextPage, 
                limit, 
                ...params 
            });

            const newMappedOrders = get().mapBackendOrders(result.items);

            set({
                orders: [...orders, ...newMappedOrders],
                total: result.total,
                page: nextPage,
                hasMore: result.hasMore,
                isFetchingMore: false
            });
        } catch (err) {
            console.error('Fetch more failed', err);
            set({ isFetchingMore: false });
        }
    },

    silentFetch: async () => {
        const { isLoading, isFetchingMore, page, limit } = get();
        if (isLoading || isFetchingMore) return;

        try {
            // Re-fetch everything up to current page to ensure consistency?
            // For now, just refresh the current visible set (page 1 to current)
            // But usually, silentFetch only refreshes page 1 if it's a "New Items" check.
            // Strategic choice: Refresh only page 1 for now to identify if list changed.
            const result = await ordersApi.getAll({ page: 1, limit: page * limit });
            const mappedOrders = get().mapBackendOrders(result.items);
            set({ orders: mappedOrders, total: result.total, hasMore: result.hasMore });
        } catch (err) {
            console.error('Silent fetch failed', err);
        }
    },

    // Extracted mapping logic for reuse
    mapBackendOrders: (items: any[]): Order[] => {
        return items.map((o: any) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                car: `${o.vehicleMake} ${o.vehicleModel} ${o.vehicleYear}`,
                part: o.partName,
                partDescription: o.partDescription,
                partImages: o.partImages || [],
                parts: o.parts ? o.parts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    images: p.images || [],
                    video: p.video || null,
                    notes: p.notes
                })) : [],
                vin: o.vin,
                requestType: o.requestType,
                shippingType: o.shippingType,
                conditionPref: typeof o.conditionPref === 'string' ? o.conditionPref.trim() : o.conditionPref,
                warrantyPreferred: o.warrantyPreferred,
                preferences: {
                    condition: o.conditionPref === 'new' ? 'new' : 'used',
                    warranty: !!o.warrantyPreferred
                },
                vehicle: {
                    make: o.vehicleMake,
                    model: o.vehicleModel,
                    year: o.vehicleYear,
                    vin: o.vin,
                    vinImage: o.vinImage
                },
                status: o.status,
                date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                offersCount: o.offers ? o.offers.length : 0,
                offers: o.offers ? o.offers.map((offer: any) => ({
                    id: offer.id,
                    offerNumber: offer.offerNumber || 'N/A',
                    storeId: offer.store?.id || offer.storeId,
                    storeCode: offer.store?.storeCode || offer.storeCode || 'N/A',
                    merchantName: offer.store?.name || 'Unknown Store',
                    storeRating: offer.store?.rating || 0,
                    storeReviewCount: offer.store?._count?.reviews || 0,
                    storeLogo: offer.store?.logo || null,
                    storeCity: offer.store?.city || 'Saudi Arabia',
                    price: (() => {
                        const base = Number(offer.unitPrice || 0);
                        const shipping = Number(offer.shippingCost || 0);
                        const percentCommission = Math.round(base * 0.25);
                        const commission = base > 0 ? Math.max(percentCommission, 100) : 0;
                        return base + shipping + commission;
                    })(),
                    unitPrice: Number(offer.unitPrice || 0),
                    shippingCost: Number(offer.shippingCost || 0),
                    isShippingIncluded: Number(offer.shippingCost || 0) === 0,
                    condition: offer.condition || 'used',
                    warranty: offer.hasWarranty ? (offer.warrantyDuration || 'yes') : 'no',
                    deliveryTime: offer.deliveryDays || 'N/A',
                    notes: offer.notes,
                    submittedAt: offer.createdAt,
                    status: offer.status || 'pending',
                    offerImage: offer.offerImage,
                    weight: Number(offer.weightKg || offer.weight || 0),
                    partType: offer.partType || 'original',
                    orderPartId: offer.orderPartId || offer.order_part_id || null
                })) : [],
                createdAt: o.createdAt,
                updatedAt: o.updatedAt,
                customer: o.customer ? {
                    ...o.customer,
                    customerCode: o.customer.id ? `CUS-${o.customer.id.substring(0, 6).toUpperCase()}` : undefined
                } : undefined,
                price: (() => {
                    const allAccepted = o.offers?.filter((of: any) => ['ACCEPTED', 'COMPLETED', 'SHIPPED', 'DELIVERED'].includes(String(of.status).toUpperCase())) || [];
                    if (allAccepted.length > 0) {
                        return allAccepted.reduce((total: number, of: any) => {
                            const base = Number(of.unitPrice || 0);
                            const shipping = Number(of.shippingCost || 0);
                            const percentCommission = Math.round(base * 0.25);
                            const commission = base > 0 ? Math.max(percentCommission, 100) : 0;
                            return total + base + shipping + commission;
                        }, 0);
                    }
                    return null;
                })(),
                merchantName: o.offers?.find((of: any) => ['ACCEPTED', 'COMPLETED', 'SHIPPED', 'DELIVERED'].includes(String(of.status).toUpperCase()))?.store?.name || null,
                acceptedOffer: o.offers?.find((of: any) => ['ACCEPTED', 'COMPLETED', 'SHIPPED', 'DELIVERED'].includes(String(of.status).toUpperCase())),
                acceptedOffers: o.offers?.filter((of: any) => ['ACCEPTED', 'COMPLETED', 'SHIPPED', 'DELIVERED'].includes(String(of.status).toUpperCase())),
                verificationDocuments: o.verificationDocuments || [],
                verificationSubmittedAt: o.verificationSubmittedAt,
                correctionDeadlineAt: o.correctionDeadlineAt,
                shipments: o.shipments || [],
                shippingWaybills: o.shippingWaybills || [],
                invoices: o.invoices || [],
            }));
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

    addOfferToOrder: (orderId: string, offerData) => {
        // Add offer to order — does NOT change status. Only customer accepting changes status.
        set((state) => ({
            orders: state.orders.map(o => {
                if (o.id !== orderId) return o;
                return {
                    ...o,
                    // Increment the count properties so the UI registers the new total immediately
                    offersCount: (o.offersCount || o._count?.offers || 0) + 1,
                    _count: {
                        ...o._count,
                        offers: (o._count?.offers || o.offersCount || 0) + 1
                    },
                    offers: [...(o.offers || []), { id: `TMP-${Date.now()}`, submittedAt: new Date().toISOString(), ...offerData }]
                };
            })
        }));
    },

    rejectOffer: async (orderId: string, offerId: string, reason: string, customReason?: string) => {
        // Optimistic UI Update first
        set((state) => ({
            orders: state.orders.map(o => {
                if (o.id !== orderId) return o;
                return {
                    ...o,
                    offers: o.offers?.map(offer =>
                        offer.id === offerId ? { ...offer, status: 'rejected' } : offer
                    )
                };
            })
        }));

        try {
            await ordersApi.rejectOffer(orderId, offerId, { reason, customReason });
        } catch (error) {
            console.error("Failed to reject offer", error);
            await get().silentFetch();
        }
    },

    acceptOffer: async (orderId: string, partId: string, offerId: string) => {
        // Optimistic update
        set((state) => ({
            orders: state.orders.map(o => {
                if (o.id !== orderId) return o;
                return {
                    ...o,
                    offers: o.offers?.map(offer => {
                        if (offer.id === offerId) return { ...offer, status: 'accepted' };
                        if (offer.orderPartId === partId && offer.id !== offerId && offer.status !== 'rejected') return { ...offer, status: 'rejected' };
                        return offer;
                    })
                };
            })
        }));

        try {
            await ordersApi.acceptOfferForPart(orderId, partId, offerId);
            setTimeout(() => { get().silentFetch(); }, 2000);
        } catch (error) {
            console.error("Failed to accept offer", error);
            await get().silentFetch();
            throw error;
        }
    },

    transitionOrder: async (id, targetStatus, actor = 'SYSTEM', metadata = {}) => {
        // Optimistic Update or Wait? Let's wait for API
        try {
            await ordersApi.transition(id, targetStatus, JSON.stringify(metadata));

            set((state) => ({
                orders: state.orders.map(o => {
                    if (o.id !== id) return o;
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

    processPaymentWebhook: (event, orderId: string) => {
        // Implementation pending Stripe Backend
    },

    checkSLA: () => {
        // ... keep existing logic
    },

    getOrder: (id: string) => get().orders.find(o => String(o.id) === String(id)),
    getValidTransitions: (status) => TRANSITION_RULES[status] || [],
    updateOrderStatus: (id: string, status: StatusType) => get().transitionOrder(id, status, 'LEGACY_CALL'),

    adminUpdateOffer: async (offerId, updateDto) => {
        const token = localStorage.getItem('access_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/offers/admin/${offerId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateDto)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update offer by admin');
        }
        await get().silentFetch(); // Refresh orders after update
    },

    adminDeleteOffer: async (offerId) => {
        const token = localStorage.getItem('access_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/offers/admin/${offerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to delete offer by admin');
        }
        await get().silentFetch(); // Refresh orders after deletion
    },

    updateAdminNotes: async (orderId, notes) => {
        // Optimistic Update for real-time feel
        set((state) => ({
            orders: state.orders.map(o => String(o.id) === String(orderId) ? { ...o, adminNotes: notes } : o)
        }));

        const token = localStorage.getItem('access_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/orders/admin/${orderId}/notes`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ notes })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update admin notes');
        }
        await get().silentFetch(); // Refresh orders
    },

    confirmOrderReceived: async (id: string, note?: string) => {
        // 1. Optimistic UI Update
        const previousOrders = get().orders;
        set((state) => ({
            orders: state.orders.map(o => String(o.id) === String(id) ? { ...o, status: 'DELIVERED', updatedAt: new Date().toISOString() } : o)
        }));

        try {
            await ordersApi.confirmDelivery(id, note);
            
            // 2. Trigger a sync fetch after small delay to let DB propagate
            setTimeout(() => { get().silentFetch(); }, 2000);
            return true;
        } catch (error) {
            console.error('Failed to confirm delivery', error);
            // 3. Revert on failure
            set({ orders: previousOrders });
            return false;
        }
    }
}));
