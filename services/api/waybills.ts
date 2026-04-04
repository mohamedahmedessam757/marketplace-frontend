import { client } from './client';

export const waybillsApi = {
    // Admin issues waybills
    issue: async (orderId: string) => {
        const response = await client.post(`/waybills/issue/${orderId}`);
        return response.data;
    },

    // Get waybills for order
    getByOrder: async (orderId: string) => {
        const response = await client.get(`/waybills/order/${orderId}`);
        return response.data;
    },

    // Get specific waybill
    getById: async (id: string) => {
        const response = await client.get(`/waybills/${id}`);
        return response.data;
    }
};
