import { apiRequest } from './apiClient';

export const employeeService = {
  getAll: () => apiRequest('/employees'),

  getById: (id) => apiRequest(`/employees/${id}`),

  create: (employeeData) => apiRequest('/employees', { method: 'POST', body: employeeData }),

  update: (id, updateData) => apiRequest(`/employees/${id}`, { method: 'PUT', body: updateData }),

  delete: (id) => apiRequest(`/employees/${id}`, { method: 'DELETE' }),
};
