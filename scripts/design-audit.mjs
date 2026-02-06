#!/usr/bin/env node
/**
 * design-audit — Hardcode renk / Tailwind black-white kullanımını tarar.
 * Eşleşme varsa dosya:satır raporlar ve exit code 1 döner (CI fail).
 * Allowlist'teki dosyalar taranmaz (token tanımları, bilinçli logo istisnası).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build']);
const ALLOWLIST = [
  'src/app/globals.css',
  'src/components/brand/nandd-logo.tsx',
].map((p) => p.split(path.sep).join('/'));

const PATTERNS = [
  { name: 'hex', re: /#[0-9a-fA-F]{3,8}/ },
  { name: 'color-func', re: /(rgb\(|rgba\(|hsl\(|hsla\(|oklch\()/ },
  { name: 'tw-black-white', re: /\b(text|bg|border)-(white|black)\b/ },
  { name: 'overlay-hardcode', re: /\bbg-black\/(10|20|30|40|50|60|70|80|90)\b/ },
];

function normalize(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function collectFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.has(e.name)) collectFiles(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const files = collectFiles(SRC).filter((f) => /\.(css|tsx?|jsx?|mjs|cjs)$/.test(f));
const hits = [];

for (const file of files) {
  const rel = normalize(file);
  if (ALLOWLIST.includes(rel)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    for (const { name, re } of PATTERNS) {
      if (re.test(line)) {
        const snippet = line.trim().slice(0, 100);
        hits.push({ file: rel, line: lineNum, rule: name, snippet });
      }
    }
  }
}

if (hits.length > 0) {
  console.error('design-audit: design rule violations (use tokens, no hardcoded colors)\n');
  for (const h of hits) {
    console.error(`${h.file}:${h.line} [${h.rule}] ${h.snippet}${h.snippet.length >= 100 ? '...' : ''}`);
  }
  console.error('\nAllowlist:', ALLOWLIST.join(', '));
  process.exit(1);
}

console.log('design-audit: OK (no hardcoded color violations in src)');
