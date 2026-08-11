import { apiClient } from './apiClient';

export const uploadService = {
  uploadFile: async (file, folder = 'attentrack/employees') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await apiClient('/upload/base64', {
            method: 'POST',
            body: {
              base64: reader.result,
              folder,
              name: file.name
            }
          });
          resolve(res.data || res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  uploadBase64: async (base64Data, folder = 'attentrack/employees') => {
    const res = await apiClient('/upload/base64', {
      method: 'POST',
      body: {
        base64: base64Data,
        folder
      }
    });
    return res.data || res;
  },

  uploadDocument: async (file, folder = 'General', description = '', uploadedBy = '', uploadedByName = '') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result;
          const mimeType = file.type || 'application/octet-stream';
          const res = await apiClient('/documents', {
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
          resolve(res.data || res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
};
