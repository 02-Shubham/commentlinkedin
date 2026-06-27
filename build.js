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
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    if (cssFile) {
      console.log(`Copying compiled CSS ${cssFile} to content.css...`);
      fs.copyFileSync(resolve(assetsDir, cssFile), resolve(__dirname, 'dist/content.css'));
    }
  }

  console.log('Build completed successfully!');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
