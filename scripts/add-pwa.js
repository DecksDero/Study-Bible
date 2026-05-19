const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

// Copy all files from public/ to dist/
for (const file of fs.readdirSync(publicDir)) {
  fs.copyFileSync(path.join(publicDir, file), path.join(distDir, file));
  console.log(`Copied: ${file}`);
}

// Patch index.html to add PWA tags
const htmlPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const pwaTags = [
  '<link rel="manifest" href="/manifest.json">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="Versículos">',
].join('\n');

html = html.replace('<meta name="theme-color"', `${pwaTags}\n<meta name="theme-color"`);

fs.writeFileSync(htmlPath, html);
console.log('PWA tags added to index.html');
