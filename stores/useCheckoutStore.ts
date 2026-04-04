import { create } from 'zustand';
import { client } from '../services/api/client';
import { paymentsApi } from '../services/api/payments';

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  details: string;
}

export interface OfferDetails {
  id: number;
  merchantName: string;
  price: number;
  partName: string;
}

export interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
}

interface PaymentResult {
  success: boolean;
  transactionNumber?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  allPaid?: boolean;
  orderTransitioned?: boolean;
  remainingOffers?: number;
  error?: string;
}

interface CheckoutState {
  orderId: string | number | null;
  step: number;
  address: Address;
  selectedOffer: OfferDetails | null;
  isProcessing: boolean;
  openDrawerForPartId: string | null;

  // Shipping Confirmation States
  termsAccepted: boolean;
  returnPolicyAccepted: boolean;
  isEditingShipping: boolean;
  partAddresses: Record<string, Address>;

  // Payment States
  paidOfferIds: string[];
  paymentError: string | null;
  lastPaymentResult: PaymentResult | null;

  setOrderId: (id: string | number | null) => void;
  setStep: (step: number) => void;
  setOpenDrawerForPartId: (id: string | null) => void;
  updateAddress: (field: keyof Address, value: string) => void;
  setSelectedOffer: (offer: OfferDetails) => void;

  // Shipping Confirmation Actions
  setTermsAccepted: (accepted: boolean) => void;
  setReturnPolicyAccepted: (accepted: boolean) => void;
  setIsEditingShipping: (isEditing: boolean) => void;
  setPartAddress: (partId: string, address: Address) => void;

  saveOrderData: () => Promise<boolean>;
  processPayment: (orderId: string, offerId: string, card: CardDetails) => Promise<PaymentResult>;
  clearPaymentError: () => void;
  submitPayment: () => Promise<void>;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  orderId: null,
  step: 1,
  address: {
    fullName: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    details: ''
  },
  selectedOffer: null,
  isProcessing: false,
  openDrawerForPartId: null,

  termsAccepted: false,
  returnPolicyAccepted: false,
  isEditingShipping: false,
  partAddresses: {},

  paidOfferIds: [],
  paymentError: null,
  lastPaymentResult: null,

  setOrderId: (id) => set({ orderId: id }),
  setStep: (step) => set({ step }),
  setOpenDrawerForPartId: (id) => set({ openDrawerForPartId: id }),
  updateAddress: (field, value) =>
    set((state) => ({ address: { ...state.address, [field]: value } })),
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),

  setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
  setReturnPolicyAccepted: (accepted) => set({ returnPolicyAccepted: accepted }),
  setIsEditingShipping: (isEditing) => set({ isEditingShipping: isEditing }),
  setPartAddress: (partId, addr) => set((state) => ({ partAddresses: { ...state.partAddresses, [partId]: addr } })),

  saveOrderData: async () => {
    const { orderId, address, partAddresses } = useCheckoutStore.getState();
    if (!orderId) return false;

    set({ isProcessing: true });
    try {
      const payloadAddresses: any[] = [];
      const partKeys = Object.keys(partAddresses);

      if (partKeys.length > 0) {
        partKeys.forEach(partId => {
          payloadAddresses.push({ ...partAddresses[partId], orderPartId: partId });
        });
      } else {
        payloadAddresses.push({ ...address, orderPartId: null });
      }

      await client.patch(`/orders/${orderId}/checkout-data`, { addresses: payloadAddresses });

      return true;
    } catch (e) {
      console.error('saveOrderData failed:', e);
      return false;
    } finally {
      set({ isProcessing: false });
    }
  },

  processPayment: async (orderId: string, offerId: string, card: CardDetails): Promise<PaymentResult> => {
    // orderId is now passed explicitly — NOT read from store (prevents stale ID bugs)
    if (!orderId) return { success: false, error: 'No order ID' };

    set({ isProcessing: true, paymentError: null });
    try {
      const result = await paymentsApi.process({
        orderId: String(orderId),
        offerId,
        card,
      });

      set((state) => ({
        paidOfferIds: [...state.paidOfferIds, offerId],
        lastPaymentResult: result,
      }));

      return result;
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || 'Payment failed';
      set({ paymentError: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ isProcessing: false });
    }
  },

  clearPaymentError: () => set({ paymentError: null }),

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
    orderId: null,
    step: 1,
    address: { fullName: '', phone: '', email: '', country: '', city: '', details: '' },
    isProcessing: false,
    selectedOffer: null,
    openDrawerForPartId: null,
    termsAccepted: false,
    returnPolicyAccepted: false,
    isEditingShipping: false,
    partAddresses: {},
    paidOfferIds: [],
    paymentError: null,
    lastPaymentResult: null,
  })
}));