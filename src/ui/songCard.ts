/**
 * ui/songCard.ts — Navratri Song Card with BPM, Regional Styles & Lyrics.
 *
 * Features v2:
 *  - BPM tempo badge
 *  - Regional style tag (Kutchi, Kathiawadi, Saurashtra, etc.)
 *  - Lyrics action button
 *  - Artist channel attribution
 *  - Left-edge theme accent & Abhla mirror dot
 */

import type { Song } from '../types';
import { setIsPlaying, setQueue, getState } from '../state';
import { player } from '../player';
import { getAbhlaMirrorSVG } from './motifs';
import { openLyricsModal } from '../features/lyrics';

export function buildSongCard(song: Song, index: number, queue: Song[]): HTMLElement {
  const card = document.createElement('div');
  card.className = [
    'garba-song-row flex items-center gap-3 px-4 py-3.5',
    'rounded-2xl bg-surface-card hover:bg-surface-elevated',
    'border border-theme-subtle hover:border-theme-active',
    'transition-all duration-200 cursor-pointer group select-none',
    'bandhani-chip-texture relative',
    song.playable ? '' : 'opacity-40 cursor-not-allowed',
  ].join(' ');
  card.setAttribute('role', 'listitem');

  // Position number
  const num = document.createElement('span');
  num.className = 'font-display font-bold text-theme-muted text-sm w-5 text-center flex-shrink-0 group-hover:text-theme-accent transition-colors';
  num.textContent = String(index + 1);
  num.setAttribute('aria-hidden', 'true');

  // Title & Artist Info
  const info = document.createElement('div');
  info.className = 'flex-1 min-w-0';

  const titleRow = document.createElement('div');
  titleRow.className = 'flex items-center gap-1.5';

  const title = document.createElement('p');
  title.className = 'font-display font-bold text-theme-primary text-sm truncate';
  title.textContent = song.title;

  titleRow.appendChild(title);

  if (song.playable) {
    const mirrorSpan = document.createElement('span');
    mirrorSpan.className = 'flex-shrink-0';
    mirrorSpan.title = 'Playable';
    mirrorSpan.innerHTML = getAbhlaMirrorSVG(11);
    titleRow.appendChild(mirrorSpan);
  }

  // Artist + Style Subtitle
  const artistRow = document.createElement('div');
  artistRow.className = 'flex items-center gap-2 mt-0.5 text-xs text-theme-secondary';

  const artist = document.createElement('span');
  artist.className = 'font-sans truncate';
  artist.textContent = song.artist;
  artistRow.appendChild(artist);

  if (song.regionalStyle) {
    const styleBadge = document.createElement('span');
    styleBadge.className = 'text-[9px] font-semibold px-1.5 py-0.2 rounded bg-surface-elevated text-theme-accent border border-theme-subtle';
    styleBadge.textContent = song.regionalStyle;
    artistRow.appendChild(styleBadge);
  }

  info.appendChild(titleRow);
  info.appendChild(artistRow);

  // Right Side: BPM, Genre Badges & Lyrics Button
  const badgesWrap = document.createElement('div');
  badgesWrap.className = 'flex items-center gap-1.5 flex-shrink-0';

  if (song.bpm) {
    const bpmTag = document.createElement('span');
    bpmTag.className = 'hidden sm:inline-block text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-surface-elevated text-theme-gold border border-theme-subtle';
    bpmTag.textContent = `${song.bpm} BPM`;
    badgesWrap.appendChild(bpmTag);
  }

  song.genre.slice(0, 1).forEach((g) => {
    const badge = document.createElement('span');
    badge.className = 'text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-surface-elevated text-theme-secondary border border-theme-subtle';
    badge.textContent = g;
    badgesWrap.appendChild(badge);
  });

  // Lyrics quick button
  if (song.lyrics) {
    const lBtn = document.createElement('button');
    lBtn.type = 'button';
    lBtn.className = 'text-xs p-1 rounded-lg hover:bg-surface-elevated text-theme-muted hover:text-theme-primary transition-colors';
    lBtn.innerHTML = '📜';
    lBtn.title = 'View Lyrics & Transliteration';
    lBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLyricsModal(song);
    });
    badgesWrap.appendChild(lBtn);
  }

  // Active playing indicator
  const playIndicator = document.createElement('span');
  playIndicator.className = 'text-theme-accent text-xs font-bold hidden flex-shrink-0 animate-pulse';
  playIndicator.setAttribute('aria-hidden', 'true');
  playIndicator.textContent = '▶ Playing';
  playIndicator.id = `play-indicator-${song.id}`;

  card.appendChild(num);
  card.appendChild(info);
  card.appendChild(badgesWrap);
  card.appendChild(playIndicator);

  if (song.playable) {
    card.addEventListener('click', () => {
      setQueue(queue, index);
      setIsPlaying(true);
      player.load(song.youtubeId, true);
    });

    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Play ${song.title} by ${song.artist}`);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  }

  updateActiveIndicator(card, playIndicator, song);
  return card;
}

function updateActiveIndicator(card: HTMLElement, indicator: HTMLElement, song: Song): void {
  const { currentTrack } = getState();
  const isActive = currentTrack?.id === song.id;
  indicator.classList.toggle('hidden', !isActive);
  card.classList.toggle('is-active-track', isActive);
}
