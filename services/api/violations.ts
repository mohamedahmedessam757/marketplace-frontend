import { client } from './client';

export const violationsApi = {
  // Admin Endpoints
  getAll: async (params: any = {}) => {
    const response = await client.get('/violations/admin', { params });
    return response.data;
  },

  getTypes: async (targetType?: string) => {
    const params = targetType ? { targetType } : {};
    const response = await client.get('/violations/types', { params });
    return response.data;
  },

  getThresholds: async (targetType?: string) => {
    const params = targetType ? { targetType } : {};
    const response = await client.get('/violations/thresholds', { params });
    return response.data;
  },

  getPendingAppeals: async () => {
    const response = await client.get('/violations/admin/appeals/pending');
    return response.data;
  },

  getPendingPenalties: async () => {
    const response = await client.get('/violations/admin/penalties/pending');
    return response.data;
  },

  issue: async (data: any) => {
    const response = await client.post('/violations/admin/issue', data);
    return response.data;
  },

  reviewAppeal: async (id: string, data: any) => {
    const response = await client.patch(`/violations/admin/appeals/${id}/review`, data);
    return response.data;
  },

  reviewPenalty: async (id: string, data: any) => {
    const response = await client.patch(`/violations/admin/penalties/${id}/review`, data);
    return response.data;
  },

  createType: async (data: any) => {
    const response = await client.post('/violations/admin/types', data);
    return response.data;
  },

  updateType: async (id: string, data: any) => {
    const response = await client.patch(`/violations/admin/types/${id}`, data);
    return response.data;
  },

  createThreshold: async (data: any) => {
    const response = await client.post('/violations/admin/thresholds', data);
    return response.data;
  },

  updateThreshold: async (id: string, data: any) => {
    const response = await client.patch(`/violations/admin/thresholds/${id}`, data);
    return response.data;
  },

  deleteThreshold: async (id: string) => {
    const response = await client.delete(`/violations/admin/thresholds/${id}`);
    return response.data;
  },

  // User Endpoints
  getMyViolations: async () => {
    const response = await client.get('/violations/my');
    return response.data;
  },

  getMyScore: async () => {
    const response = await client.get('/violations/score');
    return response.data;
  },

  submitAppeal: async (violationId: string, data: { reason: string; evidenceUrls?: string[] }) => {
    const response = await client.post(`/violations/${violationId}/appeal`, data);
    return response.data;
  },

  uploadAppealFile: async (violationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('violationId', violationId);
    const response = await client.post('/uploads/appeals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
