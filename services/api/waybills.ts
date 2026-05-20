import { client } from './client';

export const waybillsApi = {
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
