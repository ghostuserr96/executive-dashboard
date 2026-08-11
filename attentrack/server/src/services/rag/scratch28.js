import { pdfProcessor } from './pdfService.js';
import fs from 'fs';
import https from 'https'; // use HTTPS this time!

const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const dest = './sample2.pdf';

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', async function() {
    file.close(async () => {
        try {
            console.log("Downloaded sample PDF via HTTPS");
            const buffer = fs.readFileSync(dest);
            console.log("Testing pdfProcessor.extractText...");
            const data = await pdfProcessor.extractText(buffer, "sample2.pdf");
            console.log("Extracted pages:", data.length);
            console.log("Page 1 preview:", data[0]?.text);
        } catch(e) {
            console.error("Crash during extraction:", e);
        }
    });
  });
});
