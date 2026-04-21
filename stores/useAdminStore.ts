import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MerchantStatus } from './useVendorStore';
import { supabase } from '../services/supabase';
import { storesApi } from '../services/api/stores';

// Dynamic API URL - uses environment variable in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalCommission: number;
  salesTrendPercent?: number;
  totalOrders: number;
  activeCustomers: number;
  activeStores: number;
  openDisputes: number;
  salesTrend: { date: string; value: number }[];
  topStores: { 
    storeId: string; 
    name: string; 
    logo?: string;
    rating: number;
    revenue: number;
    ordersCount: number; 
    value?: number; 
  }[];
  statusDistribution: { status: string; count: number }[];
  alerts: { type: 'warning' | 'error' | 'critical'; code: string; count: number; priority: string }[];
  recentOrders: any[];
}

export interface ShippingRule {
  id: string;
  minWeight: number;
  maxWeight: number;
  price: number;
}

export interface SystemConfig {
  general: {
    platformName: string;
    contactEmail: string;
    supportPhone: string;
    enablePreferencesStep: boolean;
  };
  financial: {
    commissionRate: number;
    vatRate: number;
  };
  logistics: {
    shippingRules: ShippingRule[];
    baseShippingCost: number;
  };
  content: {
    vendorContract: {
      contentAr: string;
      contentEn: string;
      firstPartyConfig: Record<string, string>;
    };
    privacyPolicy: string;
    invoiceFooter: string;
  };
}

export interface Vendor {
  id: string;
  name: string;
  storeName: string;
  email: string;
  status: MerchantStatus;
  licenseExpiry: string;
  rating: number;
  totalSales: number;
  joinedAt: string;
  balance: number;
  docs?: {
    cr: 'approved' | 'pending' | 'expired' | 'rejected';
    license: 'approved' | 'pending' | 'expired' | 'rejected';
  };
  owner?: { name: string; email: string };
  createdAt?: string;
  loyaltyTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  performanceScore?: number;
  lifetimeEarnings?: number;
  adminNotes?: string;
  address?: string;
  lat?: number;
  lng?: number;
  orders?: any[];
  documents?: any[];
  _count?: {
    orders: number;
    reviews: number;
    offers: number;
  };
}
export interface WithdrawalRequest {
  id: string;
  storeId?: string;
  userId?: string;
  role: 'VENDOR' | 'CUSTOMER';
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  payoutMethod: 'STRIPE' | 'BANK_TRANSFER';
  adminNotes?: string;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    owner?: { name: string; email: string };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface WithdrawalLimits {
  min: number;
  max: number;
}

export interface AdminState {
  currentAdmin: AdminUser | null;
  commissionRate: number;
  systemStatus: 'active' | 'maintenance';
  vendorsList: Vendor[];
  systemConfig: SystemConfig;
  dashboardStats: DashboardStats | null;
  isLoadingStats: boolean;
  dashboardFilters: { startDate?: string; endDate?: string };
  stores: any[];
  currentStoreProfile: any | null;
  isLoadingStores: boolean;
  pendingWithdrawals: WithdrawalRequest[];
  withdrawalLimits: WithdrawalLimits;
  isLoadingWithdrawals: boolean;

  loginAdmin: (email: string) => void;
  logoutAdmin: () => void;
  setDashboardFilters: (filters: { startDate?: string; endDate?: string }) => void;
  fetchDashboardStats: (filters?: { startDate?: string; endDate?: string }) => Promise<void>;
  setCommissionRate: (rate: number) => void;
  toggleSystemStatus: () => void;
  updateSystemConfig: (section: keyof SystemConfig, data: any) => void;
  fetchAllStores: () => Promise<void>;
  silentFetchStores: () => Promise<void>;
  fetchStoreProfile: (id: string) => Promise<void>;
  silentFetchStoreProfile: (id: string) => Promise<void>;
  clearStoreProfile: () => void;
  getVendorById: (id: string) => Vendor | undefined;
  updateVendorStatus: (id: string, status: MerchantStatus) => void;
  updateVendorDocStatus: (vendorId: string, docType: 'cr' | 'license', status: 'approved' | 'rejected') => void;
  updateStoreNotes: (id: string, notes: string) => Promise<boolean>;
  // Withdrawal Management
  fetchWithdrawals: () => Promise<void>;
  processWithdrawal: (id: string, action: 'approve' | 'reject', notes?: string) => Promise<{ success: boolean; message: string }>;
  fetchWithdrawalLimits: () => Promise<void>;
  updateWithdrawalLimits: (limits: WithdrawalLimits) => Promise<boolean>;

