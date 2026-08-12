import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else if (fullPath.endsWith('.jsx')) {
      callback(fullPath);
    }
  }
}

let replacedCount = 0;

walk('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Replace $(dollar) in text like ($) -> (₹)
  content = content.replace(/\(\$\)/g, '(₹)');

  // Replace literal $ followed by numbers, e.g. $80,000 -> ₹80,000
  content = content.replace(/\$([0-9])/g, '₹$1');

  // Replace literal $ in template strings followed by expression e.g. `$${value}` -> `₹${value}`
  content = content.replace(/\`\$\$\{/g, '`₹${');

  // Also catch things like `+$${` or `-$${` (e.g. `+$${allowance}`)
  content = content.replace(/([+\-])\$\$\{/g, '$1₹${');
  
  // also catch '\$${' or "$${"
  content = content.replace(/['"]\$\$\{/g, (match) => match[0] + '₹${');
  
  // Also '($M)' or '($K / mo)' -> '(₹M)' or '(₹K / mo)'
  content = content.replace(/\(\$([a-zA-Z\s\/]+)\)/g, '(₹$1)');

  // For cases like "$0" in "return '$0';"
  content = content.replace(/['"]\$0/g, (match) => match[0] + '₹0');
  
  // For `$2.7M` inside strings
  content = content.replace(/\$([0-9]+\.?[0-9]*[MK])/g, '₹$1');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    replacedCount++;
    console.log('Updated', filePath);
  }
});

console.log('Replaced in', replacedCount, 'files');
