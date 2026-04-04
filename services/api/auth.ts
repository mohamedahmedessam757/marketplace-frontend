import { client } from './client';

export const authApi = {
    login: async (email: string, password: string, fingerprint?: string) => {
        const response = await client.post('/auth/login', { email, password, fingerprint });
        return response.data;
    },

    registerCustomer: async (data: any) => {
        const response = await client.post('/auth/register/customer', data);
        return response.data;
    },

    registerInit: async (data: { email: string; phone: string }) => {
        const response = await client.post('/auth/register-init', data);
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

    initiateMobileLogin: async (phone: string) => {
        const response = await client.post('/auth/mobile-login-init', { phone });
        return response.data;
    },

    sendOTP: async (email: string) => {
        const response = await client.post('/auth/otp/send', { email });
        return response.data;
    },

    verifyOTP: async (email: string, code: string) => {
        const response = await client.post('/auth/otp/verify', { email, code });
        return response.data;
    },

    verifyMobileLogin: async (phone: string, code: string, fingerprint?: string) => {
        const response = await client.post('/auth/mobile-login-verify', { phone, code, fingerprint });
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await client.post('/users/profile/update', data);
        return response.data;
    },

    // Recovery API endpoints
    requestRecoveryEmailOtp: async (email: string, role: 'customer' | 'merchant') => {
        const response = await client.post('/auth/recovery/request-email-otp', { email, role });
        return response.data;
    },

    verifyRecoveryEmailOtp: async (email: string, otp: string, role: 'customer' | 'merchant') => {
        const response = await client.post('/auth/recovery/verify-email-otp', { email, otp, role });
        return response.data;
    },

    requestRecoveryPhoneOtp: async (email: string, newPhone: string, role: 'customer' | 'merchant') => {
        const response = await client.post('/auth/recovery/request-phone-otp', { email, newPhone, role });
        return response.data;
    },

    submitRecovery: async (email: string, newPhone: string, phoneOtp: string, role: 'customer' | 'merchant') => {
        const response = await client.post('/auth/recovery/submit', { email, newPhone, phoneOtp, role });
        return response.data;
    },

    // Session Management
    getSessions: async () => {
        const response = await client.get('/auth/sessions');
        return response.data;
    },

    terminateAllSessions: async () => {
        const response = await client.delete('/auth/sessions/all');
        return response.data;
    },

    terminateSession: async (sessionId: string) => {
        const response = await client.delete(`/auth/sessions/${sessionId}`);
        return response.data;
    },

    deleteAccount: async () => {
        const response = await client.delete('/auth/me');
        return response.data;
    }
};