  // Contract Management
  fetchVendorContract: () => Promise<void>;
  saveVendorContract: (contractData: any) => Promise<boolean>;

  // Real-time
  subscription: any;
  silentFetchDashboardStats: (filters?: { startDate?: string; endDate?: string }) => Promise<void>;
  subscribeToStats: () => void;
  unsubscribeFromStats: () => void;

  storeSubscription: any;
  subscribeToStores: () => void;
  unsubscribeFromStores: () => void;

  storeProfileSubscription: any;
  subscribeToStoreProfile: (id: string) => void;
  unsubscribeFromStoreProfile: () => void;

  withdrawalSubscription: any;
  subscribeToWithdrawals: () => void;
  unsubscribeFromWithdrawals: () => void;
}

const MOCK_VENDORS: Vendor[] = [
  { id: '1', name: 'Mohammed Ali', storeName: 'Al-Jazira Parts', email: 'mohammed@store.com', status: 'ACTIVE', licenseExpiry: '2024-12-01', rating: 4.8, totalSales: 450000, joinedAt: '2023-01-15', balance: 12500, docs: { cr: 'approved', license: 'approved' } },
  { id: '2', name: 'Khalid Omar', storeName: 'Seoul Auto', email: 'khalid@seoul.com', status: 'ACTIVE', licenseExpiry: '2024-10-10', rating: 4.5, totalSales: 320000, joinedAt: '2023-03-20', balance: 8400, docs: { cr: 'approved', license: 'approved' } },
  { id: '3', name: 'Sami Ahmed', storeName: 'German Elite', email: 'sami@german.com', status: 'LICENSE_EXPIRED', licenseExpiry: '2024-02-01', rating: 4.9, totalSales: 550000, joinedAt: '2022-11-05', balance: 2000, docs: { cr: 'approved', license: 'expired' } },
  { id: '4', name: 'New Vendor', storeName: 'Fast Parts', email: 'new@vendor.com', status: 'PENDING_REVIEW', licenseExpiry: '2025-01-01', rating: 0, totalSales: 0, joinedAt: '2024-02-25', balance: 0, docs: { cr: 'pending', license: 'pending' } },
];

const DEFAULT_CONTRACT = `عقد شراكة وتوريد إلكتروني...`;

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      currentAdmin: JSON.parse(sessionStorage.getItem('admin') || 'null'),
      commissionRate: 20,
      systemStatus: 'active',
      vendorsList: MOCK_VENDORS,
      dashboardStats: null,
      isLoadingStats: false,
      dashboardFilters: {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      stores: [],
      currentStoreProfile: null,
      pendingWithdrawals: [],
      withdrawalLimits: { min: 100, max: 10000 },
      isLoadingWithdrawals: false,
      isLoadingStores: false,

      systemConfig: {
        general: {
          platformName: 'e-tashleh',
          contactEmail: 'cs@e-tashleh.net',
          supportPhone: '0525700525',
          enablePreferencesStep: false
        },
        financial: {
          commissionRate: 20,
          vatRate: 15
        },
        logistics: {
          baseShippingCost: 150,
          shippingRules: [
            { id: '1', minWeight: 0, maxWeight: 5, price: 35 },
            { id: '2', minWeight: 5.1, maxWeight: 15, price: 65 },
            { id: '3', minWeight: 15.1, maxWeight: 30, price: 120 },
          ]
        },
        content: {
          vendorContract: {
            contentAr: '',
            contentEn: '',
            firstPartyConfig: {
              companyNameAr: '',
              companyNameEn: '',
              crNumber: '',
              licenseNumber: '',
              licenseExpiry: '',
              headquartersAr: '',
              headquartersEn: ''
            }
          },
          privacyPolicy: '...',
          invoiceFooter: 'ELLIPP FZ LLC...'
        }
      },

      loginAdmin: (email) => {
        let role: AdminRole = 'ADMIN';
        if (email.includes('super')) role = 'SUPER_ADMIN';
        if (email.includes('support')) role = 'SUPPORT';

        const user: AdminUser = {
          id: 'ADM-' + Date.now(),
          name: 'Admin User',
          email,
          role,
          avatar: undefined
        };

        sessionStorage.setItem('admin', JSON.stringify(user));
        set({ currentAdmin: user });
        get().fetchDashboardStats();
        get().fetchAllStores();
      },

      logoutAdmin: () => {
        sessionStorage.removeItem('admin');
        set({ currentAdmin: null, dashboardStats: null });
      },

      setDashboardFilters: (filters) => set({ dashboardFilters: filters }),

      silentFetchDashboardStats: async (filters) => {
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const currentFilters = filters || get().dashboardFilters;
            const queryParams = new URLSearchParams(currentFilters as any).toString();
            const res = await fetch(`${API_URL}/dashboard/stats${queryParams ? `?${queryParams}` : ''}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              set({ dashboardStats: data });
            }
          }
        } catch (e) {
          console.error("Failed to silently fetch stats", e);
        }
      },

      fetchDashboardStats: async (filters) => {
        const { dashboardStats, dashboardFilters } = get();
        const activeFilters = filters || dashboardFilters;
        
        if (!dashboardStats) set({ isLoadingStats: true });
        if (filters) set({ dashboardFilters: filters });

        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const queryParams = new URLSearchParams(activeFilters as any).toString();
            const res = await fetch(`${API_URL}/dashboard/stats${queryParams ? `?${queryParams}` : ''}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              set({ dashboardStats: data });
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          set({ isLoadingStats: false });
        }
      },

      setCommissionRate: (rate) => set({ commissionRate: rate }),

      toggleSystemStatus: () => set((state) => ({
        systemStatus: state.systemStatus === 'active' ? 'maintenance' : 'active'
      })),

      updateSystemConfig: (section, data) => set((state) => {
        const newConfig = {
          ...state.systemConfig,
          [section]: { ...state.systemConfig[section], ...data }
        };
        const newCommission = section === 'financial' && data.commissionRate ? data.commissionRate : state.commissionRate;
        return {
          systemConfig: newConfig,
          commissionRate: newCommission
        };
      }),

      fetchAllStores: async () => {
        const { stores } = get();
        if (stores.length === 0) set({ isLoadingStores: true });
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const response = await fetch(`${API_URL}/stores`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              set({ stores: data });
            }
          }
        } catch (error) {
          console.error("Failed to fetch stores", error);
        } finally {
          set({ isLoadingStores: false });
        }
      },

      silentFetchStores: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const response = await fetch(`${API_URL}/stores`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              set({ stores: data });
            }
          }
        } catch (error) {
          console.error("Failed to silently fetch stores", error);
        }
      },

      fetchStoreProfile: async (id: string) => {
        set({ isLoadingStores: true, currentStoreProfile: null }); // CLEAR old profile
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const response = await fetch(`${API_URL}/stores/${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              set({ currentStoreProfile: data });
            }
          }
        } catch (error) {
          console.error("Failed to fetch store profile", error);
        } finally {
          set({ isLoadingStores: false });
        }
      },

      silentFetchStoreProfile: async (id: string) => {
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const response = await fetch(`${API_URL}/stores/${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const data = await response.json();
              set({ currentStoreProfile: data });
            }
          }
        } catch (error) {
          console.error("Failed to silently fetch store profile", error);
        }
      },

      clearStoreProfile: () => set({ currentStoreProfile: null }),

      updateStoreNotes: async (id, notes) => {
        try {
          await storesApi.updateNotes(id, notes);
          // Optimistically update local state if matches current profile
          const { currentStoreProfile } = get();
          if (currentStoreProfile && currentStoreProfile.id === id) {
            set({ currentStoreProfile: { ...currentStoreProfile, adminNotes: notes } });
          }
          return true;
        } catch (error) {
          console.error("Failed to update store notes", error);
          return false;
        }
      },

      getVendorById: (id) => get().vendorsList.find(v => v.id === id),

      updateVendorStatus: (id, status) => set((state) => ({
        vendorsList: state.vendorsList.map(v => v.id === id ? { ...v, status } : v)
      })),

      updateVendorDocStatus: (vendorId, docType, status) => set((state) => ({
        vendorsList: state.vendorsList.map(v => {
          if (v.id !== vendorId) return v;
          return {
            ...v,
            docs: { ...v.docs, [docType]: status } as any
          };
        })
      })),

      fetchVendorContract: async () => {
        try {
          const res = await fetch(`${API_URL}/contracts/active`);
          if (res.ok) {
            const data = await res.json();
            set(state => ({
              systemConfig: {
                ...state.systemConfig,
                content: {
                  ...state.systemConfig.content,
                  vendorContract: {
                    contentAr: data.contentAr || '',
                    contentEn: data.contentEn || '',
                    firstPartyConfig: data.firstPartyConfig || {}
                  }
                }
              }
            }));
          }
        } catch (e) {
          console.error("Failed to fetch contract", e);
        }
      },

      saveVendorContract: async (contractData: any) => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) return false;
          
          const res = await fetch(`${API_URL}/contracts`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(contractData)
          });
          
          if (res.ok) {
            set(state => ({
              systemConfig: {
                ...state.systemConfig,
                content: {
                  ...state.systemConfig.content,
                  vendorContract: contractData
                }
              }
            }));
            return true;
          }
          return false;
        } catch (e) {
          console.error("Failed to save contract", e);
          return false;
        }
      },

      fetchWithdrawals: async () => {
        set({ isLoadingWithdrawals: true });
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_URL}/payments/admin/withdrawals`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ pendingWithdrawals: data });
          }
        } catch (error) {
          console.error('Failed to fetch withdrawals:', error);
        } finally {
          set({ isLoadingWithdrawals: false });
        }
      },

      processWithdrawal: async (id, action, notes) => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_URL}/payments/admin/withdrawals/${id}/process`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ action: action.toUpperCase(), notes })
          });
          
          const result = await res.json();
          if (res.ok) {
            get().fetchWithdrawals();
            return { success: true, message: result.message };
          }
          return { success: false, message: result.message };
        } catch (error) {
          return { success: false, message: 'Processing failed' };
        }
      },

      fetchWithdrawalLimits: async () => {
        try {
          const res = await fetch(`${API_URL}/payments/admin/withdrawal-settings`);
          if (res.ok) {
            const data = await res.json();
            set({ withdrawalLimits: { min: data.min, max: data.max } });
          }
        } catch (error) {
          console.error('Failed to fetch withdrawal limits:', error);
        }
      },

      updateWithdrawalLimits: async (limits) => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_URL}/payments/admin/withdrawal-settings`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ min: Number(limits.min), max: Number(limits.max) })
          });
          if (res.ok) {
            set({ withdrawalLimits: limits });
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },



      subscription: null,

      subscribeToStats: () => {
        const { subscription, silentFetchDashboardStats } = get();
        if (subscription) return;

        const channel = supabase.channel('admin-stats-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              console.log('🔔 Admin Stats Update: Orders');
              silentFetchDashboardStats();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            () => {
              console.log('🔔 Admin Stats Update: Users');
              silentFetchDashboardStats();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores' },
            () => {
              console.log('🔔 Admin Stats Update: Stores');
              silentFetchDashboardStats();
            }
          )
          .subscribe();

        set({ subscription: channel });
      },

      unsubscribeFromStats: () => {
        const { subscription } = get();
        if (subscription) {
          supabase.removeChannel(subscription);
          set({ subscription: null });
        }
      },

      storeSubscription: null,

      subscribeToStores: () => {
        const { storeSubscription, fetchAllStores, silentFetchStores } = get();
        if (storeSubscription) return;

        fetchAllStores(); // Initial load with spinner

        const channel = supabase.channel('admin-stores-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores' },
            () => {
              console.log('🔔 Admin Stores Update Received');
              silentFetchStores();
            }
          )
          .subscribe();

        set({ storeSubscription: channel });
      },

      unsubscribeFromStores: () => {
        const { storeSubscription } = get();
        if (storeSubscription) {
          supabase.removeChannel(storeSubscription);
          set({ storeSubscription: null });
        }
      },

      storeProfileSubscription: null,

      subscribeToStoreProfile: (id: string) => {
        const { storeProfileSubscription, fetchStoreProfile, silentFetchStoreProfile } = get();
        if (storeProfileSubscription) return; // Already subscribed

        fetchStoreProfile(id); // Initial fetch with skeleton loader

        const channel = supabase.channel(`admin-store-profile-${id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores', filter: `id=eq.${id}` },
            () => {
              console.log(`🔔 Admin Store Profile Update Received for ${id}`);
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'store_documents', filter: `store_id=eq.${id}` },
            () => {
              console.log(`🔔 Admin Store Documents Update Received for ${id}`);
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${id}` },
            () => {
              console.log(`🔔 Admin Store Orders Update Received for ${id}`);
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reviews', filter: `store_id=eq.${id}` },
            () => {
              console.log(`🔔 Admin Store Reviews Update Received for ${id}`);
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawal_requests', filter: `store_id=eq.${id}` },
            () => {
              console.log(`🔔 Admin Store Withdrawal Update Received for ${id}`);
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'wallet_transactions' },
            (payload: any) => {
              const { currentStoreProfile } = get();
              if (currentStoreProfile?.ownerId === payload.new?.user_id || currentStoreProfile?.ownerId === payload.old?.user_id) {
                console.log(`🔔 Admin Store Wallet Transaction Received for owner: ${currentStoreProfile?.ownerId}`);
                silentFetchStoreProfile(id);
              }
            }
          )
          .subscribe();

        set({ storeProfileSubscription: channel });
      },

      unsubscribeFromStoreProfile: () => {
        const { storeProfileSubscription, clearStoreProfile } = get();
        if (storeProfileSubscription) {
          supabase.removeChannel(storeProfileSubscription);
          set({ storeProfileSubscription: null });
        }
        clearStoreProfile(); // Cleanup on unmount!
      },

      withdrawalSubscription: null,
      subscribeToWithdrawals: () => {
        const { withdrawalSubscription, fetchWithdrawals } = get();
        if (withdrawalSubscription) return;

        fetchWithdrawals();
        const channel = supabase.channel('admin-withdrawals-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'WithdrawalRequest' },
            () => {
              console.log('🔔 Admin Withdrawal Update Received');
              fetchWithdrawals();
            }
          )
          .subscribe();

        set({ withdrawalSubscription: channel });
      },

      unsubscribeFromWithdrawals: () => {
        const { withdrawalSubscription } = get();
        if (withdrawalSubscription) {
          supabase.removeChannel(withdrawalSubscription);
          set({ withdrawalSubscription: null });
        }
      }
    }),
    {
      name: 'etashleh-admin-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentAdmin: state.currentAdmin,
        commissionRate: state.commissionRate,
        systemStatus: state.systemStatus,
        vendorsList: state.vendorsList,
        systemConfig: state.systemConfig,
        // Exclude subscription and others
      }),
    }
  )
);
