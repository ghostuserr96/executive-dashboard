import { apiRequest } from './apiClient';

export const leaveService = {
  getAll: () => apiRequest('/leave'),

  getById: (id) => apiRequest(`/leave/${id}`),

  submit: (leaveData) => apiRequest('/leave', { method: 'POST', body: leaveData }),

  updateStatus: (id, status) => apiRequest(`/leave/${id}/status`, { method: 'PATCH', body: { status } }),

  delete: (id) => apiRequest(`/leave/${id}`, { method: 'DELETE' }),
};
