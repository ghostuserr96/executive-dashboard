import { ApiError } from '../../utils/ApiError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import mammoth from 'mammoth';

class PDFProcessor {
  /**
   * Extracts text from a document (PDF or DOCX) file buffer.
   * Returns an array of objects containing page content and metadata.
   * @param {Buffer} fileBuffer - The file as a buffer
   * @param {string} fileName - The name of the file
   * @returns {Promise<Array<{text: string, page_number: number}>>}
   */
  async extractText(fileBuffer, fileName = '') {
    try {
      const extractedData = [];
      const isDocx = fileName.toLowerCase().endsWith('.docx');

      if (isDocx) {
        // Handle DOCX files using mammoth
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        if (result.value) {
          const cleanedText = this._cleanText(result.value);
          if (cleanedText) {
            extractedData.push({
              text: cleanedText,
              page_number: 1 // DOCX doesn't easily support page parsing
            });
          }
        }
      } else {
        // Handle PDF files using pdf-parse with custom page renderer
        const self = this;
        function render_page(pageData) {
          let render_options = {
            normalizeWhitespace: false,
            disableCombineTextItems: false
          };
          return pageData.getTextContent(render_options).then(function(textContent) {
            let lastY, text = '';
            for (let item of textContent.items) {
              if (lastY == item.transform[5] || !lastY) {
                text += item.str;
              } else {
                text += '\n' + item.str;
              }    
              lastY = item.transform[5];
            }
            const cleanedText = self._cleanText(text);
            if (cleanedText) {
              extractedData.push({
                text: cleanedText,
                page_number: pageData.pageIndex + 1
              });
            }
            return text;
          }).catch(function(err) {
            console.error(`[pdfService] Failed to extract text from page ${pageData.pageIndex + 1}:`, err.message);
            return "";
          });
        }
        
        await pdfParse(fileBuffer, { pagerender: render_page });
      }

      return extractedData;
    } catch (error) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST, 
        `Failed to process document: ${error.message}`
      );
    }
  }

  /**
   * Cleans the extracted text by removing extra whitespace and non-printable characters.
   * @param {string} text - The raw text
   * @returns {string} - Cleaned text
   */
  _cleanText(text) {
    // Replace multiple newlines with a single newline
    let cleaned = text.replace(/\n+/g, '\n');
    // Replace multiple spaces with a single space
    cleaned = cleaned.replace(/\s+/g, ' ');
    // Remove non-printable characters (basic printable + common symbols)
    // In JS, we can use a regex to strip out control characters (except newline)
    cleaned = cleaned.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');
    
    return cleaned.trim();
  }
}

export const pdfProcessor = new PDFProcessor();
