import { apiRequest } from './apiClient';

export const documentService = {
  getAll: (folder, employeeId) => {
    const params = new URLSearchParams();
    if (folder) params.set('folder', folder);
    if (employeeId) params.set('employeeId', employeeId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/documents${query}`);
  },

  getById: (id) => apiRequest(`/documents/${id}`),

  upload: async (file, folder = 'General', description = '', uploadedBy = '', uploadedByName = '') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result;
          const mimeType = file.type || 'application/octet-stream';
          const res = await apiRequest('/documents', {
            method: 'POST',
            body: {
              name: file.name,
              folder,
              size: file.size,
              url: base64,
              publicId: 'local_upload',
              mimeType,
              uploadedBy,
              uploadedByName,
              description
            }
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  update: (id, updateData) => apiRequest(`/documents/${id}`, { method: 'PUT', body: updateData }),

  delete: (id) => apiRequest(`/documents/${id}`, { method: 'DELETE' }),

  getByFolder: (folder) => apiRequest(`/documents?folder=${encodeURIComponent(folder)}`),

  getByEmployee: (employeeId) => apiRequest(`/documents?employeeId=${encodeURIComponent(employeeId)}`)
};