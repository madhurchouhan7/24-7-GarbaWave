/**
 * explore.ts — Explore page entry point with Features v2 Integration.
 */

import './style.css';
import type { Song, SortMode } from './types';
import { initPlayer, player } from './player';
import { loadCatalogue, search, sort } from './catalogue';
import { playTrack } from './state';
import { mountPlayerBar } from './ui/playerBar';
import { initThemeSystem, mountThemeToggle } from './theme';
import {
  getAbhlaMirrorSVG,
  getPeacockCornerFlourishSVG,
  getDandiyaSpinnerSVG,
  getToranGarlandSVG,
} from './ui/motifs';
import { initLivePresence, mountLiveListenerBadge } from './features/presence';
import { openLyricsModal } from './features/lyrics';
import { openRequestSongModal } from './features/requestSong';
import { initMediaSession } from './features/mediaSession';
import { initPWA } from './features/pwa';

let allSongs: Song[] = [];

async function boot(): Promise<void> {
  initPWA();
  initThemeSystem();
  initLivePresence();
  initMediaSession();

  // Header Controls: Theme Toggle & Live Presence
  const toggleMount = document.getElementById('theme-toggle-mount');
  if (toggleMount) mountThemeToggle(toggleMount);

  const presenceMount = document.getElementById('live-presence-mount');
  if (presenceMount) mountLiveListenerBadge(presenceMount);

  // Toran Garland
  const toranMount = document.getElementById('toran-garland-mount');
  if (toranMount) toranMount.innerHTML = getToranGarlandSVG();

  // Peacock Flourish
  const peacockMount = document.getElementById('peacock-flourish-mount');
  if (peacockMount) peacockMount.innerHTML = getPeacockCornerFlourishSVG();

  // Loading Spinner
  const spinnerMount = document.getElementById('loading-spinner-mount');
  if (spinnerMount) spinnerMount.innerHTML = getDandiyaSpinnerSVG(36);

  // Request Song Modal Triggers
  document.getElementById('header-request-song-btn')?.addEventListener('click', () => openRequestSongModal());
  document.getElementById('footer-request-song-btn')?.addEventListener('click', () => openRequestSongModal());

  // Init Player & Player Bar
  initPlayer();
  mountPlayerBar(document.body);

  try {
    allSongs = await loadCatalogue();
  } catch {
    showError('Failed to load catalogue. Please refresh.');
    return;
  }

  renderList(allSongs);

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  let debounceTimer: ReturnType<typeof setTimeout>;

  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => applyFilters(), 200);
  });

  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;
  sortSelect?.addEventListener('change', () => applyFilters());
}

function applyFilters(): void {
  const q = (document.getElementById('search-input') as HTMLInputElement | null)?.value ?? '';
  const mode = ((document.getElementById('sort-select') as HTMLSelectElement | null)?.value ?? 'playable-first') as SortMode;
  const filtered = sort(search(q), mode);
  renderList(filtered);
}

function renderList(songs: Song[]): void {
  const listEl = document.getElementById('song-list');
  const countEl = document.getElementById('results-count');
  if (!listEl) return;

  while (listEl.firstChild) listEl.removeChild(listEl.firstChild);

  if (countEl) {
    countEl.textContent = `Showing ${songs.length} Garba song${songs.length !== 1 ? 's' : ''}`;
  }

  if (songs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'col-span-full text-theme-muted text-center py-12 text-sm flex flex-col items-center gap-2';
    empty.innerHTML = `<span>🔍</span><span>No Garba songs match your search.</span>`;
    listEl.appendChild(empty);
    return;
  }

  songs.forEach((song) => {
    listEl.appendChild(buildExploreRow(song));
  });
}

function buildExploreRow(song: Song): HTMLElement {
  const row = document.createElement('div');
  row.setAttribute('role', 'listitem');
  row.className = [
    'garba-song-row flex items-center gap-3 px-4 py-3.5 rounded-2xl',
    'bg-surface-card hover:bg-surface-elevated',
    'border border-theme-subtle hover:border-theme-active',
    'transition-all duration-200 select-none bandhani-chip-texture relative',
    song.playable ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed',
  ].join(' ');

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

  // Right Side: BPM, Genre, Lyrics
  const badgesWrap = document.createElement('div');
  badgesWrap.className = 'flex items-center gap-1.5 flex-shrink-0';

  if (song.bpm) {
    const bpmTag = document.createElement('span');
    bpmTag.className = 'text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-surface-elevated text-theme-gold border border-theme-subtle';
    bpmTag.textContent = `${song.bpm} BPM`;
    badgesWrap.appendChild(bpmTag);
  }

  song.genre.slice(0, 1).forEach((g) => {
    const b = document.createElement('span');
    b.className = 'text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-surface-elevated text-theme-secondary border border-theme-subtle';
    b.textContent = g;
    badgesWrap.appendChild(b);
  });

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

  if (!song.playable) {
    const unavail = document.createElement('span');
    unavail.className = 'text-[10px] font-sans px-2 py-0.5 rounded-full bg-surface-elevated text-theme-muted border border-theme-subtle';
    unavail.textContent = 'Unavailable';
    badgesWrap.appendChild(unavail);
  }

  row.appendChild(info);
  row.appendChild(badgesWrap);

  if (song.playable) {
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `Play ${song.title} by ${song.artist}`);
    row.addEventListener('click', () => {
      playTrack(song);
      player.load(song.youtubeId, true);
    });
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });
  }

  return row;
}

function showError(msg: string): void {
  const existing = document.getElementById('error-banner');
  if (existing) {
    existing.textContent = msg;
    return;
  }
  const div = document.createElement('div');
  div.id = 'error-banner';
  div.setAttribute('role', 'alert');
  div.className = 'mx-4 mt-4 px-4 py-3 rounded-xl bg-red-900/50 border border-red-700 text-red-200 text-sm';
  div.textContent = msg;
  const main = document.querySelector('main');
  if (main) document.body.insertBefore(div, main);
  else document.body.appendChild(div);
}

boot().catch(console.error);
