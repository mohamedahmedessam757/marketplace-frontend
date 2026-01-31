import { create } from 'zustand';

export interface OrderState {
  step: number;
  vehicle: {
    make: string;
    model: string;
    year: string;
    vin: string;
    vinImage?: File | null;
  };
  part: {
    name: string;
    description: string;
    images: File[];
  };
  preferences: {
    condition: 'new' | 'used' | null;
    warranty: boolean;
  };
  isSubmitting: boolean;

  // Actions
  setStep: (step: number) => void;
  updateVehicle: (field: string, value: string) => void;
  updatePart: (field: string, value: any) => void;
  updatePreferences: (field: string, value: any) => void;
  addImage: (file: File) => void;
  removeImage: (index: number) => void;
  reset: () => void;
  submitOrder: () => Promise<void>;
}

export const useCreateOrderStore = create<OrderState>((set, get) => ({
  step: 1,
  vehicle: {
    make: '',
    model: '',
    year: '',
    vin: '',
    vinImage: null
  },
  part: {
    name: '',
    description: '',
    images: []
  },
  preferences: {
    condition: null,
    warranty: false
  },
  isSubmitting: false,

  setStep: (step) => set({ step }),

  updateVehicle: (field, value) =>
    set((state) => ({ vehicle: { ...state.vehicle, [field]: value } })),

  updatePart: (field, value) =>
    set((state) => ({ part: { ...state.part, [field]: value } })),

  updatePreferences: (field, value) =>
    set((state) => ({ preferences: { ...state.preferences, [field]: value } })),

  addImage: (file) =>
    set((state) => ({ part: { ...state.part, images: [...state.part.images, file] } })),

  removeImage: (index) =>
    set((state) => ({
      part: { ...state.part, images: state.part.images.filter((_, i) => i !== index) }
    })),

  reset: () => set({
    step: 1,
    vehicle: { make: '', model: '', year: '', vin: '', vinImage: null },
    part: { name: '', description: '', images: [] },
    preferences: { condition: null, warranty: false },
    isSubmitting: false
  }),

  submitOrder: async () => {
    set({ isSubmitting: true });
    try {
      const state = get();

      // 1. Upload Part Images
      const partImageUrls: string[] = [];
      if (state.part.images.length > 0) {
        // Dynamic import to avoid circular dependency issues if any, or just import top level.
        // Importing standard service
        const { storageService } = await import('../services/storage');

        for (const file of state.part.images) {
          const url = await storageService.uploadFile(file, 'marketplace-uploads', 'orders/parts');
          partImageUrls.push(url);
        }
      }

      // 2. Upload VIN Image
      let vinImageUrl = null;
      if (state.vehicle.vinImage) {
        const { storageService } = await import('../services/storage');
        vinImageUrl = await storageService.uploadFile(state.vehicle.vinImage, 'marketplace-uploads', 'orders/vin');
      }

      // 3. Prepare Payload
      // Parse year to ensure it is a number (SmallInt compliance)
      const yearInt = parseInt(state.vehicle.year) || new Date().getFullYear();

      const payload = {
        vehicleMake: state.vehicle.make,
        vehicleModel: state.vehicle.model,
        vehicleYear: yearInt,
        vin: state.vehicle.vin,
        vinImage: vinImageUrl,
        partName: state.part.name,
        partDescription: state.part.description,
        partImages: partImageUrls,
        conditionPref: state.preferences.condition,
        warrantyPreferred: state.preferences.warranty
      };

      // 4. Call Backend API
      const { ordersApi } = await import('../services/api/orders');
      await ordersApi.create(payload);

    } catch (err) {
      console.error('Submission failed', err);
      throw err; // Re-throw to be caught by component
    } finally {
      set({ isSubmitting: false });
    }
  }
}));