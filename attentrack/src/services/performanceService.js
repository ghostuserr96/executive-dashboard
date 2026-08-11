import { apiRequest } from './apiClient';

export const performanceService = {
  getAll: () => apiRequest('/performance'),

  getByEmployeeId: (employeeId) => apiRequest(`/performance/employee/${employeeId}`),

  submitReview: (reviewData) => apiRequest('/performance', { method: 'POST', body: reviewData }),

  updateReview: (id, reviewData) => apiRequest(`/performance/${id}`, { method: 'PATCH', body: reviewData }),

  deleteReview: (id) => apiRequest(`/performance/${id}`, { method: 'DELETE' }),
};
