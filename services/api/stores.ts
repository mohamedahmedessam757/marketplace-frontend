import { client } from './client';

export const storesApi = {
    updateStatus: async (storeId: string, status: 'ACTIVE' | 'BLOCKED') => {
        const response = await client.patch(`/stores/${storeId}/status`, { status });
        return response.data;
    },

    updateDocumentStatus: async (storeId: string, docType: string, status: 'approved' | 'rejected', reason?: string) => {
        const response = await client.patch(`/stores/${storeId}/documents/${docType}/status`, { status, reason });
        return response.data;
    },

    uploadDocument: async (file: File, type: string) => {
        // Implement if needed for separate upload
        // Placeholder for future logic
    }
};
