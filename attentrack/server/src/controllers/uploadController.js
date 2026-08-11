import { uploadToCloudinary } from '../utils/cloudinaryUploader.js';
import { rtdb } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

const saveDocumentMeta = async (docData) => {
  const id = Date.now();
  const now = new Date().toISOString();
  const doc = {
    id,
    name: docData.name,
    folder: docData.folder || 'General',
    size: docData.size || 0,
    url: docData.url || '',
    publicId: docData.publicId || '',
    mimeType: docData.mimeType || '',
    uploadedBy: docData.uploadedBy || '',
    uploadedByName: docData.uploadedByName || '',
    description: docData.description || '',
    status: 'Active',
    createdAt: now,
    updatedAt: now
  };
  await rtdb.ref(`documents/${id}`).set(doc);
  return doc;
};

export const uploadImage = asyncHandler(async (req, res) => {
  let fileData = null;
  const folder = req.body?.folder || req.query?.folder || 'attentrack/employees';

  if (req.file && req.file.buffer) {
    const mimeType = req.file.mimetype || 'image/jpeg';
    fileData = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;
  } else if (req.body?.image || req.body?.base64 || req.body?.fileData) {
    fileData = req.body.image || req.body.base64 || req.body.fileData;
  }

  if (!fileData) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No image file or base64 image data provided');
  }

  try {
    const uploadResult = await uploadToCloudinary(fileData, folder);
    const docMeta = await saveDocumentMeta({
      name: req.body?.name || req.file?.originalname || 'uploaded_image',
      folder: req.body?.folder || 'General',
      size: req.file?.size || 0,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      mimeType: req.file?.mimetype || 'image/jpeg',
      uploadedBy: req.body?.uploadedBy || '',
      uploadedByName: req.body?.uploadedByName || '',
      description: req.body?.description || ''
    });
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { ...uploadResult, document: docMeta }, 'Image uploaded successfully')
    );
  } catch (error) {
    console.warn(`[UploadController] Cloudinary fallback triggered: ${error.message}`);
    const docMeta = await saveDocumentMeta({
      name: req.body?.name || req.file?.originalname || 'uploaded_image',
      folder: req.body?.folder || 'General',
      size: req.file?.size || 0,
      url: fileData,
      publicId: 'local_fallback',
      mimeType: req.file?.mimetype || 'image/jpeg',
      uploadedBy: req.body?.uploadedBy || '',
      uploadedByName: req.body?.uploadedByName || '',
      description: req.body?.description || ''
    });
    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, {
        url: fileData,
        publicId: 'local_fallback',
        document: docMeta,
        warning: `Cloudinary notice: ${error.message}. Saved using local image data.`
      }, 'Image stored successfully')
    );
  }
});

// Triggered nodemon restart cleanly
