/**
 * features/chapterTracker.ts — Real-time chapter/tracklist tracker for nonstop Garba sets.
 *
 * Long nonstop Garba videos contain multiple individual songs. This module:
 *  1. Subscribes to `state.progress` events to compute elapsed seconds.
 *  2. Matches elapsed seconds against `currentTrack.tracklist[]` entries.
 *  3. Exposes `getCurrentChapter()` and `getNextChapter()` helpers.
 *  4. Allows subscribers via `onChapterChange(cb)` — fires only when the active
 *     chapter index actually changes (not every progress tick).
 *
 * Architecture: reads from state, never mutates it. Pure reactive layer.
 */

import { subscribe, getState } from '../state';
import type { TrackChapter, Song } from '../types';

// ─── Internal State ───────────────────────────────────────────────────────────

let _currentChapterIdx: number = -1;
let _currentTrackId: string | null = null;

type ChapterChangeCallback = (current: TrackChapter | null, next: TrackChapter | null, idx: number) => void;

const _listeners = new Set<ChapterChangeCallback>();

// ─── Core Logic ───────────────────────────────────────────────────────────────

function findChapterIndex(tracklist: TrackChapter[], elapsedSeconds: number): number {
  for (let i = tracklist.length - 1; i >= 0; i--) {
    if (elapsedSeconds >= tracklist[i].startSeconds) {
      return i;
    }
  }
  return 0;
}

function notifyListeners(track: Song, idx: number): void {
  const tracklist = track.tracklist!;
  const current = tracklist[idx] ?? null;
  const next = tracklist[idx + 1] ?? null;
  _listeners.forEach((cb) => cb(current, next, idx));
}

// ─── Subscribe to state.progress ─────────────────────────────────────────────

subscribe('progress', (s) => {
  const track = s.currentTrack;
  if (!track?.tracklist || track.tracklist.length === 0) {
    // No chapters — reset
    if (_currentChapterIdx !== -1 || _currentTrackId !== null) {
      _currentChapterIdx = -1;
      _currentTrackId = null;
      _listeners.forEach((cb) => cb(null, null, -1));
    }
    return;
  }

  const elapsedSeconds = s.progress * s.durationSeconds;
  const newIdx = findChapterIndex(track.tracklist, elapsedSeconds);

  // Notify only when chapter actually changes OR track changes
  if (newIdx !== _currentChapterIdx || track.id !== _currentTrackId) {
    _currentChapterIdx = newIdx;
    _currentTrackId = track.id;
    notifyListeners(track, newIdx);
  }
});

// Also reset when track changes (before first progress event on new track)
subscribe('currentTrack', (s) => {
  if (!s.currentTrack) {
    _currentChapterIdx = -1;
    _currentTrackId = null;
    _listeners.forEach((cb) => cb(null, null, -1));
    return;
  }

  if (s.currentTrack.id !== _currentTrackId) {
    _currentChapterIdx = -1;
    _currentTrackId = s.currentTrack.id;
    // Fire with chapter 0 immediately on track change if tracklist exists
    if (s.currentTrack.tracklist && s.currentTrack.tracklist.length > 0) {
      _currentChapterIdx = 0;
      notifyListeners(s.currentTrack, 0);
    } else {
      _listeners.forEach((cb) => cb(null, null, -1));
    }
  }
});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register a callback that fires whenever the current chapter changes.
 * Returns an unsubscribe function.
 */
export function onChapterChange(cb: ChapterChangeCallback): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

/** Get the chapter object currently playing, or null if no tracklist. */
export function getCurrentChapter(): TrackChapter | null {
  const track = getState().currentTrack;
  if (!track?.tracklist || _currentChapterIdx < 0) return null;
  return track.tracklist[_currentChapterIdx] ?? null;
}

/** Get the next chapter after the current one, or null if last/none. */
export function getNextChapter(): TrackChapter | null {
  const track = getState().currentTrack;
  if (!track?.tracklist || _currentChapterIdx < 0) return null;
  return track.tracklist[_currentChapterIdx + 1] ?? null;
}

/** Get the current chapter index (-1 if no tracklist). */
export function getCurrentChapterIndex(): number {
  return _currentChapterIdx;
}

/** Get the full tracklist for a song, or empty array. */
export function getTracklist(song: Song): TrackChapter[] {
  return song.tracklist ?? [];
}
