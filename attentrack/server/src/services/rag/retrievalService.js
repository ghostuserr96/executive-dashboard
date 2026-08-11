import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { embeddingService } from './embeddingService.js';
import { vectorDbService } from './vectorDbService.js';

class RetrievalService {
  /**
   * Retrieves top-k relevant manual chunks for a given query and manual identifiers.
   * @param {string} query - The user's query
   * @param {Object} filters - Filter parameters for Vector DB
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array<Object>>}
   */
  async retrieveManualContext(query, filters = {}, topK = 5) {
    try {
      // Pass 'query' as input type for Pinecone inference
      const embeddings = await embeddingService.generateEmbeddings([query], 'query');
      if (!embeddings || !embeddings[0]) {
        throw new ApiError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Failed to generate query embedding"
        );
      }

      const queryEmbedding = embeddings[0];

      const searchResults = await vectorDbService.searchVectors(
        queryEmbedding,
        filters,
        topK
      );

      const contexts = searchResults.map(point => {
        const payload = point.payload || {};
        
        // Extract metadata (everything except text)
        const metadata = { ...payload };
        delete metadata.text;

        return {
          text: payload.text || "",
          score: point.score,
          metadata: metadata
        };
      });

      return contexts;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `Failed to retrieve relevant chunks: ${error.message}`
      );
    }
  }
}

export const retrievalService = new RetrievalService();
