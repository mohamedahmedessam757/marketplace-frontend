import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { violationsApi } from '../services/api/violations';

export interface ViolationType {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  points: number;
  fineAmount: number;
  decayDays: number;
  targetType: 'MERCHANT' | 'CUSTOMER';
  isActive: boolean;
}

export interface Violation {
  id: string;
  targetUserId: string;
  targetType: 'MERCHANT' | 'CUSTOMER';
  targetStoreId?: string;
  typeId: string;
  points: number;
  fineAmount: number;
  reason: string;
  evidenceUrl?: string;
  status: 'ACTIVE' | 'APPEALED' | 'DECAYED' | 'CANCELLED';
  decayAt: string;
  createdAt: string;
  issuerId: string;
  type: ViolationType;
  targetUser?: { name: string; email: string };
  targetStore?: { name: string };
}

export interface PenaltyThreshold {
  id: string;
  nameAr: string;
  nameEn: string;
  targetType: 'MERCHANT' | 'CUSTOMER';
  thresholdPoints: number;
  action: 'WARNING' | 'TEMPORARY_SUSPENSION' | 'PERMANENT_BAN' | 'FEE_INCREASE';
  suspendDurationDays: number;
  isActive: boolean;
}

export interface ViolationAppeal {
  id: string;
  violationId: string;
  reason: string;
  evidenceUrls?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminResponse?: string;
  reviewedAt?: string;
  reviewedById?: string;
  createdAt: string;
  violation: Violation;
}

export interface PenaltyAction {
  id: string;
  targetUserId: string;
  targetStoreId?: string;
  targetType: 'MERCHANT' | 'CUSTOMER';
  action: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  reason: string;
  expiresAt?: string;
  violationScore: number;
  targetUser?: { name: string; email: string };
}

export interface ViolationState {
  violations: Violation[];
  violationTypes: ViolationType[];
  thresholds: PenaltyThreshold[];
  pendingAppeals: ViolationAppeal[];
  pendingPenalties: PenaltyAction[];
  myViolations: Violation[];
  myScore: number | null;
  isLoading: boolean;
  
  // Actions
  fetchViolations: (filters?: any) => Promise<void>;
  fetchViolationTypes: (targetType?: string) => Promise<void>;
  fetchThresholds: (targetType?: string) => Promise<void>;
  fetchPendingAppeals: () => Promise<void>;
  fetchPendingPenalties: () => Promise<void>;
  fetchMyViolations: () => Promise<void>;
  fetchMyScore: () => Promise<void>;
  
  issueViolation: (data: any) => Promise<{ success: boolean; message: string }>;
  reviewAppeal: (id: string, data: any) => Promise<{ success: boolean; message: string }>;
  reviewPenalty: (id: string, data: any) => Promise<{ success: boolean; message: string }>;
  submitAppeal: (violationId: string, data: { reason: string; evidenceUrls?: string[] }) => Promise<{ success: boolean; message: string }>;
  
  createViolationType: (data: any) => Promise<{ success: boolean; message: string }>;
  updateViolationType: (id: string, data: any) => Promise<{ success: boolean; message: string }>;
  createThreshold: (data: any) => Promise<{ success: boolean; message: string }>;
  updateThreshold: (id: string, data: any) => Promise<{ success: boolean; message: string }>;
  deleteThreshold: (id: string) => Promise<{ success: boolean; message: string }>;
  uploadAppealFile: (violationId: string, file: File) => Promise<{ success: boolean; url?: string; message?: string }>;

  // Real-time
  subscribeToViolations: () => () => void;
  unsubscribeFromViolations: () => void;
}

export const useViolationStore = create<ViolationState>((set, get) => ({
  violations: [],
  violationTypes: [],
  thresholds: [],
  pendingAppeals: [],
  pendingPenalties: [],
  myViolations: [],
  myScore: null,
  isLoading: false,

  fetchViolations: async (filters) => {
    set({ isLoading: true });
    try {
      const data = await violationsApi.getAll(filters);
      set({ violations: data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchViolationTypes: async (targetType) => {
    try {
      const data = await violationsApi.getTypes(targetType);
      set({ violationTypes: data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchThresholds: async (targetType) => {
    try {
      const data = await violationsApi.getThresholds(targetType);
      set({ thresholds: data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchPendingAppeals: async () => {
    try {
      const data = await violationsApi.getPendingAppeals();
      set({ pendingAppeals: data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchPendingPenalties: async () => {
    try {
      const data = await violationsApi.getPendingPenalties();
      set({ pendingPenalties: data });
    } catch (e) {
      console.error(e);
    }
  },

  fetchMyViolations: async () => {
    set({ isLoading: true });
    try {
      const data = await violationsApi.getMyViolations();
      set({ myViolations: data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyScore: async () => {
    try {
      const data = await violationsApi.getMyScore();
      set({ myScore: data.score });
    } catch (e) {
      console.error(e);
    }
  },

  issueViolation: async (data) => {
    try {
      const result = await violationsApi.issue(data);
      return { success: true, message: result.message || 'Violation issued' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Server error' };
    }
  },

  reviewAppeal: async (id, data) => {
    try {
      const result = await violationsApi.reviewAppeal(id, data);
      get().fetchPendingAppeals();
      return { success: true, message: result.message };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Server error' };
    }
  },

  reviewPenalty: async (id, data) => {
    try {
      const result = await violationsApi.reviewPenalty(id, data);
      get().fetchPendingPenalties();
      return { success: true, message: result.message };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Server error' };
    }
  },

  submitAppeal: async (violationId, data) => {
    try {
      const result = await violationsApi.submitAppeal(violationId, data);
      get().fetchMyViolations();
      return { success: true, message: result.message };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Server error' };
    }
  },

  uploadAppealFile: async (violationId: string, file: File) => {
    try {
      const result = await violationsApi.uploadAppealFile(violationId, file);
      return { success: true, url: result.url };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Upload failed' };
    }
  },

  createViolationType: async (data) => {
    try {
      await violationsApi.createType(data);
      get().fetchViolationTypes();
      return { success: true, message: 'Violation type created successfully' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Failed to create violation type' };
    }
  },

  updateViolationType: async (id, data) => {
    try {
      await violationsApi.updateType(id, data);
      get().fetchViolationTypes();
      return { success: true, message: 'Violation type updated successfully' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Failed to update violation type' };
    }
  },

  createThreshold: async (data) => {
    try {
      await violationsApi.createThreshold(data);
      get().fetchThresholds();
      return { success: true, message: 'Threshold created successfully' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Failed to create threshold' };
    }
  },

  updateThreshold: async (id, data) => {
    try {
      await violationsApi.updateThreshold(id, data);
      get().fetchThresholds();
      return { success: true, message: 'Threshold updated successfully' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Failed to update threshold' };
    }
  },

  deleteThreshold: async (id) => {
    try {
      await violationsApi.deleteThreshold(id);
      get().fetchThresholds();
      return { success: true, message: 'Threshold deleted successfully' };
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Failed to delete threshold' };
    }
  },

  // Real-time
  subscribeToViolations: () => {
    const channel = supabase.channel('admin-violations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'violations' }, () => get().fetchViolations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'violation_appeals' }, () => get().fetchPendingAppeals())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'penalty_actions' }, () => get().fetchPendingPenalties())
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  },

  unsubscribeFromViolations: () => {
    supabase.removeAllChannels();
  }
}));
