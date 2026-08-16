const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', '..', 'landing-page', 'public');
const destDir = path.resolve(__dirname, '..', 'client', 'public');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyAll(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyAll(srcPath, destPath);
    } else if (entry.isFile()) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log('Copied', srcPath, '->', destPath);
      } catch (err) {
        console.error('Failed to copy', srcPath, err);
      }
    }
  }
}

if (!fs.existsSync(srcDir)) {
  console.error('Source landing-page public folder not found at', srcDir);
  process.exit(1);
}

copyAll(srcDir, destDir);
console.log('Landing-page assets copied to main-app/client/public');
