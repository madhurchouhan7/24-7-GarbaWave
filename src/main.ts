/**
 * main.ts — Home page entry point with all Creative Features integrated.
 *
 * Features:
 *  Phase 1 (Original):
 *    1. Time-of-Day theme engine + Aarti Mode
 *    2. Live Listener Presence & Cross-tab sync
 *    3. Live Floating Reactions
 *    4. Native MediaSession lock-screen controls
 *    5. 9-Day Sacred Color Navratri Calendar
 *    6. BPM Event Arc Setlist Builder
 *    7. 2-Taali / 3-Taali / Dodhiya Metronome
 *    8. Sing-Along Karaoke lyrics
 *    9. Full-Screen mobile stage modal
 *    10. Session persistence (Resume-the-Night)
 *    11. Community track request modal
 *    12. PWA Service Worker & Install Prompt
 *
 *  Phase 2 (Creative Layer):
 *    13. Garba Streak Counter (daily retention)
 *    14. Circle Room / Link Sharing
 *    15. Navratri Night Diary (9-night journal)
 *    16. Garba Passport (regional badges)
 *    17. Aarti Countdown Clock
 *    18. Color of the Night banner
 *    19. 9-Night Navratri Challenge
 *    20. Crowd Hype Meter
 *    21. Personal Garba Stats
 *    22. Offline Night Mode cache button
 *    23. Step Counter
 *    24. Partner Finder QR
 *    25. Garba Dictionary
 *    26. Setlist Export
 *    27. BPM Breathing Ring (mounted in hero)
 *    28. Taali Coach (mic-based)
 *    29. BPM Ramp Visualizer
 */

import './style.css';
import type { Song } from './types';
import { initPlayer, player } from './player';
import { loadCatalogue, getQueue } from './catalogue';
import { setQueue, subscribe, setIsPlaying } from '../src/state';
import { mountChipBar } from './ui/chipBar';
import { mountPlayerBar } from './ui/playerBar';
import { buildSongCard } from './ui/songCard';
import {
  initThemeSystem,
  mountThemeToggle,
  subscribeTheme,
  getEffectiveTheme,
  setThemeOverride,
  THEMES,
} from './theme';
import {
  getMandalaSVG,
  getPeacockCornerFlourishSVG,
  getDandiyaSpinnerSVG,
  getToranGarlandSVG,
  injectHeroSparkles,
} from './ui/motifs';

// Phase 1 features
import { initLivePresence, mountLiveListenerBadge } from './features/presence';
import { initSessionPersistence, tryResumeSession } from './features/resume';
import { mountNavratriDayWidget } from './features/navratriDays';
import { mountSetBuilderModal } from './features/setBuilder';
import { openLyricsModal } from './features/lyrics';
import { mountBeatVisualizer } from './features/visualizer';
import { initMediaSession } from './features/mediaSession';
import { initLiveReactions, mountReactionBar } from './features/reactions';
import { openClapperModal } from './features/clapper';
import { openRequestSongModal } from './features/requestSong';
import { initPWA } from './features/pwa';

// Phase 2 — Engagement & Social
import { initStreak, mountStreakBadge } from './features/streak';
import { openCircleRoomModal } from './features/circleRoom';
import { initNightDiary, openNightDiaryModal } from './features/nightDiary';
import { initPassport, mountPassportBadge, openPassportModal } from './features/passport';

// Phase 2 — Immersive features (lazy-imported after DOM ready)
// breathingRing, taaliche, aartiClock, bpmRamp, colorOfNight — imported dynamically

// Phase 2 — Utility
import { mountOfflineCacheBtn } from './features/offlineCache';
import { initStepCounter, mountStepCounterDisplay } from './features/stepCounter';
import { openPartnerFinderModal } from './features/partnerQR';
import { openDictionaryModal } from './features/garbaDictionary';
import { openExportModal } from './features/setlistExport';

// Phase 2 — Retention
import { initNineNightChallenge, openChallengeModal } from './features/nineNightChallenge';
import { initHypeMeter, mountHypeMeter } from './features/hypeMeter';

import { initPersonalStats, mountStatsPill, openPersonalStatsModal } from './features/personalStats';

