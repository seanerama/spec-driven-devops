#!/usr/bin/env node

/**
 * Build hooks — copies hook sources to dist/ (or bundles with esbuild if available)
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'hooks', 'src');
const distDir = path.join(__dirname, '..', 'hooks', 'dist');

// Ensure dist directory exists
fs.mkdirSync(distDir, { recursive: true });

// Copy all hook files from src to dist
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
}

console.log(`Built ${files.length} hooks to hooks/dist/`);
