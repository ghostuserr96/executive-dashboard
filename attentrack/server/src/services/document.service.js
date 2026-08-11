import { DocumentModel } from '../models/Document.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { vectorDbService } from './rag/vectorDbService.js';

export class DocumentService {
  static async getAllDocuments() {
    return await DocumentModel.findAll();
  }

  static async getDocumentById(id) {
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Document with ID ${id} not found`);
    }
    return doc;
  }

  static async getDocumentsByFolder(folder) {
    return await DocumentModel.findByFolder(folder);
  }

  static async getDocumentsByEmployee(employeeId) {
    return await DocumentModel.findByEmployee(employeeId);
  }

  static async createDocument(data) {
    if (!data.name || !data.url) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Document name and URL are required');
    }
    return await DocumentModel.create(data);
  }

  static async updateDocument(id, updateData) {
    const updated = await DocumentModel.update(id, updateData);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Document with ID ${id} not found`);
    }
    return updated;
  }

  static async deleteDocument(id) {
    const success = await DocumentModel.delete(id);
    if (!success) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Document with ID ${id} not found`);
    }
    
    // Asynchronously delete chunks from the vector database to prevent orphaned data
    // Wrapped in try/catch so if Pinecone fails, the main deletion still succeeds
    try {
      await vectorDbService.deleteVectorsByDocumentId(id);
    } catch (err) {
      console.warn(`[DocumentService] Failed to delete embeddings from Pinecone for doc ${id}:`, err.message);
    }
    
    return true;
  }
}