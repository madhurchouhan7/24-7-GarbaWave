#!/usr/bin/env node
/**
 * validate-catalogue.mjs — Simple catalogue validator.
 * Run: npm run validate-catalogue
 *
 * Checks:
 *  - All required fields are present and correctly typed.
 *  - No duplicate youtubeId values.
 *  - No placeholder IDs left in playable:true entries.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cataloguePath = resolve(__dirname, '../data/catalogue.json');

const REQUIRED_FIELDS = ['id', 'title', 'artist', 'genre', 'youtubeId', 'releaseDate', 'tags', 'playable'];

let errors = 0;
let warnings = 0;

function error(msg) { console.error(`  ❌ ERROR: ${msg}`); errors++; }
function warn(msg)  { console.warn(`  ⚠️  WARN: ${msg}`); warnings++; }
function ok(msg)    { console.log(`  ✅ ${msg}`); }

console.log('\n🎵 GarbaWave Catalogue Validator\n');

let catalogue;
try {
  catalogue = JSON.parse(readFileSync(cataloguePath, 'utf-8'));
} catch (e) {
  error(`Cannot read/parse catalogue.json: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(catalogue)) {
  error('catalogue.json must be a JSON array at the top level.');
  process.exit(1);
}

ok(`Found ${catalogue.length} entries.`);

const seenIds = new Set();
const seenYtIds = new Map();

catalogue.forEach((song, i) => {
  const prefix = `[${i}] id="${song.id ?? '?'}"`;

  REQUIRED_FIELDS.forEach((field) => {
    if (song[field] === undefined || song[field] === null) {
      error(`${prefix}: missing required field "${field}"`);
    }
  });

  if (typeof song.id === 'string') {
    if (seenIds.has(song.id)) error(`${prefix}: duplicate id "${song.id}"`);
    seenIds.add(song.id);
  }

  if (typeof song.youtubeId === 'string') {
    if (song.youtubeId.startsWith('REPLACE_ME')) {
      if (song.playable === true) {
        error(`${prefix}: youtubeId is a placeholder ("${song.youtubeId}") but playable=true. Set playable:false or supply a real ID.`);
      } else {
        warn(`${prefix}: youtubeId is a placeholder ("${song.youtubeId}") — needs a real ID before going live.`);
      }
    }

    if (seenYtIds.has(song.youtubeId) && !song.youtubeId.startsWith('REPLACE_ME')) {
      warn(`${prefix}: duplicate youtubeId "${song.youtubeId}" (also used by id="${seenYtIds.get(song.youtubeId)}")`);
    }
    seenYtIds.set(song.youtubeId, song.id);
  }

  if (!Array.isArray(song.genre) || song.genre.length === 0) {
    error(`${prefix}: "genre" must be a non-empty array`);
  }
  if (!Array.isArray(song.tags)) {
    error(`${prefix}: "tags" must be an array`);
  }
  if (typeof song.playable !== 'boolean') {
    error(`${prefix}: "playable" must be a boolean`);
  }
});

console.log(`\nResult: ${errors} error(s), ${warnings} warning(s)\n`);
if (errors > 0) {
  console.error('Catalogue validation FAILED. Fix errors before deploying.\n');
  process.exit(1);
} else {
  console.log('Catalogue validation PASSED. ✨\n');
}