async function boot(): Promise<void> {
  // ── Phase 1: Core Systems ─────────────────────────────────────────────────
  initPWA();
  initThemeSystem();
  initLivePresence();
  initLiveReactions();
  initMediaSession();

  // ── Phase 2: Engagement & Retention init ─────────────────────────────────
  initStreak();
  initNightDiary();
  initPassport();
  initNineNightChallenge();
  initHypeMeter();
  initPersonalStats();
  initStepCounter();

  // ── Mount Header Controls ─────────────────────────────────────────────────
  const toggleMount = document.getElementById('theme-toggle-mount');
  if (toggleMount) mountThemeToggle(toggleMount);

  const presenceMount = document.getElementById('live-presence-mount');
  if (presenceMount) mountLiveListenerBadge(presenceMount);

  // Streak badge in header
  const streakMount = document.getElementById('streak-badge-mount');
  if (streakMount) mountStreakBadge(streakMount);

  // Garba Passport compact row
  const passportMount = document.getElementById('passport-badge-mount');
  if (passportMount) mountPassportBadge(passportMount);

  // ── Mount Hero Stage Motifs ───────────────────────────────────────────────
  mountVisualMotifs();

  // ── Mount Hero Reaction Bar ───────────────────────────────────────────────
  const heroReactionMount = document.getElementById('hero-reaction-mount');
  if (heroReactionMount) mountReactionBar(heroReactionMount);


  // ── Hype Meter ───────────────────────────────────────────────────────────
  const hypeMeterMount = document.getElementById('hype-meter-mount');
  if (hypeMeterMount) mountHypeMeter(hypeMeterMount);

  // ── Setup Hero Theme Banner ───────────────────────────────────────────────
  setupHeroThemeBanner();

  // ── Loading Spinner ───────────────────────────────────────────────────────
  const spinnerMount = document.getElementById('loading-spinner-mount');
  if (spinnerMount) spinnerMount.innerHTML = getDandiyaSpinnerSVG(36);

  // ── Init Hidden YouTube Player ────────────────────────────────────────────
  initPlayer();

  // ── Load Catalogue ────────────────────────────────────────────────────────
  let songs: Song[];
  try {
    songs = await loadCatalogue();
  } catch (err) {
    console.error('[GarbaWave] Failed to load catalogue:', err);
    showError('Failed to load song catalogue. Please refresh.');
    return;
  }

  // ── Navratri 9-Day Sacred Color Widget ───────────────────────────────────
  const navratriDayMount = document.getElementById('navratri-day-mount');
  if (navratriDayMount) mountNavratriDayWidget(navratriDayMount, songs);

  // ── Genre Chip Bar & Sticky Player Bar ───────────────────────────────────
  const chipMount = document.getElementById('chip-mount');
  if (chipMount) mountChipBar(chipMount);
  mountPlayerBar(document.body);

  // ── Stats Pill (footer) ───────────────────────────────────────────────────
  const statsPillMount = document.getElementById('stats-pill-mount');
  if (statsPillMount) mountStatsPill(statsPillMount);

  // ── Step Counter Display ──────────────────────────────────────────────────
  const stepCountMount = document.getElementById('step-counter-mount');
  if (stepCountMount) mountStepCounterDisplay(stepCountMount);

  // ── Offline Cache Button ──────────────────────────────────────────────────
  const offlineCacheMount = document.getElementById('offline-cache-mount');
  if (offlineCacheMount) mountOfflineCacheBtn(offlineCacheMount);

  // ── Wire Hero Actions ─────────────────────────────────────────────────────
  setupHeroActions(songs);

  // ── Wire Footer / Utility Actions ────────────────────────────────────────
  setupUtilityActions(songs);

  // ── Session Persistence ───────────────────────────────────────────────────
  initSessionPersistence();

  const resumed = tryResumeSession(songs);
  if (!resumed) {
    const initialQueue = getQueue('all', 'playable-first');
    setQueue(initialQueue, 0);
    renderSongList(initialQueue);
    if (initialQueue.length > 0) player.load(initialQueue[0].youtubeId, false);
  } else {
    renderSongList(songs.filter((s) => s.playable));
  }

  subscribe('queue', (s) => renderSongList(s.queue));

  // ── Lazy-load Immersive features (breathingRing, colorOfNight, aartiClock) ─
  loadImmersiveFeatures(songs);
}

