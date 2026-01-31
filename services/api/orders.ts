import { client } from './client';

export const ordersApi = {
    // Get all orders
    getAll: async () => {
        const response = await client.get('/orders');
        return response.data;
    },

    // Get single order
    getById: async (id: string) => {
        const response = await client.get(`/orders/${id}`);
        return response.data;
    },

    // Create a new order
    // Using simple Record type here, can be stricter with shared DTO if shared
    create: async (data: any) => {
        const response = await client.post('/orders', data);
        return response.data;
    },

    // Transition order state
    transition: async (id: any, newStatus: string, reason?: string, metadata?: any) => {
        const response = await client.patch(`/orders/${id}/transition`, {
            newStatus,
            reason: reason || 'State transition via Frontend',
            metadata
        });
        return response.data;
    },

    // Get Order timeline
    getTimeline: async (id: string) => {
        // Assuming endpoint exists based on M1 docs
        const response = await client.get(`/orders/${id}/timeline`);
        // If not exists in Controller yet, this might fail, but adding for completeness
        return response.data;
    }
};
