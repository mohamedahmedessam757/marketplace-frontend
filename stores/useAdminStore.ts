
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

export interface AdminActivityLog {
  id: string;
  adminId: string;
  email: string;
  action: string;
  ipAddress: string;
  deviceType: string;
  browser: string;
  location: string;
  metadata?: any;
  createdAt: string;
  admin?: {
    name: string;
    role: string;
  };
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
  price: number; // Bracket surcharge
}

export interface ShipmentType {
  id: string; // 'standard', 'engine', 'gearbox'
  nameAr: string;
  nameEn: string;
  basePrice: number;
  isWeightBound: boolean;
  weightBrackets: ShippingRule[];
}

export interface SystemStatus {
  maintenanceMode: boolean;
  endTime: string | null;
  maintenanceMsgAr: string;
  maintenanceMsgEn: string;
  statusMessageAr: string;
  statusMessageEn: string;
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
    minCommission: number;
  };
  logistics: {
    shipmentTypes: ShipmentType[];
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
  systemStatus: SystemStatus;
  adminActivityLogs: AdminActivityLog[];
  isLoadingLogs: boolean;
  vendorsList: Vendor[];
  systemConfig: SystemConfig;
  activeContract: {
    contentAr: string;
    contentEn: string;
    firstPartyConfig: Record<string, any>;
    version?: number;
  } | null;
  dashboardStats: DashboardStats | null;
  isLoadingStats: boolean;
  dashboardFilters: { startDate?: string; endDate?: string };
  stores: any[];
  currentStoreProfile: any | null;
  isLoadingStores: boolean;
  pendingWithdrawals: WithdrawalRequest[];
  withdrawalLimits: WithdrawalLimits;
  isLoadingWithdrawals: boolean;

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

  // Activity Logs
  fetchAdminActivityLogs: () => Promise<void>;
  publicSystemStatus: any;
  fetchPublicStatus: () => Promise<void>;
  fetchPublicConfig: () => Promise<void>;

  // Contract Management
  fetchVendorContract: () => Promise<void>;
  saveVendorContract: (contractData: any) => Promise<boolean>;

  // Platform Settings (2026 Enhanced)
  fetchSystemSettings: () => Promise<void>;
  saveSystemSetting: (key: string, value: any, reason?: string) => Promise<boolean>;
  subscribeToSettings: () => void;
  unsubscribeFromSettings: () => void;

  // Real-time
  subscription: any;
  fetchDashboardStats: (filters?: { startDate?: string; endDate?: string }) => Promise<void>;
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
  
  // Admin Financial Hub
  adminFinancials: any | null;
  isLoadingFinancials: boolean;
  financialFilters: {
    startDate?: string;
    endDate?: string;
    type?: string;
    role?: string;
    status?: string;
    search?: string;
  };
  fetchAdminFinancials: (filters?: any) => Promise<void>;
  exportFinancialCSV: (filters?: any) => Promise<void>;
  sendManualPayout: (dto: any) => Promise<{ success: boolean; message: string }>;
  setFinancialFilters: (filters: any) => void;
  financialSubscription: any;
  subscribeToFinancials: () => void;
  unsubscribeFromFinancials: () => void;
  
  // Backward compatibility / UI state
  loginAdmin: (email: string) => void;
  logoutAdmin: () => void;
  setDashboardFilters: (filters: { startDate?: string; endDate?: string }) => void;
  setCommissionRate: (rate: number) => void;
  toggleSystemStatus: () => void;
  updateSystemConfig: (section: keyof SystemConfig, data: any) => void;
  fetchAllStores: () => Promise<void>;
  silentFetchStores: () => Promise<void>;
}

