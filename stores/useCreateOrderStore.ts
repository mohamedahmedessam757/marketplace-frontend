import { create } from 'zustand';

export interface PartItem {
  id: string;
  name: string;
  description: string;
  images: File[];
  video: File | null;
  videoPreview: string | null;
  notes?: string;
}

export interface OrderState {
  step: number;

  // Phase 1: Vehicle
  vehicle: {
    make: string;
    model: string;
    year: string;
    vin: string;
    vinImage?: File | null;
  };

  // Phase 2: Parts
  requestType: 'single' | 'multiple';
  shippingType: 'separate' | 'combined';
  parts: PartItem[];

  // Phase 3 & 4
  preferences: {
    condition: 'new' | 'used' | null;
    warranty: boolean;
  };

  isSubmitting: boolean;

  // Actions
  setStep: (step: number) => void;
  updateVehicle: (updates: Partial<OrderState['vehicle']>) => void;

  // Part Actions
  setRequestType: (type: 'single' | 'multiple') => void;
  setShippingType: (type: 'separate' | 'combined') => void;
  addPart: () => void;
  removePart: (id: string) => void;
  updatePart: (id: string, field: keyof PartItem, value: any) => void;
  addPartImage: (id: string, file: File) => void;
  removePartImage: (id: string, imageIndex: number) => void;

  updatePreferences: (field: string, value: any) => void;
  reset: () => void;
  submitOrder: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialPart: PartItem = {
  id: 'initial-part',
  name: '',
  description: '',
  images: [],
  video: null,
  videoPreview: null,
  notes: ''
};

export const useCreateOrderStore = create<OrderState>((set, get) => ({
  step: 1,

  vehicle: {
    make: '',
    model: '',
    year: '',
    vin: '',
    vinImage: null
  },

  requestType: 'single',
  shippingType: 'separate',
  parts: [initialPart],

  preferences: {
    condition: null,
    warranty: false
  },

  isSubmitting: false,

  setStep: (step) => set({ step }),

  updateVehicle: (updates) =>
    set((state) => ({ vehicle: { ...state.vehicle, ...updates } })),

  setRequestType: (type) => set((state) => {
    // Logic: If switching to single, keep only first part. If multiple, ensure at least one.
    let newParts = state.parts;
    if (type === 'single' && state.parts.length > 1) {
      newParts = [state.parts[0]];
    }
    return {
      requestType: type,
      parts: newParts,
      shippingType: type === 'single' ? 'separate' : 'combined'
    };
  }),

  setShippingType: (type) => set({ shippingType: type }),

  addPart: () => set((state) => {
    if (state.parts.length >= 12) return state; // Max 12
    return {
      parts: [
        ...state.parts,
        { id: generateId(), name: '', description: '', images: [], video: null, videoPreview: null, notes: '' }
      ]
    };
  }),

  removePart: (id) => set((state) => {
    if (state.parts.length <= 1) return state; // Min 1
    return { parts: state.parts.filter(p => p.id !== id) };
  }),

  updatePart: (id, field, value) => set((state) => ({
    parts: state.parts.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    )
  })),

  addPartImage: (id, file) => set((state) => ({
    parts: state.parts.map(p =>
      p.id === id ? { ...p, images: [...p.images, file] } : p
    )
  })),

  removePartImage: (id, imageIndex) => set((state) => ({
    parts: state.parts.map(p =>
      p.id === id ? { ...p, images: p.images.filter((_, i) => i !== imageIndex) } : p
    )
  })),

  updatePreferences: (field, value) =>
    set((state) => ({ preferences: { ...state.preferences, [field]: value } })),

  reset: () => set({
    step: 1,
    vehicle: { make: '', model: '', year: '', vin: '', vinImage: null },
    requestType: 'single',
    shippingType: 'separate',
    parts: [{ ...initialPart, id: generateId() }],
    preferences: { condition: null, warranty: false },
    isSubmitting: false
  }),

  submitOrder: async () => {
    set({ isSubmitting: true });
    try {
      const state = get();

      // 1. Upload All Images for All Parts
      // We need to map parts to a structure that includes uploaded URLs
      const processedParts = [];

      // Dynamic import services
      const { storageService } = await import('../services/storage');

      for (const part of state.parts) {
        const imageUrls: string[] = [];
        for (const file of part.images) {
          const url = await storageService.uploadFile(file, 'marketplace-uploads', `orders/parts/${part.id}`);
          imageUrls.push(url);
        }

        let videoUrl = null;
        if (part.video) {
          videoUrl = await storageService.uploadFile(part.video, 'marketplace-uploads', `orders/parts/${part.id}/video`);
        }

        processedParts.push({
          ...part,
          images: imageUrls,
          video: videoUrl
        });
      }

      // 2. Upload VIN Image
      let vinImageUrl = null;
      if (state.vehicle.vinImage) {
        vinImageUrl = await storageService.uploadFile(state.vehicle.vinImage, 'marketplace-uploads', 'orders/vin');
      }

      // 3. Prepare Payload
      const yearInt = parseInt(state.vehicle.year) || new Date().getFullYear();

      const payload = {
        vehicleMake: state.vehicle.make,
        vehicleModel: state.vehicle.model,
        vehicleYear: yearInt,
        vin: state.vehicle.vin,
        vinImage: vinImageUrl,

        requestType: state.requestType,
        shippingType: state.shippingType,
        parts: processedParts.map(p => ({
          name: p.name,
          description: p.description,
          notes: p.notes,
          images: p.images,
          video: p.video || undefined
        })),

        // Legacy Support (First part details)
        partName: state.parts[0].name,
        partDescription: state.parts[0].description,
        partImages: processedParts[0].images,

        conditionPref: state.preferences.condition,
        warrantyPreferred: state.preferences.warranty
      };

      // 4. Call Backend API
      const { ordersApi } = await import('../services/api/orders');
      await ordersApi.create(payload);

    } catch (err) {
      console.error('Submission failed', err);
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  }
}));