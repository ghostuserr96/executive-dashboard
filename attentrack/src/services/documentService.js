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
    try {
      // 1. Get upload signature from our backend
      const sigRes = await apiRequest(`/documents/upload-signature?folder=documents/${folder}`);
      const { signature, timestamp, apiKey, cloudName, folder: cloudFolder } = sigRes.data;

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', cloudFolder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      if (!cloudRes.ok) {
        const errorData = await cloudRes.json();
        throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
      }

      const cloudData = await cloudRes.json();

      // 3. Save metadata to our backend
      return await apiRequest('/documents', {
        method: 'POST',
        body: {
          directUpload: true,
          name: file.name,
          folder,
          size: file.size,
          url: cloudData.secure_url || cloudData.url,
          publicId: cloudData.public_id,
          resourceType: cloudData.resource_type,
          mimeType: file.type || 'application/octet-stream',
          uploadedBy,
          uploadedByName,
          description
        }
      });
    } catch (err) {
      throw err;
    }
  },

  update: (id, updateData) => apiRequest(`/documents/${id}`, { method: 'PUT', body: updateData }),

  delete: (id) => apiRequest(`/documents/${id}`, { method: 'DELETE' }),

  getByFolder: (folder) => apiRequest(`/documents?folder=${encodeURIComponent(folder)}`),

  getByEmployee: (employeeId) => apiRequest(`/documents?employeeId=${encodeURIComponent(employeeId)}`)
};