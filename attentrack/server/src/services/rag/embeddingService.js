import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

class EmbeddingService {
  /**
   * Initializes the EmbeddingService using Gemini API.
   */
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-embedding-2';
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Generates embeddings for a list of texts using Gemini API.
   * @param {string[]} texts - Array of texts to embed
   * @param {string} inputType - 'passage' for indexing, 'query' for searching
   * @returns {Promise<Array<Array<number>>>} - Array of embeddings
   */
  async generateEmbeddings(texts, inputType = 'RETRIEVAL_DOCUMENT') {
    if (!this.ai) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "GEMINI_API_KEY not configured in .env");
    }

    const maxRetries = 3;
    const taskType = inputType === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT';
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const embeddings = [];
        
        // Gemini batch embedding or single embedding
        // We'll iterate through texts to ensure it works smoothly
        for (const text of texts) {
          const response = await this.ai.models.embedContent({
            model: this.model,
            contents: text,
            config: {
              taskType: taskType,
              outputDimensionality: 1024 // Match Pinecone 1024 dimension!
            }
          });
          embeddings.push(response.embeddings[0].values);
        }
        
        return embeddings;

      } catch (error) {
        console.warn(`[EmbeddingService] Error generating embeddings (attempt ${attempt + 1}/${maxRetries}): ${error.message}`);
        if (attempt === maxRetries - 1) {
          throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            `Failed to generate embeddings after ${maxRetries} attempts: ${error.message}`
          );
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

export const embeddingService = new EmbeddingService();