/** Lazy-load the immersive/fun features after main boot */
async function loadImmersiveFeatures(songs: Song[]): Promise<void> {
  try {
    const { mountBreathingRing } = await import('./features/breathingRing');
    const breathingMount = document.getElementById('breathing-ring-mount');
    if (breathingMount) mountBreathingRing(breathingMount);
  } catch { /* optional feature */ }

  try {
    const { showColorOfNightToast, mountNightColorIndicator } = await import('./features/colorOfNight');
    showColorOfNightToast();
    const nightColorMount = document.getElementById('night-color-mount');
    if (nightColorMount) mountNightColorIndicator(nightColorMount);
  } catch { /* optional feature */ }

  try {
    const { mountAartiClock } = await import('./features/aartiClock');
    const aartiClockMount = document.getElementById('aarti-clock-mount');
    if (aartiClockMount) {
      mountAartiClock(aartiClockMount, () => {
        setThemeOverride('prabhat');
        const devotional = songs.filter((s) => s.playable && s.genre.includes('Devotional'));
        const q = devotional.length > 0 ? devotional : songs.filter((s) => s.playable);
        setQueue(q, 0);
        setIsPlaying(true);
        if (q[0]) player.load(q[0].youtubeId, true);
      });
    }
  } catch { /* optional feature */ }

  try {
    const { initTaaliCoach } = await import('./features/taaliche');
    initTaaliCoach();
  } catch { /* optional feature */ }
}

function mountVisualMotifs(): void {
  const toranMount = document.getElementById('toran-garland-mount');
  if (toranMount) toranMount.innerHTML = getToranGarlandSVG();

  const heroStage = document.getElementById('hero-stage');
  if (heroStage) {
    mountBeatVisualizer(heroStage);
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
  if (peacockMount) peacockMount.innerHTML = getPeacockCornerFlourishSVG();
}

function setupHeroActions(songs: Song[]): void {
  // Aarti Mode
  document.getElementById('hero-aarti-mode-btn')?.addEventListener('click', () => {
    setThemeOverride('prabhat');
    const devotional = songs.filter((s) => s.playable && s.genre.includes('Devotional'));
    const q = devotional.length > 0 ? devotional : songs.filter((s) => s.playable);
    setQueue(q, 0);
    setIsPlaying(true);
    if (q[0]) { player.load(q[0].youtubeId, true); openLyricsModal(q[0]); }
  });

  // Setlist Builder
  document.getElementById('set-builder-trigger-btn')?.addEventListener('click', () => mountSetBuilderModal(songs));

  // Taali Guide
  document.getElementById('hero-clapper-trigger-btn')?.addEventListener('click', () => openClapperModal());

  // Sing-Along
  document.getElementById('hero-lyrics-trigger-btn')?.addEventListener('click', () => openLyricsModal());

  // Taali Coach (mic-based) — lazy
  document.getElementById('hero-taali-coach-btn')?.addEventListener('click', async () => {
    try {
      const { openTaaliCoachModal } = await import('./features/taaliche');
      openTaaliCoachModal();
    } catch { /* not available */ }
  });

  // BPM Breathing Ring toggle
  document.getElementById('hero-breathing-ring-btn')?.addEventListener('click', async () => {
    const el = document.getElementById('breathing-ring-mount');
    if (el) el.classList.toggle('hidden');
  });

  // Night Diary
  document.getElementById('hero-night-diary-btn')?.addEventListener('click', () => openNightDiaryModal());

  // 9-Night Challenge
  document.getElementById('hero-challenge-btn')?.addEventListener('click', () => openChallengeModal());

  // Circle Room Share
  document.getElementById('hero-circle-room-btn')?.addEventListener('click', () => openCircleRoomModal());

  // Garba Passport
  document.getElementById('hero-passport-btn')?.addEventListener('click', () => openPassportModal());
}

function setupUtilityActions(_songs: Song[]): void {
  // Footer / Utility Buttons
  document.getElementById('footer-request-song-btn')?.addEventListener('click', () => openRequestSongModal());
  document.getElementById('footer-partner-finder-btn')?.addEventListener('click', () => openPartnerFinderModal());
  document.getElementById('footer-dictionary-btn')?.addEventListener('click', () => openDictionaryModal());
  document.getElementById('footer-export-setlist-btn')?.addEventListener('click', () => openExportModal());
  document.getElementById('footer-personal-stats-btn')?.addEventListener('click', () => openPersonalStatsModal());
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

  queue.forEach((song, i) => listEl.appendChild(buildSongCard(song, i, queue)));

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
