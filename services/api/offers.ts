import { client } from './client';

export const offersApi = {
    create: async (data: any) => {
        const response = await client.post('/offers', data);
        return response.data;
    },

    findByOrder: async (orderId: string) => {
        const response = await client.get(`/offers/order/${orderId}`);
        return response.data;
    }
};
