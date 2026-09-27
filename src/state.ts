/**
 * state.ts — Shared player state + minimal pub/sub.
 *
 * Only this module mutates the PlayerState object. Everything else subscribes
 * to changes and reads from the exported `state` snapshot.
 *
 * Architecture reference: 05-architecture-methodology.md §2
 */

import type { Song, PlayerState } from './types';

// ─── State ────────────────────────────────────────────────────────────────────

const state: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  durationSeconds: 0,
};

// ─── Pub/sub ──────────────────────────────────────────────────────────────────

type StateChangeEvent = keyof PlayerState | 'any';
type Listener = (state: PlayerState) => void;

const listeners = new Map<StateChangeEvent, Set<Listener>>();

/** Subscribe to any state change (or a specific key). */
export function subscribe(event: StateChangeEvent, cb: Listener): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(cb);
  // Return an unsubscribe function
  return () => listeners.get(event)?.delete(cb);
}

function emit(changedKey: keyof PlayerState): void {
  const snap = getState();
  listeners.get(changedKey)?.forEach((cb) => cb(snap));
  listeners.get('any')?.forEach((cb) => cb(snap));
}

/** Read-only snapshot of current state. */
export function getState(): Readonly<PlayerState> {
  return { ...state };
}

// ─── Mutators ─────────────────────────────────────────────────────────────────

/**
 * Replace the entire queue and start from the beginning (or a specified index).
 * This is the main entry point called when a genre chip is tapped, or when
 * the user taps a song in Explore.
 */
export function setQueue(songs: Song[], startIndex = 0): void {
  state.queue = [...songs];
  state.queueIndex = Math.max(0, Math.min(startIndex, songs.length - 1));
  state.currentTrack = state.queue[state.queueIndex] ?? null;
  state.progress = 0;
  state.durationSeconds = state.currentTrack?.durationSeconds ?? 0;
  emit('queue');
  emit('queueIndex');
  emit('currentTrack');
}

/**
 * Start a single track immediately, replacing the queue with just that track.
 * Used when user taps a song in Explore.
 */
export function playTrack(song: Song): void {
  setQueue([song], 0);
  setIsPlaying(true);
}

/** Advance to the next track in the queue. Wraps around. */
export function nextTrack(): boolean {
  if (state.queue.length === 0) return false;
  state.queueIndex = (state.queueIndex + 1) % state.queue.length;
  state.currentTrack = state.queue[state.queueIndex];
  state.progress = 0;
  state.durationSeconds = state.currentTrack?.durationSeconds ?? 0;
  emit('queueIndex');
  emit('currentTrack');
  return true;
}

/** Step to the previous track in the queue. Wraps around. */
export function prevTrack(): boolean {
  if (state.queue.length === 0) return false;
  state.queueIndex =
    (state.queueIndex - 1 + state.queue.length) % state.queue.length;
  state.currentTrack = state.queue[state.queueIndex];
  state.progress = 0;
  state.durationSeconds = state.currentTrack?.durationSeconds ?? 0;
  emit('queueIndex');
  emit('currentTrack');
  return true;
}

export function setIsPlaying(playing: boolean): void {
  if (state.isPlaying === playing) return;
  state.isPlaying = playing;
  emit('isPlaying');
}

export function setProgress(progress: number, durationSeconds: number): void {
  state.progress = Math.max(0, Math.min(1, progress));
  state.durationSeconds = durationSeconds;
  emit('progress');
}

export function setDuration(durationSeconds: number): void {
  state.durationSeconds = durationSeconds;
  emit('durationSeconds');
}
