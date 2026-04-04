import { client } from './client';

export const ordersApi = {
    // Get all orders
    getAll: async () => {
        const response = await client.get('/orders');
        const data = response.data;
        // For vendor responses, backend wraps orders with requestingStoreId
        if (data?.requestingStoreId) {
            localStorage.setItem('merchant_store_id', data.requestingStoreId);
            return data.orders;
        }
        return data;
    },

    // Get single order
    getById: async (id: string) => {
        const response = await client.get(`/orders/${id}`);
        return response.data;
    },

    // Get assembly cart items
    getAssemblyCart: async () => {
        const response = await client.get('/orders/assembly-cart');
        return response.data;
    },

    // Get merchant assembly cart (mirror)
    getMerchantAssemblyCart: async () => {
        const response = await client.get('/orders/merchant-assembly-cart');
        return response.data;
    },

    // Request shipping for specific orders
    requestShipping: async (orderIds: string[]) => {
        const response = await client.post('/orders/request-shipping', { orderIds });
        return response.data;
    },

    // Create a new order
    // Using simple Record type here, can be stricter with shared DTO if shared
    create: async (data: any) => {
        try {
            const response = await client.post('/orders', data);
            return response.data;
        } catch (error: any) {
            console.error('Order Creation API Error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Transition order state
    transition: async (id: string, newStatus: string, reason?: string, metadata?: any) => {
        const response = await client.patch(`/orders/${id}/transition`, {
            newStatus,
            reason: reason || 'State transition via Frontend',
            metadata
        });
        return response.data;
    },

    // Mark order as Prepared
    markPrepared: async (id: string) => {
        const response = await client.patch(`/orders/${id}/prepare`);
        return response.data;
    },

    rejectOffer: async (orderId: string, offerId: string, payload: { reason: string, customReason?: string }) => {
        const response = await client.post(`/orders/${orderId}/offer/${offerId}/reject`, payload);
        return response.data;
    },

    acceptOffer: async (orderId: string, offerId: string) => {
        const response = await client.post(`/orders/${orderId}/offer/${offerId}/accept`);
        return response.data;
    },

    acceptOfferForPart: async (orderId: string, partId: string, offerId: string) => {
        const response = await client.post(`/orders/${orderId}/part/${partId}/offer/${offerId}/accept`);
        return response.data;
    },

    // Get Order timeline
    getTimeline: async (id: string) => {
        // Assuming endpoint exists based on M1 docs
        const response = await client.get(`/orders/${id}/timeline`);
        // If not exists in Controller yet, this might fail, but adding for completeness
        return response.data;
    },

    // Verification Endpoints
    submitVerification: async (id: string, payload: any) => {
        const response = await client.post(`/orders/${id}/verification`, payload);
        return response.data;
    },

    adminReviewVerification: async (id: string, payload: any) => {
        const response = await client.patch(`/orders/${id}/verification/review`, payload);
        return response.data;
    },

    submitCorrectionVerification: async (id: string, payload: any) => {
        const response = await client.post(`/orders/${id}/verification/correction`, payload);
        return response.data;
    }
};
