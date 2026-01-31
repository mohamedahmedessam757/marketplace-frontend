import { client } from './client';
import { AuditLog } from '../../stores/useAuditStore';

export const auditApi = {
    getAll: async () => {
        const response = await client.get<AuditLog[]>('/audit-logs');
        return response.data;
    },

    getByOrder: async (orderId: string) => {
        const response = await client.get<AuditLog[]>(`/audit-logs/order/${orderId}`);
        return response.data;
    },

    getByActor: async (actorId: string) => {
        // Backend support pending, fallback to filtering client side if needed or generic all
        const response = await client.get<AuditLog[]>('/audit-logs');
        return response.data.filter(log => log.actorId === actorId);
    }
};
