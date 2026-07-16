import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

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

/** Copy SEO/static files into dist so Vercel (output: dist) serves them. */
function copyRootStaticToDist() {
  return {
    name: 'copy-root-static-to-dist',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      for (const name of ['sitemap.xml', 'robots.txt']) {
        const src = resolve(__dirname, name);
        const dest = resolve(outDir, name);
        if (existsSync(src)) {
          copyFileSync(src, dest);
        }
      }
      // Plain scripts referenced without type="module" are not emitted by Vite
      copyDir(resolve(__dirname, 'js'), resolve(outDir, 'js'));
    },
  };
}

export default defineConfig({
  root: '.',
  plugins: [copyRootStaticToDist()],
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

