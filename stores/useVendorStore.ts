
import { create } from 'zustand';
import { useNotificationStore } from './useNotificationStore';

export type MerchantStatus = 'IDLE' | 'PENDING_DOCUMENTS' | 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'LICENSE_EXPIRED';

export interface DocState {
  file: File | null;
  status: 'empty' | 'uploading' | 'completed' | 'approved' | 'rejected' | 'expired' | 'pending';
  progress: number;
  expiryDate?: string; // ISO Date String
  rejectionReason?: string;
  lastUpdated?: string;
  fileUrl?: string | null;
  fileName?: string;
}

export interface StoreProfileData {
  logo?: string | null;
  categories: string[];
  workingHours: {
    start: string;
    end: string;
  };
}

export interface BankDetails {
  iban: string;
  bankName: string;
  accountHolder: string;
  status: 'approved' | 'pending_review';
}

export interface VendorSettings {
  notifications: {
    whatsapp: boolean;
    email: boolean;
  };
}

export interface PerformanceMetrics {
  responseSpeed: number; // in hours
  prepSpeed: number; // in hours
  acceptanceRate: number; // percentage
  complaintRate: number; // percentage
  rating: number; // 0-5
}

export interface VendorState {
  step: number;
  vendorStatus: MerchantStatus;

  account: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  otpVerified: boolean;
  storeInfo: {
    storeName: string;
    category: string;
    bio: string;
    address: string;
    lat: number | null;
    lng: number | null;
  };

  profile: StoreProfileData;
  bankDetails: BankDetails;
  settings: VendorSettings;
  performance: PerformanceMetrics;

  contractAgreed: boolean;
  documents: {
    cr: DocState;
    license: DocState;
    id: DocState;
    iban: DocState;
    authLetter: DocState;
  };

  // Actions
  setStep: (step: number) => void;
  setVendorStatus: (status: MerchantStatus) => void;
  updateAccount: (field: string, value: string) => void;
  updateStoreInfo: (field: string, value: string) => void;
  updateProfile: (data: Partial<StoreProfileData>) => void;
  updateBankDetails: (data: Partial<BankDetails>) => void;
  updateSettings: (data: Partial<VendorSettings['notifications']>) => void;

  setOtpVerified: (verified: boolean) => void;
  setContractAgreed: (agreed: boolean) => void;
  updateDocumentStatus: (key: keyof VendorState['documents'], status: DocState['status'], progress?: number) => void;
  updateDocumentMetadata: (key: keyof VendorState['documents'], data: Partial<DocState>) => void;
  setDocumentFile: (key: keyof VendorState['documents'], file: File) => void;
  uploadDocument: (key: keyof VendorState['documents'], file: File) => Promise<void>;
  simulateUpload: (key: keyof VendorState['documents']) => void;
  reset: () => void;

  // LOGIC ACTIONS
  checkLicenseStatus: () => void;
  adminApproveVendor: () => void;
  adminRejectVendor: (reason: string) => void;
  adminBanVendor: () => void;
}

const initialDocState: DocState = { file: null, status: 'empty', progress: 0 };

