import { apiRequest } from './apiClient';

export const organizationService = {
  getAllDepartments: () => apiRequest('/departments'),
  getDepartment: (id) => apiRequest(`/departments/${id}`),
  createDepartment: (data) => apiRequest('/departments', { method: 'POST', body: data }),
  updateDepartment: (id, data) => apiRequest(`/departments/${id}`, { method: 'PUT', body: data }),
  deleteDepartment: (id) => apiRequest(`/departments/${id}`, { method: 'DELETE' }),

  getAllTeams: () => apiRequest('/teams'),
  getTeam: (id) => apiRequest(`/teams/${id}`),
  getTeamsByDepartment: (departmentId) => apiRequest(`/departments/${departmentId}/teams`),
  createTeam: (data) => apiRequest('/teams', { method: 'POST', body: data }),
  updateTeam: (id, data) => apiRequest(`/teams/${id}`, { method: 'PUT', body: data }),
  deleteTeam: (id) => apiRequest(`/teams/${id}`, { method: 'DELETE' }),
};
