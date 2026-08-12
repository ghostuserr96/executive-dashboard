import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Uploads any file (image, PDF, DOCX, etc.) to Cloudinary using signed REST API.
 * Auto-detects resource_type from MIME type:
 *   - image/*          → 'image' endpoint
 *   - video/*          → 'video' endpoint
 *   - application/pdf, application/msword, etc. → 'raw' endpoint
 *
 * @param {string} fileData - Base64 Data URL (e.g. "data:image/jpeg;base64,..." or "data:application/pdf;base64,...")
 * @param {string} folder - Destination Cloudinary folder
 * @returns {Promise<{url: string, publicId: string, resourceType: string, format?: string}>}
 */
export async function uploadToCloudinary(fileData, folder = 'attentrack/employees') {
  if (!fileData) {
    throw new Error('No file data provided for Cloudinary upload');
  }

  const cloudName = config.cloudinaryCloudName;
  const apiKey    = config.cloudinaryApiKey;
  const apiSecret = config.cloudinaryApiSecret;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials not configured in environment variables');
  }

  // Detect resource type from Data URL mime type
  let resourceType = 'image'; // default
  const mimeMatch = fileData.match(/^data:([^;]+);base64,/);
  if (mimeMatch) {
    const mime = mimeMatch[1].toLowerCase();
    if (mime.startsWith('video/')) {
      resourceType = 'video';
    } else if (
      mime.startsWith('application/') ||
      mime.startsWith('text/') ||
      mime === 'application/pdf' ||
      mime === 'application/msword' ||
      mime.includes('officedocument') ||
      mime.includes('opendocument')
    ) {
      resourceType = 'raw';
    }
    // image/* stays as 'image'
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Signed upload parameters (alphabetical order required by Cloudinary)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  const formData = new URLSearchParams();
  formData.append('file', fileData);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('[CloudinaryUploader] Upload error:', data.error?.message || response.statusText);
      throw new Error(data.error?.message || `Cloudinary upload failed: ${response.statusText}`);
    }

    console.log(`[CloudinaryUploader] Uploaded (${resourceType}): ${data.secure_url}`);

    return {
      url:          data.secure_url || data.url,
      publicId:     data.public_id,
      resourceType: data.resource_type || resourceType,
      format:       data.format,
      width:        data.width,
      height:       data.height
    };
  } catch (error) {
    console.error('[CloudinaryUploader] Upload error:', error.message);
    throw error;
  }
}