const DEFAULT_STATUS: SystemStatus = {
  maintenanceMode: false,
  endTime: null,
  maintenanceMsgAr: 'النظام حالياً في وضع الصيانة لترقية الخوادم...',
  maintenanceMsgEn: 'System is currently under maintenance for server upgrades...',
  statusMessageAr: 'النظام يعمل بشكل طبيعي',
  statusMessageEn: 'System is operating normally'
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      currentAdmin: JSON.parse(sessionStorage.getItem('admin') || 'null'),
      commissionRate: 25,
      systemStatus: DEFAULT_STATUS,
      adminActivityLogs: [],
      isLoadingLogs: false,
      publicSystemStatus: null,
      vendorsList: [],
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
      activeContract: null,
      isLoadingWithdrawals: false,
      isLoadingStores: false,

      adminFinancials: null,
      isLoadingFinancials: false,
      financialFilters: {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        type: 'ALL',
        role: 'ALL',
        status: 'ALL',
        search: ''
      },
      financialSubscription: null,

      systemConfig: {
        general: {
          platformName: 'e-tashleh',
          contactEmail: 'cs@e-tashleh.net',
          supportPhone: '0525700525',
          enablePreferencesStep: true
        },
        financial: {
          commissionRate: 25,
          minCommission: 100
        },
        logistics: {
          shipmentTypes: [
            {
              id: 'standard',
              nameAr: 'شحن قياسي (قطع غيار عادية)',
              nameEn: 'Standard Shipping (Normal Parts)',
              basePrice: 60,
              isWeightBound: true,
              weightBrackets: [
                { id: '1', minWeight: 0, maxWeight: 5, price: 0 },
                { id: '2', minWeight: 5.1, maxWeight: 10, price: 40 },
                { id: '3', minWeight: 10.1, maxWeight: 20, price: 90 },
              ]
            },
            {
              id: 'engine',
              nameAr: 'شحن ماكينة (محرك)',
              nameEn: 'Engine Shipping',
              basePrice: 450,
              isWeightBound: false,
              weightBrackets: []
            },
            {
              id: 'gearbox',
              nameAr: 'شحن جيربوكس',
              nameEn: 'Gearbox Shipping',
              basePrice: 350,
              isWeightBound: false,
              weightBrackets: []
            }
          ]
        },
        content: {
          vendorContract: {
            contentAr: '',
            contentEn: '',
            firstPartyConfig: {}
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
        
        // Push Mock Log to Backend explicitly to ensure Activity Tracker catches it
        fetch('http://localhost:3000/system/mock-admin-log', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              email: email,
              action: 'LOGIN',
              metadata: { role, note: 'Mock Login bypassing Auth API' }
           })
        }).catch(err => console.warn('Mock log failed', err));

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

      fetchAdminActivityLogs: async () => {
        set({ isLoadingLogs: true });
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_URL}/admin/platform-settings/activity/logs`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ adminActivityLogs: data });
          }
        } catch (e) {
          console.error("Failed to fetch admin logs", e);
        } finally {
          set({ isLoadingLogs: false });
        }
      },

      fetchSystemSettings: async () => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_URL}/admin/platform-settings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            
            if (data.system_config) {
              const config = data.system_config;
              if (config.financial && config.financial.vatRate !== undefined && config.financial.minCommission === undefined) {
                config.financial.minCommission = config.financial.vatRate;
              }
              set({ systemConfig: config });
              if (config.financial?.commissionRate) set({ commissionRate: config.financial.commissionRate });
            }
            
            if (data.system_status) set({ systemStatus: data.system_status });
            if (data.withdrawal_limits) set({ withdrawalLimits: data.withdrawal_limits });
          }
        } catch (error) {
          console.error("Failed to fetch system settings", error);
        }
      },

      fetchPublicStatus: async () => {
        try {
          // Dynamic API URL check
          const res = await fetch(`${API_URL}/system/status`);
          if (res.ok) {
            const data = await res.json();
            set({ publicSystemStatus: data });
          }
        } catch (e) {
          console.warn("Public status fetch failed", e);
        }
      },

      fetchPublicConfig: async () => {
        try {
          const res = await fetch(`${API_URL}/system/config`);
          if (res.ok) {
            const config = await res.json();
            
            // Sync backward compatibility for commission
            if (config.financial && config.financial.vatRate !== undefined && config.financial.minCommission === undefined) {
              config.financial.minCommission = config.financial.vatRate;
            }
            
            set({ systemConfig: config });
            if (config.financial?.commissionRate) set({ commissionRate: config.financial.commissionRate });
          }
        } catch (e) {
          console.warn("Public config fetch failed", e);
        }
      },

      saveSystemSetting: async (key: string, value: any, reason?: string) => {
        try {
          const token = localStorage.getItem('access_token');
          // OPTIMISTIC UPDATE: Reflect changes immediately for both Admin and Public states
          if (key === 'system_status') {
             const newStatus = { 
               ...get().systemStatus,
               maintenanceMode: value.maintenanceMode,
               maintenanceMsgAr: value.maintenanceMsgAr,
               maintenanceMsgEn: value.maintenanceMsgEn,
               endTime: value.endTime
             };
             set({ 
               systemStatus: newStatus,
               publicSystemStatus: newStatus 
             });
          }

          const res = await fetch(`${API_URL}/admin/platform-settings/${key}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ value, reason })
          });
          if (res.ok) {
            await get().fetchSystemSettings();
            await get().fetchPublicStatus(); // IMMEDIATE SYNC (2026 Optimization)
            return true;
          }
          return false;
        } catch (error) {
          console.error(`Failed to save setting ${key}`, error);
          return false;
        }
      },

      subscribeToSettings: () => {
        if (get().subscription) return;

        const sub = supabase
          .channel('platform_settings_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'platform_settings' },
            (payload) => {
              const { setting_key, setting_value } = payload.new as any;
              
              if (setting_key === 'system_config') {
                const config = setting_value;
                if (config.financial && config.financial.vatRate !== undefined && config.financial.minCommission === undefined) {
                  config.financial.minCommission = config.financial.vatRate;
                }
                set({ systemConfig: config });
                if (config.financial?.commissionRate) set({ commissionRate: config.financial.commissionRate });
              } else if (setting_key === 'system_status') {
                set({ systemStatus: setting_value });
              } else if (setting_key === 'withdrawal_limits') {
                set({ withdrawalLimits: setting_value });
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'platform_contracts' },
            (payload) => {
              if (payload.new && (payload.new as any).isActive) {
                set({ activeContract: payload.new as any });
              }
            }
          )
          .subscribe();

        set({ subscription: sub });
      },

      unsubscribeFromSettings: () => {
        const { subscription } = get();
        if (subscription) {
          supabase.removeChannel(subscription);
          set({ subscription: null });
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
        systemStatus: { ...state.systemStatus, maintenanceMode: !state.systemStatus.maintenanceMode }
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
        set({ isLoadingStores: true, currentStoreProfile: null }); 
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
            set({ activeContract: data });
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
            const data = await res.json();
            set({ activeContract: data });
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
            method: 'PUT',
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
              silentFetchDashboardStats();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            () => {
              silentFetchDashboardStats();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores' },
            () => {
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
        if (storeProfileSubscription) return; 

        fetchStoreProfile(id); 

        const channel = supabase.channel(`admin-store-profile-${id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores', filter: `id=eq.${id}` },
            () => {
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'store_documents', filter: `store_id=eq.${id}` },
            () => {
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${id}` },
            () => {
              silentFetchStoreProfile(id);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'reviews', filter: `store_id=eq.${id}` },
            () => {
              silentFetchStoreProfile(id);
            }
          )
          .subscribe();

        set({ storeProfileSubscription: channel });
      },

      unsubscribeFromStoreProfile: () => {
        const { storeProfileSubscription } = get();
        if (storeProfileSubscription) {
          supabase.removeChannel(storeProfileSubscription);
          set({ storeProfileSubscription: null });
        }
      },

      withdrawalSubscription: null,

      subscribeToWithdrawals: () => {
        const { withdrawalSubscription, fetchWithdrawals } = get();
        if (withdrawalSubscription) return;

        fetchWithdrawals();

        const channel = supabase.channel('admin-withdrawals-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawal_requests' },
            () => {
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
      },

      // Admin Financial Hub Methods
      setFinancialFilters: (filters) => {
        set({ financialFilters: { ...get().financialFilters, ...filters } });
        get().fetchAdminFinancials(); // Refresh when filters change
      },

      fetchAdminFinancials: async (filters) => {
        set({ isLoadingFinancials: true });
        try {
          const token = localStorage.getItem('access_token');
          const currentFilters = { limit: 500, ...(filters || get().financialFilters) };
          const queryParams = new URLSearchParams(currentFilters as any).toString();
          const res = await fetch(`${API_URL}/payments/admin/financials${queryParams ? `?${queryParams}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ adminFinancials: data });
          }
        } catch (error) {
          console.error("Failed to fetch admin financials", error);
        } finally {
          set({ isLoadingFinancials: false });
        }
      },

      exportFinancialCSV: async (filters) => {
        try {
          const token = localStorage.getItem('access_token');
          const currentFilters = { ...(filters || get().financialFilters), limit: 100000 };
          const queryParams = new URLSearchParams(currentFilters as any).toString();
          const res = await fetch(`${API_URL}/payments/admin/financials/export${queryParams ? `?${queryParams}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (!data || data.length === 0) return;
            const headers = Object.keys(data[0]).join(',');
            const csvRows = data.map((row: any) => Object.values(row).map(val => `"${val}"`).join(','));
            const csvString = [headers, ...csvRows].join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `financials_export_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (error) {
          console.error("Failed to export financials CSV", error);
        }
      },

      sendManualPayout: async (dto) => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_URL}/payments/admin/manual-payout`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(dto)
          });
          const data = await res.json();
          if (res.ok) {
            get().fetchAdminFinancials();
            return { success: true, message: data.message || 'Payout successful' };
          }
          return { success: false, message: data.message || 'Failed to process payout' };
        } catch (error) {
          return { success: false, message: 'An unexpected error occurred' };
        }
      },

      subscribeToFinancials: () => {
        const { financialSubscription, fetchAdminFinancials } = get();
        if (financialSubscription) return;

        const channel = supabase.channel('admin-financials-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'wallet_transactions' },
            () => fetchAdminFinancials()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawal_requests' },
            () => fetchAdminFinancials()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'escrow_transactions' },
            () => fetchAdminFinancials()
          )
          .subscribe();

        set({ financialSubscription: channel });
      },

      unsubscribeFromFinancials: () => {
        const { financialSubscription } = get();
        if (financialSubscription) {
          supabase.removeChannel(financialSubscription);
          set({ financialSubscription: null });
        }
      }
    }),
    {
      name: 'etashleh-admin-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => {
        // Exclude circular/non-serializable objects from persistence
        const { 
          subscription, 
          storeSubscription, 
          storeProfileSubscription, 
          withdrawalSubscription,
          financialSubscription,
          ...rest 
        } = state;
        return rest;
      }
    }
  )
);
