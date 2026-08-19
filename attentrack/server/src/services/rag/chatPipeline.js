import { retrievalService } from './retrievalService.js';
import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class ChatPipeline {
  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openAiKey = process.env.OPENAI_API_KEY;
    this.groqKey = process.env.GROQ_RAG_API_KEY || process.env.GROQ_API_KEY;

    if (this.groqKey) {
      console.log("Using Groq API for Chat Pipeline");
      this.ai = new OpenAI({ apiKey: this.groqKey, baseURL: "https://api.groq.com/openai/v1" });
      this.model = 'llama3-8b-8192'; // Standard Groq model available for this API key
    } else if (this.openAiKey) {
      console.log("Using OpenAI API for Chat Pipeline");
      this.ai = new OpenAI({ apiKey: this.openAiKey });
      this.model = 'gpt-4o-mini';
    } else {
      console.log("Using local Ollama API for Chat Pipeline");
      this.ai = new OpenAI({ apiKey: 'ollama', baseURL: "http://localhost:11434/v1" });
      this.model = 'llama3';
    }
  }

  /**
   * Generates an answer using the LLM.
   * @param {string} query - The user's query
   * @param {Array<Object>} contexts - Retrieved context from Vector DB
   * @param {Array<Object>} history - Chat history
   * @returns {Promise<string>}
   */
  async _generateAnswer(query, contexts, history) {
    try {
      // Build the prompt using contexts
      let contextText = contexts.map((c, i) => `Context [${i + 1}]:\n${c.text}`).join('\n\n');

      const systemPrompt = `You are DocuBot, a helpful AI assistant analyzing a document for the user.
You are provided with snippets of the document in the "Contexts" section below.
If the user asks you to summarize, summarize the provided Contexts as best as you can.
If the user asks a specific question, answer it using ONLY the provided Contexts.
If the answer cannot be deduced from the Contexts, say that you don't have enough information from the document.
Keep your answers clear, concise, and helpful.

Contexts:
${contextText}`;

      const messages = [
        { role: "system", content: systemPrompt }
      ];

      for (const msg of history) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }

      messages.push({ role: "user", content: query });

      const response = await this.ai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.2,
        top_p: 0.7,
      });

      return response.choices[0].message.content;

    } catch (error) {
      throw new Error(`LLM Generation Failed: ${error.message}`);
    }
  }

  /**
   * Runs the complete chat pipeline: Retrieve -> Generate
   * Optional: You can wrap this in LangGraph.js if you need complex graph state management.
   * 
   * @param {Object} request - Request object
   * @param {Object} request.filters - Metadata filters
   * @param {string} request.document_name - Filter
   * @param {string} request.product_code - Filter
   * @param {number} request.top_k - Number of contexts to retrieve
   * @param {Array} history - Previous chat messages
   * @returns {Promise<Object>} - Contains answer and the context used
   */
  async runChatPipeline(request, history = []) {
    try {
      // 1. Retrieve
      const contexts = await retrievalService.retrieveManualContext(
        request.query,
        request.filters || {},
        request.top_k || 5
      );

      // 2. Generate
      const answer = await this._generateAnswer(request.query, contexts, history);

      return {
        answer,
        contexts
      };

    } catch (error) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `Chat pipeline failed: ${error.message}`
      );
    }
  }
}

export const chatPipeline = new ChatPipeline();
