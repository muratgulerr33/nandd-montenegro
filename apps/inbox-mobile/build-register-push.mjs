#!/usr/bin/env node
import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const www = join(__dirname, 'www');
mkdirSync(www, { recursive: true });
copyFileSync(join(__dirname, 'register-push-entry.js'), join(www, 'register-push.js'));
