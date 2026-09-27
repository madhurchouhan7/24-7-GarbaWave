/**
 * features/mediaSession.ts — Native Lock-Screen & Bluetooth Media Session API.
 *
 * Exposes native system audio controls on iOS/Android lock screens, Apple Watch,
 * and car infotainment systems (title, artist, album art, play/pause/skip).
 */

import { subscribe, getState } from '../state';
import { player } from '../player';

export function initMediaSession(): void {
  if (!('mediaSession' in navigator)) return;

  // Track changes ➔ update lock-screen metadata
  subscribe('currentTrack', (s) => {
    if (!s.currentTrack) {
      navigator.mediaSession.metadata = null;
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: s.currentTrack.title,
      artist: `${s.currentTrack.artist} ${s.currentTrack.regionalStyle ? `(${s.currentTrack.regionalStyle})` : ''}`,
      album: 'GarbaWave — ૨૪/૭ ગરબા સંગ્રહ',
      artwork: [
        {
          src: '/icons/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
        },
      ],
    });
  });

  // isPlaying ➔ update lock-screen playback state
  subscribe('isPlaying', (s) => {
    navigator.mediaSession.playbackState = s.isPlaying ? 'playing' : 'paused';
  });

  // Action handlers
  try {
    navigator.mediaSession.setActionHandler('play', () => player.play());
    navigator.mediaSession.setActionHandler('pause', () => player.pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const { queue, queueIndex } = getState();
      if (queue.length > 0) {
        const nextIdx = (queueIndex + 1) % queue.length;
        player.load(queue[nextIdx].youtubeId, true);
      }
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const { queue, queueIndex } = getState();
      if (queue.length > 0) {
        const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
        player.load(queue[prevIdx].youtubeId, true);
      }
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        player.seekToSeconds(details.seekTime);
      }
    });
  } catch (e) {
    console.warn('[GarbaWave] MediaSession action handler registration note:', e);
  }
}
