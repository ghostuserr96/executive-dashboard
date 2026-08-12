import OpenAI from 'openai';

class ChunkingService {
  constructor(chunkSize = 2000, chunkOverlap = 800) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async createLLMChunks(textData, baseMetadata) {
    console.log(`[ChunkingService] Starting LLM-based chunking...`);

    // Inject page markers into the raw text so Gemini/OpenAI knows the page numbers
    const fullText = textData.map(t => `--- PAGE ${t.page_number} ---\n${t.text}`).join('\n\n');

    // Safety check for massive documents (fallback to old chunker if > 500k chars)
    if (fullText.length > 500000) {
      console.warn(`[ChunkingService] Document too large for LLM chunking (${fullText.length} chars), falling back to character chunker.`);
      return this.createChunks(textData, baseMetadata);
    }

    let ai;
    let modelName;

    const groqKey = process.env.GROQ_RAG_API_KEY || process.env.GROQ_API_KEY;
    if (groqKey) {
      ai = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
      modelName = "llama3-70b-8192"; // 30K TPM — supports larger documents
    } else if (process.env.OPENAI_API_KEY) {
      ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      modelName = "gpt-4o-mini";
    } else {
      ai = new OpenAI({ apiKey: 'ollama', baseURL: "http://localhost:11434/v1" });
      modelName = "llama3";
    }

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
      "chunk_index": 0,
      "page_number": 1,
      "section": "Employee Information",
      "text": "Employee Name: ... | Department: ... | Designation: ..."
    }
  ]
}

RAW DOCUMENT TEXT:
${fullText}
`;

    const result = await ai.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });

    let responseText = result.choices[0].message.content.trim();

    // Strip markdown code blocks if present
    if (responseText.startsWith("\`\`\`")) {
      const lines = responseText.split("\\n");
      if (lines.length > 1) {
        lines.shift();
        if (lines[lines.length - 1].trim() === "\`\`\`") {
          lines.pop();
        }
        responseText = lines.join("\\n").trim();
      }
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      // Fallback regex logic to extract JSON if trailing text exists
      try {
        const match = responseText.match(/\\{.*\\}/s);
        if (match) {
          parsedData = JSON.parse(match[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch (e2) {
        console.error("[ChunkingService] LLM returned invalid JSON, falling back.", e.message);
        return this.createChunks(textData, baseMetadata);
      }
    }

    if (!parsedData.chunks || !Array.isArray(parsedData.chunks)) {
      console.error("[ChunkingService] LLM returned JSON without chunks array, falling back.");
      return this.createChunks(textData, baseMetadata);
    }

    const mergedMetadata = {
      ...baseMetadata,
      ...(parsedData.metadata || {})
    };

    const finalChunks = parsedData.chunks.map((chunk, index) => ({
      text: chunk.text,
      metadata: {
        ...mergedMetadata,
        chunk_index: chunk.chunk_index || index,
        page_number: chunk.page_number || 1, // Fallback to 1 if LLM missed it
        section: chunk.section || "General"
      }
    }));

    console.log(`[ChunkingService] LLM chunking successful. Created ${finalChunks.length} semantic chunks.`);
    return finalChunks;
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
