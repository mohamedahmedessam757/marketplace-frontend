import { client } from './client';

export const paymentsApi = {
    process: async (data: {
        orderId: string;
        offerId: string;
        card: { number: string; expiry: string; cvv: string; holder: string };
    }) => {
        const res = await client.post('/payments/process', data);
        return res.data;
    },

    createIntent: async (data: { orderId: string; offerId: string }) => {
        const res = await client.post('/payments/create-intent', data);
        return res.data;
    },
};
