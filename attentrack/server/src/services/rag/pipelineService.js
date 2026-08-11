import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { pdfProcessor } from './pdfService.js';
import { chunkingService } from './chunkingService.js';
import { embeddingService } from './embeddingService.js';
import { vectorDbService } from './vectorDbService.js';
import crypto from 'crypto';

class PipelineService {
  /**
   * Orchestrates the PDF processing pipeline.
   * 1. Extract text
   * 2. Chunk text
   * 3. Generate embeddings
   * 4. Store in Vector DB
   * 
   * @param {Buffer} fileContent - The PDF file buffer
   * @param {Object} metadata - Metadata for the document
   * @returns {Promise<string>} - The document ID
   */
  async processDocument(fileContent, metadata = {}) {
    try {
      // 1. Extract Text
      console.log("[PipelineService] Starting text extraction...");
      const extractionResult = await pdfProcessor.extractText(fileContent, metadata.document_name);
      if (!extractionResult || extractionResult.length === 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No text extracted from document");
      }

      // 2. Chunk Text
      console.log("[PipelineService] Starting chunking...");
      if (!metadata.document_id) {
        metadata.document_id = crypto.randomUUID();
      }

      const chunks = await chunkingService.createLLMChunks(extractionResult, metadata);
      if (!chunks || chunks.length === 0) {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "No chunks created");
      }

      // 3. Generate Embeddings
      console.log(`[PipelineService] Generating embeddings for ${chunks.length} chunks...`);
      const textsToEmbed = chunks.map(chunk => chunk.text);
      const embeddings = await embeddingService.generateEmbeddings(textsToEmbed);

      if (embeddings.length !== chunks.length) {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Mismatch between chunks and embeddings count");
      }

      // 4. Store in Vector DB
      console.log("[PipelineService] Storing in Vector DB...");
      // Prepare metadata for each point (chunk-specific + document-global)
      const vectorsMetadata = chunks.map(chunk => ({
        ...chunk.metadata,
        text: chunk.text // Add text to metadata for retrieval context
      }));

      await vectorDbService.upsertVectors(embeddings, vectorsMetadata);

      console.log("[PipelineService] Pipeline completed successfully.");
      return metadata.document_id;

    } catch (error) {
      console.error(`[PipelineService] Pipeline failed: ${error.message}`);
      throw error;
    }
  }
}

export const pipelineService = new PipelineService();
