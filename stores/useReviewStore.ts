import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { getCurrentUserId } from '../utils/auth';

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  storeId: string;
  rating: number;
  comment: string;
  adminStatus: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  createdAt: string;
  store?: { name: string };
  customer?: { name: string; avatar?: string };
}

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  fetchAdminReviews: () => Promise<void>;
  fetchMerchantReviews: () => Promise<void>;
  submitReview: (data: { orderId: string; storeId: string; rating: number; comment: string }) => Promise<boolean>;
  updateReviewStatus: (id: string, status: 'PENDING' | 'PUBLISHED' | 'REJECTED') => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,

  fetchAdminReviews: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      set({ reviews: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMerchantReviews: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/merchant`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      set({ reviews: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  submitReview: async (data) => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to submit review');
      }

      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateReviewStatus: async (id, status) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      // Update local state
      set(state => ({
        reviews: state.reviews.map(r => r.id === id ? { ...r, adminStatus: status } : r)
      }));
    } catch (error: any) {
      console.error(error.message);
    }
  }
}));
