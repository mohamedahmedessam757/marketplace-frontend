import { client } from './client';

export const authApi = {
    login: async (email: string, password: string) => {
        const response = await client.post('/auth/login', { email, password });
        return response.data;
    },

    registerCustomer: async (data: any) => {
        const response = await client.post('/auth/register/customer', data);
        return response.data;
    },

    registerVendor: async (data: any) => {
        const response = await client.post('/auth/register/vendor', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await client.get('/auth/profile');
        return response.data;
    },

    sendOTP: async (email: string) => {
        const response = await client.post('/auth/otp/send', { email });
        return response.data;
    },

    verifyOTP: async (email: string, code: string) => {
        const response = await client.post('/auth/otp/verify', { email, code });
        return response.data;
    }
};
