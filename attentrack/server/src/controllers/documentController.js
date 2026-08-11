import { DocumentService } from '../services/document.service.js';
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

export const getDocuments = asyncHandler(async (req, res) => {
  const folder = req.query.folder || undefined;
  const employeeId = req.query.employeeId || undefined;
  let documents;
  if (folder) {
    documents = await DocumentService.getDocumentsByFolder(folder);
  } else if (employeeId) {
    documents = await DocumentService.getDocumentsByEmployee(employeeId);
  } else {
    documents = await DocumentService.getAllDocuments();
  }
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, documents, 'Documents retrieved successfully'));
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const doc = await DocumentService.getDocumentById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, doc, 'Document fetched successfully'));
});

export const createDocument = asyncHandler(async (req, res) => {
  let fileData = null;
  const folder = req.body?.folder || 'General';

  if (req.body?.url && req.body.url.startsWith('data:')) {
    fileData = req.body.url;
  } else if (req.body?.base64) {
    const mimeType = req.body.mimeType || 'application/octet-stream';
    fileData = `data:${mimeType};base64,${req.body.base64}`;
  }

  if (!fileData) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No file data provided');
  }

  let uploadResult;
  try {
    uploadResult = await uploadToCloudinary(fileData, folder);
  } catch (cloudErr) {
    console.warn('[DocumentController] Cloudinary upload failed, storing as local data:', cloudErr.message);
    uploadResult = { url: fileData, publicId: 'local_fallback' };
  }

  const docData = {
    name: req.body.name || 'uploaded_document',
    folder: folder,
    size: req.body.size || 0,
    url: uploadResult.url,
    publicId: uploadResult.publicId || 'local_fallback',
    mimeType: req.body.mimeType || 'application/octet-stream',
    uploadedBy: req.body.uploadedBy || '',
    uploadedByName: req.body.uploadedByName || '',
    description: req.body.description || ''
  };

  const doc = await saveDocumentMeta(docData);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, doc, 'Document uploaded successfully'));
});

export const updateDocument = asyncHandler(async (req, res) => {
  const updated = await DocumentService.updateDocument(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, 'Document updated successfully'));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  await DocumentService.deleteDocument(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Document deleted successfully'));
});