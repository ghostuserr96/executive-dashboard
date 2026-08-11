import fs from 'fs';
import path from 'path';
import { pdfProcessor } from './pdfService.js';
import { chunkingService } from './chunkingService.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: 'd:/code/internDZ/attentrack/server/.env' });

async function testUpload() {
  try {
    // Look for any pdf in the project to test
    const dummyPdfPath = 'd:/code/internDZ/attentrack/dummy.pdf';
    
    // Create a simple PDF if one doesn't exist just to test the logic
    // Wait, pdfParse requires a valid PDF. Let's just create a mock text instead?
    // The user said they uploaded a multi-page PDF. Maybe the crash is in the chunkingService?
    
    console.log("Checking chunkingService logic...");
    const mockTextData = [
      { text: "This is page 1", page_number: 1 },
      { text: "This is page 2", page_number: 2 }
    ];
    
    const chunks = await chunkingService.createLLMChunks(mockTextData, { document_id: crypto.randomUUID(), document_name: 'test.pdf' });
    console.log("Chunks generated:", chunks.length);
    
  } catch (e) {
    console.error("Crash detected:", e);
  }
}

testUpload();
