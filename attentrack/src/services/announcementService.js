import { apiRequest } from './apiClient';

export const announcementService = {
  getAll: () => apiRequest('/announcements'),

  getById: (id) => apiRequest(`/announcements/${id}`),

  create: (announcementData) => apiRequest('/announcements', { method: 'POST', body: announcementData }),

  update: (id, updateData) => apiRequest(`/announcements/${id}`, { method: 'PUT', body: updateData }),

  delete: (id) => apiRequest(`/announcements/${id}`, { method: 'DELETE' }),

  togglePin: (id, isPinned) => apiRequest(`/announcements/${id}/pin`, { method: 'PATCH', body: { isPinned } }),

  toggleLike: (id, userId) => apiRequest(`/announcements/${id}/like`, { method: 'PATCH', body: { userId } }),

  addComment: (id, commentData) => apiRequest(`/announcements/${id}/comments`, { method: 'POST', body: commentData }),

  deleteComment: (id, commentId) => apiRequest(`/announcements/${id}/comments/${commentId}`, { method: 'DELETE' }),
};
