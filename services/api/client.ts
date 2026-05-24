import axios from 'axios';
import { API_URL } from './config';

export const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set multipart boundary — manual Content-Type breaks uploads
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized');
        }
        return Promise.reject(error);
    }
);
