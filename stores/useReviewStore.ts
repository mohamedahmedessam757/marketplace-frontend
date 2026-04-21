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
  customerCode: string; // From backend transformation
  store?: { name: string };
  customer?: { id: string; name: string; avatar?: string };
  order?: { orderNumber: string };
}

export interface RatingImpactRule {
  id: string;
  minRating: number;
  maxRating: number;
  actionType: string;
  actionLabelAr: string;
  actionLabelEn: string;
  suspendDurationDays?: number;
  isActive: boolean;
  createdAt: string;
}

interface ReviewState {
  reviews: Review[];
  impactRules: RatingImpactRule[];
  merchantStats: {
    averageRating: number;
    totalReviews: number;
    publishedCount: number;
    satisfaction: number;
    reputationGrowth: number;
    storeRank: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchAdminReviews: () => Promise<void>;
  fetchMerchantReviews: () => Promise<void>;
  fetchMerchantStats: () => Promise<void>;
  submitReview: (data: { orderId: string; storeId: string; rating: number; comment: string }) => Promise<boolean>;
  updateReviewStatus: (id: string, status: 'PENDING' | 'PUBLISHED' | 'REJECTED') => Promise<void>;
  
  // Rating Impact Rules
  fetchImpactRules: () => Promise<void>;
  createImpactRule: (data: Partial<RatingImpactRule>) => Promise<boolean>;
  updateImpactRule: (id: string, data: Partial<RatingImpactRule>) => Promise<boolean>;
  deleteImpactRule: (id: string) => Promise<boolean>;

  // Real-time
  reviewsSubscription: any;
  subscribeToMerchantReviews: (storeId: string) => void;
  subscribeToAdminReviews: () => void;
  unsubscribeFromMerchantReviews: () => void;
  unsubscribeFromAdminReviews: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  impactRules: [],
  merchantStats: null,
  isLoading: false,
  error: null,
  reviewsSubscription: null,

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

  fetchMerchantStats: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/merchant/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      set({ merchantStats: data });
    } catch (error: any) {
      console.error('Fetch Stats Error:', error.message);
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
    // 1. Store previous state for rollback
    const previousReviews = get().reviews;

    // 2. Optimistic Update (Immediate UI response)
    set(state => ({
      reviews: state.reviews.map(r => r.id === id ? { ...r, adminStatus: status } : r)
    }));

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

      if (!response.ok) {
        throw new Error('Failed to update status on server');
      }

      // Success - no action needed, local state is already correct
      console.log(`✅ Review ${id} status optimized to ${status}`);
    } catch (error: any) {
      console.error('❌ Optimistic Update Error:', error.message);
      set({ reviews: previousReviews });
    }
  },

  fetchImpactRules: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/admin/impact-rules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch impact rules');
      const data = await response.json();
      set({ impactRules: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createImpactRule: async (data) => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/admin/impact-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create impact rule');
      await get().fetchImpactRules();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateImpactRule: async (id, data) => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/admin/impact-rules/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update impact rule');
      await get().fetchImpactRules();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteImpactRule: async (id) => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/reviews/admin/impact-rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete impact rule');
      await get().fetchImpactRules();
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  subscribeToMerchantReviews: (storeId: string) => {
    const { reviewsSubscription, fetchMerchantReviews, fetchMerchantStats } = get();
    if (reviewsSubscription || !storeId) return;

    console.log(`📡 Subscribing to Reviews for Store: ${storeId}`);
    const channel = supabase.channel(`merchant-reviews-${storeId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'reviews', 
          filter: `store_id=eq.${storeId}` 
        },
        (payload) => {
          console.log('🔔 Review update received:', payload.eventType);
          
          // Re-fetch only if status became PUBLISHED or something was deleted/inserted
          // This keeps the "Published Only" rule strictly enforced in real-time
          if (payload.eventType !== 'UPDATE' || (payload.new as any).admin_status === 'PUBLISHED') {
            fetchMerchantReviews();
            fetchMerchantStats();
          }
        }
      )
      .subscribe();

    set({ reviewsSubscription: channel });
  },

  subscribeToAdminReviews: () => {
    const { reviewsSubscription, fetchAdminReviews } = get();
    if (reviewsSubscription) return;

    console.log(`📡 Subscribing to Global Admin Reviews`);
    const channel = supabase.channel(`admin-reviews-global`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'reviews'
        },
        (payload) => {
          console.log('🔔 Admin Review update received:', payload.eventType);
          fetchAdminReviews();
        }
      )
      .subscribe();

    set({ reviewsSubscription: channel });
  },

  unsubscribeFromMerchantReviews: () => {
    const { reviewsSubscription } = get();
    if (reviewsSubscription) {
      supabase.removeChannel(reviewsSubscription);
      set({ reviewsSubscription: null });
    }
  },

  unsubscribeFromAdminReviews: () => {
    const { reviewsSubscription } = get();
    if (reviewsSubscription) {
      supabase.removeChannel(reviewsSubscription);
      set({ reviewsSubscription: null });
    }
  }
}));
