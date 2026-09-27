/**
 * main.ts — Home page entry point with Features v2 Integration.
 *
 * Boot sequence:
 *  1. Init Time-of-Day theme system (Prabhat/Din/Sanj/Raat).
 *  2. Init Live Listener Presence (real-time sync).
 *  3. Mount Header Theme Toggle & Presence Badge.
 *  4. Mount Visual Motifs (Mandala, Abhla sparkles, Peacock flourish, Beat visualizer).
 *  5. Init YouTube player (hidden iframe).
 *  6. Load catalogue.json.
 *  7. Initialize Session Persistence (Resume-the-Night).
 *  8. Mount Navratri 9-Day Sacred Color widget.
 *  9. Mount Genre Chip Bar & Sticky Player Bar.
 *  10. Wire Set Builder & Sing-Along Lyrics actions.
 *  11. Restore previous session or cue default track.
 */

import './style.css';
import type { Song } from './types';
import { initPlayer, player } from './player';
import { loadCatalogue, getQueue } from './catalogue';
import { setQueue, subscribe } from './state';
import { mountChipBar } from './ui/chipBar';
import { mountPlayerBar } from './ui/playerBar';
import { buildSongCard } from './ui/songCard';
import {
  initThemeSystem,
  mountThemeToggle,
  subscribeTheme,
  getEffectiveTheme,
  THEMES,
} from './theme';
import {
  getMandalaSVG,
  getPeacockCornerFlourishSVG,
  getDandiyaSpinnerSVG,
  injectHeroSparkles,
} from './ui/motifs';
import { initLivePresence, mountLiveListenerBadge } from './features/presence';
import { initSessionPersistence, tryResumeSession } from './features/resume';
import { mountNavratriDayWidget } from './features/navratriDays';
import { mountSetBuilderModal } from './features/setBuilder';
import { openLyricsModal } from './features/lyrics';
import { mountBeatVisualizer } from './features/visualizer';

async function boot(): Promise<void> {
  // 1. Initialize Theme System
  initThemeSystem();

  // 2. Initialize Live Presence Engine
  initLivePresence();

  // 3. Mount Header Controls: Theme Toggle & Live Presence Badge
  const toggleMount = document.getElementById('theme-toggle-mount');
  if (toggleMount) mountThemeToggle(toggleMount);

  const presenceMount = document.getElementById('live-presence-mount');
  if (presenceMount) mountLiveListenerBadge(presenceMount);

  // 4. Mount Visual Motifs & Canvas Visualizer
  mountVisualMotifs();

  // 5. Update Hero Theme Banner on theme changes
  setupHeroThemeBanner();

  // 6. Mount Loading Spinner
  const spinnerMount = document.getElementById('loading-spinner-mount');
  if (spinnerMount) {
    spinnerMount.innerHTML = getDandiyaSpinnerSVG(36);
  }

  // 7. Init hidden YouTube player
  initPlayer();

  // 8. Load Catalogue
  let songs: Song[];
  try {
    songs = await loadCatalogue();
  } catch (err) {
    console.error('[GarbaWave] Failed to load catalogue:', err);
    showError('Failed to load song catalogue. Please refresh.');
    return;
  }

  // 9. Mount Navratri 9-Day Sacred Color Widget (Features v2)
  const navratriDayMount = document.getElementById('navratri-day-mount');
  if (navratriDayMount) {
    mountNavratriDayWidget(navratriDayMount, songs);
  }

  // 10. Mount Genre Chip Bar (above queue list)
  const chipMount = document.getElementById('chip-mount');
  if (chipMount) mountChipBar(chipMount);

  // 11. Mount Sticky Player Bar
  mountPlayerBar(document.body);

  // 12. Wire Hero v2 Buttons: Setlist Builder & Sing-Along Lyrics
  const setBuilderBtn = document.getElementById('set-builder-trigger-btn');
  if (setBuilderBtn) {
    setBuilderBtn.addEventListener('click', () => mountSetBuilderModal(songs));
  }

  const heroLyricsBtn = document.getElementById('hero-lyrics-trigger-btn');
  if (heroLyricsBtn) {
    heroLyricsBtn.addEventListener('click', () => openLyricsModal());
  }

  // 13. Initialize Session Persistence (Resume-the-Night)
  initSessionPersistence();

  // 14. Try resuming previous session; if none, initialize default queue
  const resumed = tryResumeSession(songs);
  if (!resumed) {
    const initialQueue = getQueue('all', 'playable-first');
    setQueue(initialQueue, 0);
    renderSongList(initialQueue);
    if (initialQueue.length > 0) {
      player.load(initialQueue[0].youtubeId, false);
    }
  } else {
    // Render current queue from state
    renderSongList(songs.filter((s) => s.playable));
  }

  // 15. Re-render queue when state changes
  subscribe('queue', (s) => {
    renderSongList(s.queue);
  });
}

/** Mount Mandala backdrop, Hero sparkles, Peacock flourish, and Beat visualizer. */
function mountVisualMotifs(): void {
  const heroStage = document.getElementById('hero-stage');
  if (heroStage) {
    // Canvas beat visualizer (Features v2)
    mountBeatVisualizer(heroStage);
    // Abhla mirror sparkles
    injectHeroSparkles(heroStage, 10);
  }

  const mandalaMount = document.getElementById('mandala-backdrop-mount');
  if (mandalaMount) {
    const wrap = document.createElement('div');
    wrap.className = 'mandala-rotate';
    wrap.innerHTML = getMandalaSVG(560);
    mandalaMount.appendChild(wrap);
  }

  const peacockMount = document.getElementById('peacock-flourish-mount');
  if (peacockMount) {
    peacockMount.innerHTML = getPeacockCornerFlourishSVG();
  }
}

function setupHeroThemeBanner(): void {
  const iconEl = document.getElementById('hero-time-icon');
  const badgeEl = document.getElementById('hero-time-badge');
  const descEl = document.getElementById('hero-time-desc');

  function update(themeId: string) {
    const meta = THEMES[themeId as keyof typeof THEMES];
    if (!meta) return;
    if (iconEl) iconEl.textContent = meta.icon;
    if (badgeEl) badgeEl.textContent = `${meta.name} • ${meta.badgeLabel}`;
    if (descEl) descEl.textContent = meta.mood;
  }

  update(getEffectiveTheme());
  subscribeTheme((theme) => update(theme));
}

function renderSongList(queue: Song[]): void {
  const listEl = document.getElementById('song-list');
  if (!listEl) return;

  while (listEl.firstChild) listEl.removeChild(listEl.firstChild);

  if (queue.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-theme-muted text-center py-12 text-sm flex flex-col items-center gap-2';
    empty.innerHTML = `<span>🏺</span><span>No songs in this genre yet — more coming soon!</span>`;
    listEl.appendChild(empty);
    return;
  }

  queue.forEach((song, i) => {
    listEl.appendChild(buildSongCard(song, i, queue));
  });

  const countEl = document.getElementById('queue-count');
  if (countEl) countEl.textContent = `${queue.length} track${queue.length !== 1 ? 's' : ''}`;
}

function showError(msg: string): void {
  const el = document.getElementById('error-banner');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

boot().catch(console.error);
