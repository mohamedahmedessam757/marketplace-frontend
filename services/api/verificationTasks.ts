import { client } from './client';

export const verificationTasksApi = {
  assignTask: (orderId: string, officerId?: string) =>
    client.post('/verification-tasks', { orderId, officerId }),

  getMyTasks: () => client.get('/verification-tasks/my-tasks'),

  getByOrder: (orderId: string) => client.get(`/verification-tasks/order/${orderId}`),

  getTask: (taskId: string) => client.get(`/verification-tasks/${taskId}`),

  getActivityLog: (taskId: string) => client.get(`/verification-tasks/${taskId}/activity-log`),

  generateLink: (taskId: string, durationHours = 24) =>
    client.post(`/verification-tasks/${taskId}/generate-link`, { durationHours }),

  validatePublicLink: (token: string) =>
    client.get(`/verification-tasks/public/link/${token}`),

  activateLink: (token: string, payload?: { lat?: number; lng?: number; deviceInfo?: Record<string, unknown> }) =>
    client.post(`/verification-tasks/link/${token}/activate`, payload ?? {}),

  start: (taskId: string, body: { lat?: number; lng?: number; deviceInfo?: Record<string, unknown> }) =>
    client.post(`/verification-tasks/${taskId}/start`, body),

  uploadPhotos: (taskId: string, body: { photos: string[]; lat?: number; lng?: number }) =>
    client.post(`/verification-tasks/${taskId}/upload-photos`, body),

  complete: (
    taskId: string,
    body: {
      decision: 'MATCHING' | 'NON_MATCHING';
      reason?: string;
      notes?: string;
      photos?: string[];
      lat?: number;
      lng?: number;
      deviceInfo?: Record<string, unknown>;
    },
  ) => client.post(`/verification-tasks/${taskId}/complete`, body),

  listOfficers: () => client.get('/verification-tasks/officers'),
};
