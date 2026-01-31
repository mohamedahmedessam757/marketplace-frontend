
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auditApi } from '../services/api/audit';

export type ActorType = 'SYSTEM' | 'ADMIN' | 'CUSTOMER' | 'VENDOR';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'STATUS_CHANGE' | 'FINANCIAL';

export interface AuditLog {
  id: string; // UUID
  orderId?: string; // UUID from backend
  action: ActionType;
  entity: string;
  actorType: ActorType;
  actorId: string;
  actorName: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
  fetchLogsByOrder: (orderId: string) => Promise<AuditLog[]>;
  getLogsByOrderId: (orderId: string) => AuditLog[];
  getLogsByActor: (actorType: ActorType) => AuditLog[];
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      logs: [],
      isLoading: false,
      error: null,

      fetchLogs: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await auditApi.getAll();
          set({ logs: data, isLoading: false });
        } catch (err) {
          console.error("Failed to fetch logs:", err);
          set({ error: 'Failed to fetch audit logs', isLoading: false });
        }
      },

      fetchLogsByOrder: async (orderId: string) => {
        set({ isLoading: true });
        try {
          const data = await auditApi.getByOrder(orderId);
          set((state) => {
            // Avoid duplicates by filtering out existing logs for this order before adding new ones
            const others = state.logs.filter(l => l.orderId !== orderId);
            return { logs: [...data, ...others], isLoading: false };
          });
          return data;
        } catch (err) {
          set({ isLoading: false });
          return [];
        }
      },

      getLogsByOrderId: (orderId) => get().logs.filter(l => l.orderId === orderId),
      getLogsByActor: (actorType) => get().logs.filter(l => l.actorType === actorType),
      clearLogs: () => set({ logs: [] })
    }),
    {
      name: 'etashleh-audit-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
