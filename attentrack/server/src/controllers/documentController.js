import { DocumentService } from '../services/document.service.js';
import { uploadToCloudinary } from '../utils/cloudinaryUploader.js';
import { deleteFromCloudinary } from '../services/cloudinary.js';
import { rtdb } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { pipelineService } from '../services/rag/pipelineService.js';

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
    resourceType: docData.resourceType || 'image',   // store for correct Cloudinary deletion
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

const triggerBackgroundIngestion = async (documentId, url, folder, name) => {
  try {
    console.log(`[DocumentController] Starting background ingestion for doc: ${documentId}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download document from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const metadata = {
      document_id: documentId,
      document_name: name || 'Document',
      folder: folder || 'General',
    };

    await pipelineService.processDocument(buffer, metadata);
    console.log(`[DocumentController] Background ingestion complete for doc: ${documentId}`);
  } catch (error) {
    console.error(`[DocumentController] Background ingestion failed: ${error.message}`);
  }
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

export const getUploadSignature = asyncHandler(async (req, res) => {
  const folder = req.query.folder || 'documents/General';
  const timestamp = Math.floor(Date.now() / 1000);
  const apiSecret = config.cloudinaryApiSecret;
  const apiKey = config.cloudinaryApiKey;
  const cloudName = config.cloudinaryCloudName;

  if (!apiSecret || !apiKey || !cloudName) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Cloudinary credentials not configured');
  }

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder
  }, 'Signature generated successfully'));
});

export const createDocument = asyncHandler(async (req, res) => {
  const folder = req.body?.folder || 'General';

  // If the frontend already uploaded directly to Cloudinary and provided the URL
  if (req.body.directUpload && req.body.url) {
    const docData = {
      name: req.body.name || 'uploaded_document',
      folder: folder,
      size: req.body.size || 0,
      url: req.body.url,
      publicId: req.body.publicId || 'local_fallback',
      resourceType: req.body.resourceType || 'raw',
      mimeType: req.body.mimeType || 'application/octet-stream',
      uploadedBy: req.body.uploadedBy || '',
      uploadedByName: req.body.uploadedByName || '',
      description: req.body.description || ''
    };
    
    const doc = await saveDocumentMeta(docData);
    
    // Trigger background ingestion (non-blocking)
    if (doc.url) {
      triggerBackgroundIngestion(doc.id, doc.url, doc.folder, doc.name);
    }
    
    return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, doc, 'Document metadata saved successfully'));
  }

  let fileData = null;

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
    console.error('[DocumentController] Cloudinary upload failed:', cloudErr.message);
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Failed to upload document to Cloudinary: ${cloudErr.message}`);
  }

  const docData = {
    name: req.body.name || 'uploaded_document',
    folder: folder,
    size: req.body.size || 0,
    url: uploadResult.url,
    publicId: uploadResult.publicId || 'local_fallback',
    resourceType: uploadResult.resourceType || 'raw',   // store actual resource type
    mimeType: req.body.mimeType || 'application/octet-stream',
    uploadedBy: req.body.uploadedBy || '',
    uploadedByName: req.body.uploadedByName || '',
    description: req.body.description || ''
  };

  const doc = await saveDocumentMeta(docData);
  
  // Trigger background ingestion (non-blocking)
  if (doc.url) {
    triggerBackgroundIngestion(doc.id, doc.url, doc.folder, doc.name);
  }

  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, doc, 'Document uploaded successfully'));
});

export const updateDocument = asyncHandler(async (req, res) => {
  const updated = await DocumentService.updateDocument(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, 'Document updated successfully'));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  // Fetch doc first to get publicId + resourceType for Cloudinary cleanup
  let doc = null;
  try {
    doc = await DocumentService.getDocumentById(req.params.id);
  } catch (_) {
    // If not found, deleteDocument below will throw 404
  }

  await DocumentService.deleteDocument(req.params.id);

  // After DB + Pinecone deletion, remove the file from Cloudinary
  if (doc && doc.publicId && doc.publicId !== 'local_fallback') {
    const resType = doc.resourceType || 'raw'; // use stored type, default raw for docs
    await deleteFromCloudinary(doc.publicId, resType);
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, null, 'Document deleted successfully'));
});