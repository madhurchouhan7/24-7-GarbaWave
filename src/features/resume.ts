/**
 * features/resume.ts — Resume-the-Night Playback Persistence (Features v2 §3).
 *
 * Automatically saves playback position & active queue to localStorage.
 * On browser reload / re-opening during an event, seamlessly picks up where you left off.
 */

import type { Song } from '../types';
import { getState, setQueue, subscribe } from '../state';
import { player } from '../player';

const STORAGE_KEY = 'garbawave_playback_session';
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SavedSession {
  trackId: string;
  queueSongIds: string[];
  queueIndex: number;
  timestamp: number;
}

export function initSessionPersistence(): void {
  // Save state on track change or progress updates
  subscribe('currentTrack', (s) => {
    saveSession(s);
  });
}

function saveSession(stateSnapshot = getState()): void {
  if (!stateSnapshot.currentTrack) return;
  try {
    const session: SavedSession = {
      trackId: stateSnapshot.currentTrack.id,
      queueSongIds: stateSnapshot.queue.map((s) => s.id),
      queueIndex: stateSnapshot.queueIndex,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage quota or privacy mode
  }
}

/**
 * Attempts to restore the previous queue and track.
 * Returns true if a valid session was restored.
 */
export function tryResumeSession(allSongs: Song[]): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const session: SavedSession = JSON.parse(raw);
    if (!session || !session.trackId) return false;

    // Check age
    if (Date.now() - session.timestamp > MAX_SESSION_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }

    // Reconstruct queue
    const songMap = new Map(allSongs.map((s) => [s.id, s]));
    const restoredQueue: Song[] = [];

    session.queueSongIds.forEach((id) => {
      const s = songMap.get(id);
      if (s && s.playable) restoredQueue.push(s);
    });

    if (restoredQueue.length === 0) return false;

    const restoredIndex = Math.min(Math.max(0, session.queueIndex), restoredQueue.length - 1);
    setQueue(restoredQueue, restoredIndex);

    // Prime the track (cued, paused)
    const active = restoredQueue[restoredIndex];
    if (active) {
      player.load(active.youtubeId, false);
      showResumeToast(active.title);
      return true;
    }
  } catch (err) {
    console.warn('[GarbaWave] Could not restore previous session:', err);
  }
  return false;
}

function showResumeToast(songTitle: string): void {
  const existing = document.getElementById('gw-resume-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'gw-resume-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.className = [
    'fixed top-16 left-1/2 -translate-x-1/2 z-50',
    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium',
    'bg-surface-card text-theme-primary border border-theme-active shadow-xl shadow-theme-glow',
    'transition-all duration-300 select-none animate-bounce',
  ].join(' ');

  toast.innerHTML = `<span>🪔</span><span>Resumed from last night: <strong>${songTitle}</strong></span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
