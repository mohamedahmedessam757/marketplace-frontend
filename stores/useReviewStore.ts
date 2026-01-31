
import { create } from 'zustand';

export interface Review {
  id: number;
  orderId: number;
  merchantName: string;
  partName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'published' | 'pending' | 'rejected'; // Added rejected
  images?: string[];
}

interface ReviewState {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'status'>) => void;
  approveReview: (id: number) => void;
  rejectReview: (id: number) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [
    {
        id: 1,
        orderId: 1004,
        merchantName: 'Jeddah Parts Center',
        partName: 'Side Mirror Right',
        rating: 5,
        comment: 'Excellent condition, fast delivery. Highly recommended!',
        date: '12 Jan 2024',
        status: 'published'
    },
    {
        id: 2,
        orderId: 1005,
        merchantName: 'Seoul Auto',
        partName: 'Radiator Fan',
        rating: 3,
        comment: 'Good part but packaging was damaged.',
        date: '10 Mar 2024',
        status: 'pending'
    }
  ],
  addReview: (data) => set((state) => {
    const newReview: Review = {
        ...data,
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'pending' // Default status
    };
    return { reviews: [newReview, ...state.reviews] };
  }),
  approveReview: (id) => set((state) => ({
      reviews: state.reviews.map(r => r.id === id ? { ...r, status: 'published' } : r)
  })),
  rejectReview: (id) => set((state) => ({
      reviews: state.reviews.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
  }))
}));
