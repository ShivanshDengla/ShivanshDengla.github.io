import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, statSync } from 'node:fs';

// Get all HTML files for multi-page support
function getHtmlFiles(dir = '.', fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = resolve(dir, file);
    if (statSync(filePath).isDirectory()) {
      // Skip node_modules, vendor, dist, and other non-source directories
      if (!['node_modules', 'vendor', 'dist', '.git', 'css', 'js', 'img'].includes(file)) {
        getHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const htmlFiles = getHtmlFiles();

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: htmlFiles.reduce((acc, file) => {
        const name = file.replace(process.cwd() + '/', '').replace(/\.html$/, '');
        acc[name] = file;
        return acc;
      }, {}),
    },
    // Preserve asset structure
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
});

