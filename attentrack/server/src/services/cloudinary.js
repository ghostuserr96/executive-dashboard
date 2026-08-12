import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a resume buffer to Cloudinary.
 * Stored at:  resumes/<candidateName>.<ext>
 * Returns { resumeFileId, resumeLink }
 */
export const uploadResumeToCloudinay = (buffer, candidateName, ext) => {
  return new Promise((resolve, reject) => {
    // Sanitize name: "Virat Kohli" -> "virat_kohli"
    const safeName = candidateName
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase() || 'candidate';

    const publicId = `resumes/${safeName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'auto',    // 'auto' handles PDFs natively without strict 'raw' restrictions
        overwrite: true,          // candidate re-applying overwrites old file
        use_filename: false,
        unique_filename: false,
        format: ext               // keeps the original extension in the URL
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error.message);
          return reject(error);
        }
        console.log(`[Cloudinary] Uploaded resume: ${result.secure_url}`);
        resolve({
          resumeFileId: result.public_id,   // e.g.  resumes/virat_kohli
          resumeLink:   result.secure_url   // direct HTTPS download URL
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id.
 * @param {string} publicId - The Cloudinary public_id of the file
 * @param {'auto'|'raw'|'image'|'video'} resourceType - Cloudinary resource type (default: 'raw' for docs)
 */
export const deleteResumeFromCloudinary = async (publicId, resourceType = 'raw') => {
  if (!publicId) return false;
  try {
    // Try raw first (for PDFs/DOCX), fall back to auto if raw fails
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result === 'not found' && resourceType === 'raw') {
      // Retry as image resource type (for avatars stored as resume)
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }
    console.log(`[Cloudinary] Deleted file: ${publicId}`);
    return true;
  } catch (err) {
    console.error('[Cloudinary] Delete error:', err.message);
    return false;
  }
};

/**
 * Generic Cloudinary deletion — auto-detects resource type.
 * Use for images (avatars, photos) and documents (PDFs, DOCX).
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] Deleted: ${publicId} (${resourceType}) → ${result.result}`);
    return true;
  } catch (err) {
    console.error('[Cloudinary] Delete error:', err.message);
    return false;
  }
};
