import { apiClient } from './apiClient';

const clearToken = () => {
  localStorage.removeItem('attentrack_token');
  localStorage.removeItem('attentrack_active_role');
};

export const authService = {
  login: async (email, password) => {
    const response = await apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (response?.data?.token) {
      localStorage.setItem('attentrack_token', response.data.token);
    }
    return response;
  },

  signup: async (userData) => {
    const response = await apiClient('/auth/signup', {
      method: 'POST',
      body: userData,
    });
    if (response?.data?.token) {
      localStorage.setItem('attentrack_token', response.data.token);
    }
    return response;
  },

  getMe: async () => {
    return await apiClient('/auth/me');
  },

  logout: async () => {
    clearToken();
    return { success: true };
  },
};
