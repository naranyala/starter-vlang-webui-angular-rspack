#!/usr/bin/env node
/**
 * Post-build script to patch Angular's index.html for WebUI integration
 * 
 * This script:
 * 1. Adds webui.js script tag before Angular bundles
 * 2. Ensures proper script loading order
 * 3. Adds blocking script for webui availability check
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist', 'browser');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

console.log('[Patch HTML] Starting webui.js injection...');
console.log('[Patch HTML] Target:', INDEX_HTML);

// Check if file exists
if (!fs.existsSync(INDEX_HTML)) {
  console.error('[Patch HTML] ERROR: index.html not found!');
  process.exit(1);
}

// Read the HTML
let html = fs.readFileSync(INDEX_HTML, 'utf-8');

// Add webui.js script tag at the beginning of body, before Angular scripts
const webuiScript = `
    <!-- WebUI Integration - Must load before Angular -->
    <script src="webui.js"></script>
    <script>
      // Wait for webui to be ready before Angular bootstraps
      window.webuiReady = new Promise((resolve) => {
        const checkWebUI = () => {
          if (typeof webui !== 'undefined') {
            console.log('[WebUI] Library loaded successfully');
            resolve();
          } else {
            setTimeout(checkWebUI, 10);
          }
        };
        checkWebUI();
      });
    </script>
`;

// Find the position after <body> tag and before app-root
const bodyTagMatch = html.match(/<body[^>]*>/i);
if (!bodyTagMatch) {
  console.error('[Patch HTML] ERROR: <body> tag not found!');
  process.exit(1);
}

const bodyEndIndex = bodyTagMatch.index + bodyTagMatch[0].length;
html = html.slice(0, bodyEndIndex) + webuiScript + html.slice(bodyEndIndex);

// Write the patched HTML
fs.writeFileSync(INDEX_HTML, html, 'utf-8');

console.log('[Patch HTML] ✓ Successfully injected webui.js');
console.log('[Patch HTML] Done!');
