import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Uploads image data (Base64 Data URL or file Buffer Data URL) directly to Cloudinary using signed REST API.
 * @param {string} fileData - Base64 Data URL (e.g. "data:image/jpeg;base64,...") or image URL
 * @param {string} folder - Destination Cloudinary folder
 * @returns {Promise<{url: string, publicId: string, width: number, height: number, format: string}>}
 */
export async function uploadToCloudinary(fileData, folder = 'attentrack/employees') {
  if (!fileData) {
    throw new Error('No image data provided for Cloudinary upload');
  }

  const cloudName = config.cloudinaryCloudName || 'attentrack';
  const apiKey = config.cloudinaryApiKey || '974898652582471';
  const apiSecret = config.cloudinaryApiSecret || 'hsLiR3L3vWskefKfbaWmxxqjEuw';

  const timestamp = Math.floor(Date.now() / 1000);
  
  // Signed upload parameters (sorted alphabetically)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  const formData = new URLSearchParams();
  formData.append('file', fileData);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.warn('[CloudinaryUploader] Cloudinary upload notice:', data.error?.message || response.statusText);
      // Fallback: If Cloud Name does not match or API restricted, generate clean hosted image URL or handle gracefully
      if (data.error) {
        throw new Error(data.error.message);
      }
    }

    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format
    };
  } catch (error) {
    console.error('[CloudinaryUploader] Upload error:', error.message);
    throw error;
  }
}
