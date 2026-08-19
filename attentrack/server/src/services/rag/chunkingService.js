import OpenAI from 'openai';

class ChunkingService {
  constructor(chunkSize = 2000, chunkOverlap = 800) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async createLLMChunks(textData, baseMetadata) {
    console.log(`[ChunkingService] Starting LLM-based chunking in batches...`);

    let ai;
    let modelName;

    const groqKey = process.env.GROQ_RAG_API_KEY || process.env.GROQ_API_KEY;
    if (groqKey) {
      ai = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
      modelName = "openai/gpt-oss-120b"; // Restored exact model from API key
    } else if (process.env.OPENAI_API_KEY) {
      ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      modelName = "gpt-4o-mini";
    } else {
      ai = new OpenAI({ apiKey: 'ollama', baseURL: "http://localhost:11434/v1" });
      modelName = "llama3";
    }

    const finalChunks = [];
    let currentBatchText = "";
    
    // 25,000 chars is roughly 6,000 tokens, safely under 8K context limits
    const MAX_CHARS_PER_BATCH = 25000; 

    for (const page of textData) {
      const pageString = `--- PAGE ${page.page_number} ---\n${page.text}\n\n`;
      
      if (currentBatchText.length + pageString.length > MAX_CHARS_PER_BATCH && currentBatchText.length > 0) {
        const batchChunks = await this._processLLMBatch(ai, modelName, currentBatchText, baseMetadata);
        finalChunks.push(...batchChunks);
        currentBatchText = "";
      }
      
      currentBatchText += pageString;
    }
    
    if (currentBatchText.length > 0) {
      const batchChunks = await this._processLLMBatch(ai, modelName, currentBatchText, baseMetadata);
      finalChunks.push(...batchChunks);
    }

    console.log(`[ChunkingService] LLM chunking successful. Created ${finalChunks.length} semantic chunks.`);
    
    // Ensure all chunks have a valid sequential index
    return finalChunks.map((chunk, index) => ({
      text: chunk.text,
      metadata: {
        ...chunk.metadata,
        chunk_index: index
      }
    }));
  }

  async _processLLMBatch(ai, modelName, batchText, baseMetadata) {
    const prompt = `You are an expert HR document parser.

Your task is to process employee-related documents such as payslips, salary slips, offer letters, and HR records, and convert them into clean, structured, semantically meaningful chunks optimized for embedding in a RAG system.
The document contains --- PAGE X --- markers. Use these markers to output the EXACT page_number for each chunk.

STRICT INSTRUCTIONS:
- Extract fields: Employee Name, Department, Designation, Date of Joining, Pay Period, Salary details, Worked Days.
- Clean text into 'Key: Value' format.
- Split into logical sections: Employee Information, Employment Details, Payroll Details, Salary Breakdown.
- Each chunk must contain only ONE concept.
- Do NOT mix unrelated data.
- Keep chunks short and clear.
- Do NOT hallucinate.

Return ONLY valid JSON in this format (Do not use markdown blocks, output raw JSON):
{
  "metadata": {
    "employee_name": "...",
    "department": "...",
    "document_type": "Payslip",
    "year": "YYYY"
  },
  "chunks": [
    {
      "page_number": 1,
      "section": "Employee Information",
      "text": "Employee Name: ... | Department: ... | Designation: ..."
    }
  ]
}

RAW DOCUMENT TEXT:
${batchText}
`;

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await ai.chat.completions.create({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        });
        break; // Success
      } catch (llmError) {
        console.warn(`[ChunkingService] LLM batch failed (${llmError.message}). Retries left: ${retries - 1}`);
        retries--;
        if (retries === 0) {
          console.error(`[ChunkingService] Skipping batch after max retries.`);
          return []; // Skip if completely failed
        }
        // Wait 20 seconds before retrying to let the per-minute rate limit reset
        await new Promise(resolve => setTimeout(resolve, 20000));
      }
    }

    let responseText = result.choices[0].message.content.trim();

    if (responseText.startsWith("\`\`\`")) {
      const lines = responseText.split("\n");
      if (lines.length > 1) {
        lines.shift();
        if (lines[lines.length - 1].trim() === "\`\`\`") {
          lines.pop();
        }
        responseText = lines.join("\n").trim();
      }
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      try {
        const match = responseText.match(/\{.*\}/s);
        if (match) {
          parsedData = JSON.parse(match[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch (e2) {
        console.error(`[ChunkingService] LLM returned invalid JSON for batch, skipping.`);
        return [];
      }
    }

    if (!parsedData.chunks || !Array.isArray(parsedData.chunks)) {
      console.error("[ChunkingService] LLM returned JSON without chunks array for batch, skipping.");
      return [];
    }

    const mergedMetadata = {
      ...(parsedData.metadata || {}),
      ...baseMetadata
    };

    return parsedData.chunks.map(chunk => ({
      text: chunk.text,
      metadata: {
        ...mergedMetadata,
        page_number: chunk.page_number || 1,
        section: chunk.section || "General"
      }
    }));
  }

  createChunks(textData, baseMetadata) {
    const chunks = [];
    let globalChunkIndex = 0;

    console.log(`[ChunkingService] Starting character chunking fallback for document with ${textData.length} pages.`);

    for (const pageData of textData) {
      const pageText = pageData.text;
      const pageNumber = pageData.page_number;

      const splitTexts = this.splitText(pageText);

      for (const splitText of splitTexts) {
        if (!splitText || splitText.trim() === '') {
          continue;
        }

        const chunkMetadata = {
          ...baseMetadata,
          page_number: pageNumber,
          chunk_index: globalChunkIndex
        };

        chunks.push({
          text: splitText.trim(),
          metadata: chunkMetadata
        });
        globalChunkIndex++;
      }
    }

    return chunks;
  }

  splitText(text) {
    if (text.length <= this.chunkSize) {
      return [text];
    }

    const separators = ['\n\n', '\n', '. ', ' ', ''];
    let goodSplits = [];
    let currentSeparator = '';

    for (const sep of separators) {
      if (sep === '' || text.includes(sep)) {
        const splits = sep === '' ? text.split('') : text.split(sep);

        let allValid = true;
        for (const s of splits) {
          if (s.length > this.chunkSize && sep !== '') {
            allValid = false;
            break;
          }
        }

        if (allValid || sep === '') {
          goodSplits = splits;
          currentSeparator = sep;
          break;
        }
      }
    }

    return this.mergeSplits(goodSplits, currentSeparator);
  }

  mergeSplits(splits, separator) {
    const chunks = [];
    let currentDoc = [];
    let currentLength = 0;

    for (const split of splits) {
      const splitLength = split.length + (currentLength > 0 ? separator.length : 0);

      if (currentLength + splitLength > this.chunkSize && currentDoc.length > 0) {
        chunks.push(currentDoc.join(separator));

        while (currentDoc.length > 0 && currentLength > this.chunkOverlap) {
          const removed = currentDoc.shift();
          currentLength -= removed.length + separator.length;
        }
      }

      currentDoc.push(split);
      currentLength += split.length + (currentDoc.length > 1 ? separator.length : 0);
    }

    if (currentDoc.length > 0) {
      chunks.push(currentDoc.join(separator));
    }

    return chunks;
  }
}

export const chunkingService = new ChunkingService();
