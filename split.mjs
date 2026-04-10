import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('index.html');
const srcDir = path.resolve('src');
const stylesDir = path.join(srcDir, 'styles');

let html = fs.readFileSync(htmlPath, 'utf-8');

fs.mkdirSync(stylesDir, { recursive: true });

// Extract styles
const styleRegex = /<style>([\s\S]*?)<\/style>/i;
const styleMatch = html.match(styleRegex);

if (styleMatch) {
  const cssContent = styleMatch[1].trim();
  fs.writeFileSync(path.join(stylesDir, 'global.css'), cssContent);
  html = html.replace(styleRegex, '<link rel="stylesheet" href="/src/styles/global.css">');
}

// Extract scripts
const scriptRegex = /<script>([\s\S]*?)<\/script>/i;
const scriptMatch = html.match(scriptRegex);

if (scriptMatch) {
  let jsContent = scriptMatch[1].trim();
  
  // We will initially just put EVERYTHING from the script tag into main.js
  fs.writeFileSync(path.join(srcDir, 'main.js'), jsContent);
  html = html.replace(scriptRegex, '<script type="module" src="/src/main.js"></script>');
  
  // Also remove the Supabase CDN script from head, we will install it via npm, or keep it.
  // Actually, let's keep the CDN for now to minimize breaking changes during this first step, 
  // or we can just import it. We'll leave the CDN script in index.html for now.
}

fs.writeFileSync(htmlPath, html);

console.log('Split index.html into global.css and main.js successfully.');
