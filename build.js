import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildAll() {
  console.log('Building Popup and Options...');
  await build({
    configFile: false,
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'popup.html'),
          options: resolve(__dirname, 'options.html'),
        }
      }
    }
  });

  console.log('Building Background Service Worker...');
  await build({
    configFile: false,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/background/index.ts'),
        formats: ['iife'],
        name: 'background',
        fileName: () => 'background.js',
      },
      rollupOptions: {
        output: {
          extend: true,
        }
      }
    }
  });

  console.log('Building Content Script...');
  await build({
    configFile: false,
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/content/index.tsx'),
        formats: ['iife'],
        name: 'content',
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: {
          extend: true,
        }
      }
    }
  });

  // Copy manifest.json and public assets
  console.log('Copying public assets...');
  if (fs.existsSync(resolve(__dirname, 'public'))) {
    fs.cpSync(resolve(__dirname, 'public'), resolve(__dirname, 'dist'), { recursive: true });
  }

  // Find the generated CSS file from the popup/options build and copy it to content.css
  const assetsDir = resolve(__dirname, 'dist/assets');
  let compiledCssContent = '';
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    if (cssFile) {
      console.log(`Copying compiled CSS ${cssFile} to content.css...`);
      const cssPath = resolve(assetsDir, cssFile);
      fs.copyFileSync(cssPath, resolve(__dirname, 'dist/content.css'));
      compiledCssContent = fs.readFileSync(cssPath, 'utf8');
    }
  }

  // Inject compiled CSS into content.js placeholder
  const contentJsPath = resolve(__dirname, 'dist/content.js');
  if (fs.existsSync(contentJsPath) && compiledCssContent) {
    console.log('Injecting compiled CSS (Base64 encoded) inside content.js...');
    let jsContent = fs.readFileSync(contentJsPath, 'utf8');
    
    // Convert the compiled CSS directly to a safe Base64 string (no backslashes or newlines to escape!)
    const base64Css = Buffer.from(compiledCssContent).toString('base64');
      
    // Use a callback function to prevent JavaScript's .replace() from expanding $ characters in the CSS
    jsContent = jsContent.replace('__TAILWIND_CSS_PLACEHOLDER__', () => base64Css);
    fs.writeFileSync(contentJsPath, jsContent, 'utf8');
    console.log('Successfully injected compiled Base64 styles into content.js!');
  }

  console.log('Build completed successfully!');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
