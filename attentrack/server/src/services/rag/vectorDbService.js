import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { Pinecone } from '@pinecone-database/pinecone';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class VectorDbService {
  constructor() {
    this.client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    // From your configuration
    this.indexName = process.env.PINECONE_INDEX || 'hrms';
    this.index = this.client.index(this.indexName);
  }

  /**
   * Upserts vectors into the database.
   * @param {Array<Array<number>>} vectors - List of embeddings
   * @param {Array<Object>} metadata - List of metadata objects corresponding to vectors
   * @returns {Promise<void>}
   */
  async upsertVectors(vectors, metadata) {
    try {
      if (vectors.length !== metadata.length) {
        throw new Error("Vectors and metadata length mismatch");
      }

      const points = vectors.map((vector, index) => {
        // Sanitize metadata: Pinecone doesn't allow null or undefined values
        const cleanMetadata = {};
        for (const [key, value] of Object.entries(metadata[index] || {})) {
          if (value !== null && value !== undefined) {
            cleanMetadata[key] = value;
          }
        }
        
        return {
          id: crypto.randomUUID(),
          values: vector,
          metadata: cleanMetadata
        };
      });

      // Pinecone requires batching for large inserts, we do a simple single batch here
      // Maximum vectors per upsert request is 1000 for pinecone
      await this.index.upsert({ records: points });
      
      console.log(`[VectorDbService] Upserted ${vectors.length} vectors to Pinecone DB.`);
    } catch (error) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `Failed to upsert vectors to Pinecone: ${error.message}`
      );
    }
  }

  /**
   * Searches the vector database for similar vectors.
   * @param {Array<number>} queryVector - The embedding of the search query
   * @param {Object} filters - Key-value pairs for metadata filtering
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array<{score: number, payload: Object}>>}
   */
  async searchVectors(queryVector, filters, limit = 5) {
    try {
      let pineconeFilter = undefined;
      
      if (filters && Object.keys(filters).length > 0) {
        const mustConditions = {};
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null && value !== '') {
            mustConditions[key] = { "$eq": value };
          }
        }
        if (Object.keys(mustConditions).length > 0) {
          pineconeFilter = mustConditions;
        }
      }

      const searchResults = await this.index.query({
        vector: queryVector,
        filter: pineconeFilter,
        topK: limit,
        includeMetadata: true
      });
      
      return searchResults.matches.map(result => ({
        score: result.score,
        payload: result.metadata
      }));

    } catch (error) {
       throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `Failed to search vectors in Pinecone: ${error.message}`
      );
    }
  }

  /**
   * Checks if a document has already been ingested in the vector database.
   * @param {string} documentId - The unique document identifier
   * @returns {Promise<boolean>}
   */
  async hasDocument(documentId) {
    try {
      // Query with a dummy vector to check if any records have this document_id
      const searchResults = await this.index.query({
        vector: Array(1024).fill(0.001), // dummy non-zero vector to satisfy Pinecone query constraints
        filter: { document_id: { "$eq": documentId } },
        topK: 1,
        includeMetadata: false
      });
      
      return searchResults.matches && searchResults.matches.length > 0;
    } catch (error) {
      console.warn(`[VectorDbService] Warning: Could not check if document exists: ${error.message}`);
      return false; // On error, assume it doesn't exist to allow processing
    }
  }

  /**
   * Deletes all vectors associated with a specific document ID.
   * @param {string} documentId - The unique document identifier
   * @returns {Promise<void>}
   */
  async deleteVectorsByDocumentId(documentId) {
    if (!documentId) return;
    try {
      // Pinecone requires the { filter: { ... } } wrapper object
      // Perform deletion using the String version
      await this.index.deleteMany({ filter: { document_id: { "$eq": String(documentId) } } });
      
      // Since some legacy document IDs were saved as Numbers (e.g. Date.now()),
      // we must also delete them using the Number format if applicable.
      const numId = Number(documentId);
      if (!isNaN(numId)) {
        await this.index.deleteMany({ filter: { document_id: { "$eq": numId } } });
      }

      console.log(`[VectorDbService] Successfully deleted all vectors for document_id: ${documentId}`);
    } catch (error) {
      console.warn(`[VectorDbService] Warning: Could not delete vectors for document_id: ${documentId}. ${error.message}`);
    }
  }
}

export const vectorDbService = new VectorDbService();
