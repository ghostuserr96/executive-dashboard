import { apiRequest } from './apiClient';

export const taskService = {
  getAll: () => apiRequest('/tasks'),

  getById: (id) => apiRequest(`/tasks/${id}`),

  create: (taskData) => apiRequest('/tasks', { method: 'POST', body: taskData }),

  update: (id, taskData) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: taskData }),

  updateStatus: (id, status) => apiRequest(`/tasks/${id}/status`, { method: 'PATCH', body: { status } }),

  delete: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
};
