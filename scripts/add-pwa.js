const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

// Copy all files from public/ to dist/
for (const file of fs.readdirSync(publicDir)) {
  fs.copyFileSync(path.join(publicDir, file), path.join(distDir, file));
  console.log(`Copied: ${file}`);
}

// Patch index.html
let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

// Make script src relative so it works on GitHub Pages subpath (e.g. /Study-Bible/)
html = html.replace(/src="\/_expo\//g, 'src="./_expo/');

// Add PWA tags
const pwaTags = [
  '<link rel="manifest" href="manifest.json">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="apple-mobile-web-app-title" content="Versículos">',
].join('\n');

html = html.replace('<meta name="theme-color"', `${pwaTags}\n<meta name="theme-color"`);

fs.writeFileSync(path.join(distDir, 'index.html'), html);
console.log('Patched index.html');

// Patch JS bundle: fix absolute /assets/ paths to be relative (GitHub Pages subpath fix)
const jsDir = path.join(distDir, '_expo', 'static', 'js', 'web');
for (const file of fs.readdirSync(jsDir)) {
  if (!file.endsWith('.js')) continue;
  const filePath = path.join(jsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace "/assets/ with "./assets/ (only when at the start of a string literal)
  const patched = content.replace(/(['"])\/assets\//g, '$1./assets/');
  if (patched !== content) {
    fs.writeFileSync(filePath, patched);
    console.log(`Patched asset paths in: ${file}`);
  }
}

console.log('Done!');
