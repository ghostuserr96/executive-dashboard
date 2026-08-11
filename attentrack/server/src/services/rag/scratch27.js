import { pdfProcessor } from './pdfService.js';
import fs from 'fs';
import path from 'path';

// Let's create a minimal valid PDF using an existing library or just download one.
import http from 'http';

const url = 'http://www.africau.edu/images/default/sample.pdf';
const dest = './sample.pdf';

const file = fs.createWriteStream(dest);
http.get(url, function(response) {
  response.pipe(file);
  file.on('finish', async function() {
    file.close(async () => {
        try {
            console.log("Downloaded sample PDF");
            const buffer = fs.readFileSync(dest);
            console.log("Testing pdfProcessor.extractText...");
            const data = await pdfProcessor.extractText(buffer, "sample.pdf");
            console.log("Extracted pages:", data.length);
            console.log("Page 1 preview:", data[0]?.text.substring(0, 100));
        } catch(e) {
            console.error("Crash during extraction:", e);
        }
    });
  });
});
