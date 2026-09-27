/**
 * features/share.ts — Shareable Now Playing & WhatsApp Status Formatter (Features v2 §4).
 *
 * Formats a WhatsApp-ready status card with song title, artist, BPM, and link.
 */

import type { Song } from '../types';
import { getState } from '../state';

export async function shareNowPlaying(song?: Song): Promise<void> {
  const target = song ?? getState().currentTrack;
  if (!target) return;

  const url = window.location.origin;
  const shareText = `🪔 Now dancing to *${target.title}* by _${target.artist}_ on GarbaWave! 🎵\n${target.bpm ? `⚡ ${target.bpm} BPM | ` : ''}૨૪/૭ ગરબા સંગ્રહ 💃🕺\nListen free: ${url}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `GarbaWave: ${target.title}`,
        text: shareText,
        url: url,
      });
      return;
    } catch {
      // User dismissed share dialog
    }
  }

  // Fallback to WhatsApp direct link
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}