export const useVendorStore = create<VendorState>((set, get) => ({
  step: 1,
  vendorStatus: 'PENDING_DOCUMENTS',
  account: { name: '', email: '', phone: '', password: '' },
  otpVerified: false,
  storeInfo: { storeName: '', category: '', bio: '', address: '', lat: null, lng: null },
  contractAgreed: false,

  profile: {
    logo: null,
    categories: ['Spare Parts'],
    workingHours: { start: '09:00', end: '21:00' }
  },

  bankDetails: {
    iban: 'SA55 8000 0000 0000 0000 1234',
    bankName: 'Al Rajhi Bank',
    accountHolder: 'Mohammed Ali Store',
    status: 'approved'
  },

  settings: {
    notifications: {
      whatsapp: true,
      email: false
    }
  },

  performance: {
    responseSpeed: 2.5,
    prepSpeed: 20,
    acceptanceRate: 85,
    complaintRate: 1.2,
    rating: 4.8
  },

  // Initialize with empty docs for registration flow, or mock data for demo
  documents: {
    cr: { ...initialDocState },
    license: { ...initialDocState }, // Set expiry here to test: expiryDate: '2023-01-01'
    id: { ...initialDocState },
    iban: { ...initialDocState },
    authLetter: { ...initialDocState }
  },

  setStep: (step) => set({ step }),
  setVendorStatus: (status) => set({ vendorStatus: status }),

  updateAccount: (field, value) =>
    set((state) => ({ account: { ...state.account, [field]: value } })),

  updateStoreInfo: (field, value) =>
    set((state) => ({ storeInfo: { ...state.storeInfo, [field]: value } })),

  updateProfile: (data) => set((state) => ({ profile: { ...state.profile, ...data } })),

  updateBankDetails: (data) => set((state) => ({
    bankDetails: { ...state.bankDetails, ...data, status: 'pending_review' }
  })),

  updateSettings: (data) => set((state) => ({
    settings: { notifications: { ...state.settings.notifications, ...data } }
  })),

  setOtpVerified: (verified) => set({ otpVerified: verified }),
  setContractAgreed: (agreed) => set({ contractAgreed: agreed }),

  updateDocumentStatus: (key, status, progress) => set((state) => ({
    documents: {
      ...state.documents,
      [key]: {
        ...state.documents[key],
        status,
        progress: progress !== undefined ? progress : state.documents[key].progress
      }
    }
  })),

  updateDocumentMetadata: (key, data) => set((state) => ({
    documents: {
      ...state.documents,
      [key]: { ...state.documents[key], ...data }
    }
  })),

  setDocumentFile: (key, file) => set((state) => ({
    documents: {
      ...state.documents,
      [key]: { ...state.documents[key], file, status: 'uploading', progress: 0 }
    }
  })),

  // REAL UPLOAD LOGIC
  uploadDocument: async (key: keyof VendorState['documents'], file: File) => {
    const { updateDocumentStatus, updateDocumentMetadata } = get();
    // Start Upload
    updateDocumentStatus(key, 'uploading', 0);

    try {
      const { supabase } = await import('../services/supabase');
      const storeName = get().storeInfo.storeName || 'unknown_store';
      // Sanitize filename: storeName_docType_timestamp.ext
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeName.replace(/\s+/g, '_')}_${key}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('vendor-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if exists
        });

      if (error) throw error;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vendor-documents')
        .getPublicUrl(filePath);

      // Success
      updateDocumentStatus(key, 'pending', 100); // Mark as pending review
      updateDocumentMetadata(key, {
        lastUpdated: new Date().toISOString(),
        fileUrl: publicUrl, // Store the URL for viewing
        fileName: fileName
      });

    } catch (error) {
      console.error('Upload Failed:', error);
      updateDocumentStatus(key, 'empty', 0); // Reset on failure
      // Ideally show error toast
    }
  },

  simulateUpload: (key) => {
    // Deprecated, mapped to uploadDocument internally if needed, or removed.
    // Keeping this solely for API compatibility if called elsewhere, but logic handles actual upload now.
    console.warn('simulateUpload is deprecated. Use uploadDocument instead.');
  },

  // --- THE LICENSE WATCHDOG LOGIC ---
  checkLicenseStatus: () => {
    const state = get();
    const license = state.documents.license;

    // Only check if active or already expired (to re-activate)
    if (['PENDING_DOCUMENTS', 'PENDING_REVIEW', 'IDLE'].includes(state.vendorStatus)) return;

    if (license.expiryDate) {
      const today = new Date();
      const expiry = new Date(license.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0 && state.vendorStatus !== 'LICENSE_EXPIRED') {
        // EXPIRED: Block Access
        set({ vendorStatus: 'LICENSE_EXPIRED' });
        state.updateDocumentStatus('license', 'expired');
        useNotificationStore.getState().addNotification({
          type: 'docExpiry',
          titleKey: 'docExpiry',
          message: 'CRITICAL: License Expired. Account Restricted.',
          priority: 'urgent',
          linkTo: 'docs'
        });
      } else if (diffDays > 0 && state.vendorStatus === 'LICENSE_EXPIRED') {
        // RENEWED: Restore Access
        set({ vendorStatus: 'ACTIVE' });
        state.updateDocumentStatus('license', 'approved');
      }
    }
  },

  adminApproveVendor: () => set((state) => ({
    vendorStatus: 'ACTIVE',
    documents: Object.keys(state.documents).reduce((acc, key) => {
      (acc as any)[key] = { ...state.documents[key as keyof typeof state.documents], status: 'approved' };
      return acc;
    }, {} as typeof state.documents)
  })),

  adminRejectVendor: (reason) => {
    set((state) => ({
      vendorStatus: 'PENDING_DOCUMENTS', // Send back to docs
      step: 5, // Force UI to docs step
      documents: {
        ...state.documents,
        // Mark all pending as rejected for clarity, or specific ones in a real app
        license: { ...state.documents.license, status: 'rejected', rejectionReason: reason }
      }
    }));
  },

  adminBanVendor: () => set({ vendorStatus: 'BLOCKED' }),

  reset: () => set({
    step: 1,
    vendorStatus: 'PENDING_DOCUMENTS',
    account: { name: '', email: '', phone: '', password: '' },
    otpVerified: false,
    storeInfo: { storeName: '', category: '', bio: '', address: '', lat: null, lng: null },
    profile: { logo: null, categories: ['Spare Parts'], workingHours: { start: '09:00', end: '21:00' } },
    contractAgreed: false,
    documents: {
      cr: { ...initialDocState },
      license: { ...initialDocState },
      id: { ...initialDocState },
      iban: { ...initialDocState },
      authLetter: { ...initialDocState }
    }
  })
}));
