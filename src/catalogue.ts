/**
 * catalogue.ts — Load catalogue.json once, expose pure search/filter/sort.
 *
 * No network calls after the initial fetch. All operations run in-memory.
 *
 * Architecture reference: 05-architecture-methodology.md §2
 */

import type { Song, Genre, SortMode } from './types';
import rawCatalogue from '../data/catalogue.json';

// ─── State ────────────────────────────────────────────────────────────────────

let catalogue: Song[] = [];
let loaded = false;

// ─── Loader ───────────────────────────────────────────────────────────────────

/**
 * Fetch and parse catalogue.json. Call once at app startup.
 * Subsequent calls return the cached result immediately.
 */
export async function loadCatalogue(): Promise<Song[]> {
  if (loaded) return catalogue;

  if (Array.isArray(rawCatalogue)) {
    catalogue = (rawCatalogue as unknown[]).filter(isValidSong);
  } else {
    throw new Error('catalogue.json must be an array');
  }

  loaded = true;
  return catalogue;
}

/** Type guard — validates required fields to catch catalogue typos at runtime. */
function isValidSong(item: unknown): item is Song {
  if (typeof item !== 'object' || item === null) return false;
  const s = item as Record<string, unknown>;
  return (
    typeof s['id'] === 'string' &&
    typeof s['title'] === 'string' &&
    typeof s['artist'] === 'string' &&
    Array.isArray(s['genre']) &&
    typeof s['youtubeId'] === 'string' &&
    typeof s['releaseDate'] === 'string' &&
    Array.isArray(s['tags']) &&
    typeof s['playable'] === 'boolean'
  );
}

// ─── Pure query functions ──────────────────────────────────────────────────────

/** Return all loaded songs. */
export function getAll(): Song[] {
  return catalogue;
}

/**
 * Case-insensitive text search across title, artist, and genre fields.
 * Returns a new array; never mutates.
 */
export function search(query: string): Song[] {
  if (!query.trim()) return catalogue;
  const q = query.toLowerCase();
  return catalogue.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genre.some((g) => g.toLowerCase().includes(q)) ||
      s.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

/**
 * Filter by genre (case-insensitive partial match).
 * Returns all songs if genre is empty or 'all'.
 */
export function filterByGenre(genre: Genre | 'all'): Song[] {
  if (!genre || genre === 'all') return catalogue;
  const g = genre.toLowerCase();
  return catalogue.filter((s) =>
    s.genre.some((sg) => sg.toLowerCase() === g),
  );
}

/**
 * Sort a song array by the given mode.
 * Returns a new sorted array; never mutates the input.
 */
export function sort(songs: Song[], mode: SortMode): Song[] {
  const copy = [...songs];
  switch (mode) {
    case 'playable-first':
      return copy.sort((a, b) => {
        if (a.playable === b.playable) return 0;
        return a.playable ? -1 : 1;
      });

    case 'newest':
      return copy.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      );

    case 'oldest':
      return copy.sort(
        (a, b) =>
          new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
      );

    case 'bpm-desc':
      return copy.sort((a, b) => (b.bpm ?? 120) - (a.bpm ?? 120));

    case 'bpm-asc':
      return copy.sort((a, b) => (a.bpm ?? 120) - (b.bpm ?? 120));
  }
}

/**
 * Convenience: filter by genre then sort.
 * Returns only playable tracks by default (set includeUnplayable for Explore).
 */
export function getQueue(
  genre: Genre | 'all',
  sortMode: SortMode = 'playable-first',
  includeUnplayable = false,
): Song[] {
  let songs = filterByGenre(genre);
  if (!includeUnplayable) songs = songs.filter((s) => s.playable);
  return sort(songs, sortMode);
}
