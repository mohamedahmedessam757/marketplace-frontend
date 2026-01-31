import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MerchantStatus } from './useVendorStore';

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
  totalOrders: number;
  activeCustomers: number;
  activeStores: number;
  openDisputes: number;
  salesTrend: { date: string; value: number }[];
  topStores: { storeId: string; name: string; ordersCount: number; value: number }[];
  statusDistribution: { status: string; count: number }[];
  alerts: { type: 'warning' | 'error'; code: string; count: number; priority: string }[];
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
    vendorContract: string;
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
}

export interface AdminState {
  currentAdmin: AdminUser | null;
  commissionRate: number;
  systemStatus: 'active' | 'maintenance';
  vendorsList: Vendor[];
  systemConfig: SystemConfig;
  dashboardStats: DashboardStats | null;
  isLoadingStats: boolean;
  stores: any[];
  currentStoreProfile: any | null;
  isLoadingStores: boolean;

  loginAdmin: (email: string) => void;
  logoutAdmin: () => void;
  fetchDashboardStats: () => Promise<void>;
  setCommissionRate: (rate: number) => void;
  toggleSystemStatus: () => void;
  updateSystemConfig: (section: keyof SystemConfig, data: any) => void;
  fetchAllStores: () => Promise<void>;
  fetchStoreProfile: (id: string) => Promise<void>;
  getVendorById: (id: string) => Vendor | undefined;
  updateVendorStatus: (id: string, status: MerchantStatus) => void;
  updateVendorDocStatus: (vendorId: string, docType: 'cr' | 'license', status: 'approved' | 'rejected') => void;
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
      stores: [],
      currentStoreProfile: null,
      isLoadingStores: false,

      systemConfig: {
        general: {
          platformName: 'e-tashleh',
          contactEmail: 'cs@e-tashleh.net',
          supportPhone: '0525700525'
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
          vendorContract: DEFAULT_CONTRACT,
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
        set({ currentAdmin: null });
      },

      fetchDashboardStats: async () => {
        set({ isLoadingStats: true });
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const res = await fetch(`${API_URL}/dashboard/stats`, {
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
        set({ isLoadingStores: true });
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

      fetchStoreProfile: async (id: string) => {
        set({ isLoadingStores: true });
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
      }))
    }),
    {
      name: 'etashleh-admin-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
