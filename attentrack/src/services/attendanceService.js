import { apiRequest } from './apiClient';

export const attendanceService = {
  getLogs: () => apiRequest('/attendance'),

  clockIn: (details) => apiRequest('/attendance/clock-in', { method: 'POST', body: details }),

  markAttendance: (details) => apiRequest('/attendance/mark', { method: 'POST', body: details }),

  clockOut: (id) => apiRequest(`/attendance/clock-out/${id}`, { method: 'PUT' }),
};
