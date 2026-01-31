import { create } from 'zustand';

export interface Address {
  fullName: string;
  phone: string;
  city: string;
  details: string;
}

export interface OfferDetails {
  id: number;
  merchantName: string;
  price: number;
  partName: string;
}

interface CheckoutState {
  step: number;
  address: Address;
  selectedOffer: OfferDetails | null;
  isProcessing: boolean;
  
  setStep: (step: number) => void;
  updateAddress: (field: keyof Address, value: string) => void;
  setSelectedOffer: (offer: OfferDetails) => void;
  submitPayment: () => Promise<void>;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  step: 1,
  address: {
    fullName: '',
    phone: '',
    city: '',
    details: ''
  },
  selectedOffer: null,
  isProcessing: false,

  setStep: (step) => set({ step }),
  updateAddress: (field, value) => 
    set((state) => ({ address: { ...state.address, [field]: value } })),
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  
  submitPayment: async () => {
    set({ isProcessing: true });
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        set({ isProcessing: false });
        resolve();
      }, 3000);
    });
  },
  reset: () => set({
    step: 1,
    address: { fullName: '', phone: '', city: '', details: '' },
    isProcessing: false
  })
}));