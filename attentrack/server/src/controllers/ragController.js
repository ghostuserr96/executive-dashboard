import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { pipelineService } from '../services/rag/pipelineService.js';
import { chatPipeline } from '../services/rag/chatPipeline.js';
import { vectorDbService } from '../services/rag/vectorDbService.js';

export const ingestDocument = asyncHandler(async (req, res) => {
  const { documentId, url, folder, name } = req.body;

  if (!documentId || !url) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Document ID and URL are required for ingestion');
  }

  try {
    // Check if document already exists in vector DB
    const isIngested = await vectorDbService.hasDocument(documentId);
    if (isIngested) {
      console.log(`[ragController] Document ${documentId} is already ingested. Skipping pipeline.`);
      return res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, { documentId }, 'Document was already ingested previously')
      );
    }

    // Download the PDF from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download PDF from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run the pipeline
    const metadata = {
      document_id: documentId,
      document_name: name || 'Document',
      folder: folder || 'General',
    };

    const resultDocId = await pipelineService.processDocument(buffer, metadata);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { documentId: resultDocId }, 'Document successfully ingested for chat')
    );
  } catch (error) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Ingestion failed: ${error.message}`);
  }
});

export const chatWithDocument = asyncHandler(async (req, res) => {
  const { query, documentId, history } = req.body;

  if (!query || !documentId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Query and Document ID are required for chat');
  }

  try {
      const request = {
        query,
        // Pass the documentId as the filter (e.g. into the document_name filter if that's how we set up the vector db)
        filters: { document_id: documentId },
        top_k: query.toLowerCase().includes('summarize') ? 15 : 5
      };

    const result = await chatPipeline.runChatPipeline(request, history || []);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Chat response generated successfully')
    );
  } catch (error) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Chat failed: ${error.message}`);
  }
});
