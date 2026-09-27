/**
 * ui/playerBar.ts — Navratri Sticky Bottom Player Bar with Lyrics, Share & Artist Support.
 *
 * Features v2 Additions:
 *  - 📜 Sing-Along Lyrics / Transliteration Modal trigger
 *  - 📲 WhatsApp / Native Share action
 *  - 🔗 Artist attribution link
 *  - ⚡ Real-time BPM indicator
 *  - 🪔 Animated Diya flame
 *  - 🥢 Dandiya progress track & mirror seek dot
 */

import { subscribe, getState } from '../state';
import { player } from '../player';
import { getCrossedDandiyaSVG, getDiyaFlameSVG } from './motifs';
import { openLyricsModal } from '../features/lyrics';
import { shareNowPlaying } from '../features/share';
import { openFullPlayerModal } from './fullPlayerModal';
import { onChapterChange } from '../features/chapterTracker';


const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
const PAUSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

function formatSeconds(secs: number): string {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function buildPlayerBar(): HTMLElement {
  const bar = document.createElement('div');
  bar.id = 'player-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Garba music player');

  bar.className = [
    'fixed bottom-0 left-0 right-0 z-50',
    'border-t border-theme-subtle backdrop-blur-xl',
    'px-3 sm:px-4 pt-2.5 pb-2.5',
    'pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
    'shadow-2xl transition-colors duration-500',
  ].join(' ');
  bar.style.backgroundColor = 'var(--player-bg)';

  // ── Dandiya Progress Bar ────────────────────────────────────────────────────
  const progressWrap = document.createElement('div');
  progressWrap.className = 'w-full dandiya-progress-track mb-2.5 cursor-pointer group';
  progressWrap.setAttribute('role', 'slider');
  progressWrap.setAttribute('aria-label', 'Playback progress');
  progressWrap.setAttribute('aria-valuemin', '0');
  progressWrap.setAttribute('aria-valuemax', '100');
  progressWrap.setAttribute('aria-valuenow', '0');
  progressWrap.tabIndex = 0;

  const leftTip = document.createElement('span');
  leftTip.className = 'absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-theme-gold opacity-80';
  leftTip.setAttribute('aria-hidden', 'true');

  const rightTip = document.createElement('span');
  rightTip.className = 'absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-theme-gold opacity-80';
  rightTip.setAttribute('aria-hidden', 'true');

  const progressFill = document.createElement('div');
  progressFill.id = 'progress-fill';
  progressFill.className = 'dandiya-progress-fill';
  progressFill.style.width = '0%';

  const seekDot = document.createElement('div');
  seekDot.className = 'dandiya-seek-dot opacity-80 group-hover:opacity-100 group-hover:scale-125';
  seekDot.id = 'seek-dot';
  seekDot.style.left = '0%';

  progressWrap.appendChild(leftTip);
  progressWrap.appendChild(progressFill);
  progressWrap.appendChild(seekDot);
  progressWrap.appendChild(rightTip);

  progressWrap.addEventListener('click', (e) => {
    const rect = progressWrap.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    player.seek(fraction);
  });

  // ── Controls Row ────────────────────────────────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'max-w-3xl mx-auto flex items-center justify-between gap-2.5';

  // Left Block: Play Button + Track Info
  const leftBlock = document.createElement('div');
  leftBlock.className = 'flex items-center gap-2.5 min-w-0 flex-1';

  // Play / Pause Button
  const playBtn = document.createElement('button');
  playBtn.id = 'play-pause-btn';
  playBtn.setAttribute('aria-label', 'Play Garba');
  playBtn.className = [
    'flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full',
    'bg-theme-accent hover:opacity-95 active:scale-95 text-white',
    'flex items-center justify-center shadow-lg shadow-theme-glow',
    'transition-all duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-theme-gold',
  ].join(' ');
  playBtn.innerHTML = PLAY_ICON;

  playBtn.addEventListener('click', () => {
    const { isPlaying } = getState();
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  });

  // Diya Flame Indicator
  const flameMount = document.createElement('div');
  flameMount.id = 'player-diya-flame';
  flameMount.className = 'flex-shrink-0 hidden xs:block opacity-90';
  flameMount.innerHTML = getDiyaFlameSVG(22);

  // Track text block
  const textBlock = document.createElement('div');
  textBlock.className = 'flex-1 min-w-0 cursor-pointer group';
  textBlock.title = 'Click to open full-screen Now Playing stage';
  textBlock.addEventListener('click', () => openFullPlayerModal());

  const titleRow = document.createElement('div');
  titleRow.className = 'flex items-center gap-1.5';

  const trackTitle = document.createElement('p');
  trackTitle.id = 'track-title';
  trackTitle.className = 'font-display font-bold text-theme-primary text-xs sm:text-sm truncate leading-tight';
  trackTitle.textContent = 'GarbaWave 🪔';

  const bpmBadge = document.createElement('span');
  bpmBadge.id = 'player-bpm-badge';
  bpmBadge.className = 'hidden text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-elevated text-theme-gold border border-theme-subtle flex-shrink-0';

  titleRow.appendChild(trackTitle);
  titleRow.appendChild(bpmBadge);

  const artistRow = document.createElement('div');
  artistRow.className = 'flex items-center gap-1.5 mt-0.5';

  const trackArtist = document.createElement('p');
  trackArtist.id = 'track-artist';
  trackArtist.className = 'font-sans text-theme-secondary text-[11px] truncate leading-tight';
  trackArtist.textContent = 'Tap a genre or song to start the circle';

  const artistLink = document.createElement('a');
  artistLink.id = 'player-artist-link';
  artistLink.target = '_blank';
  artistLink.rel = 'noopener noreferrer';
  artistLink.className = 'hidden text-[10px] text-theme-accent hover:underline flex-shrink-0';
  artistLink.textContent = '↗ Artist Channel';

  artistRow.appendChild(trackArtist);
  artistRow.appendChild(artistLink);

  // Chapter row — shown only for tracks with a tracklist
  const chapterRow = document.createElement('div');
  chapterRow.id = 'player-chapter-row';
  chapterRow.className = 'hidden flex items-center gap-1 mt-0.5';

  const chapterNow = document.createElement('span');
  chapterNow.id = 'player-chapter-now';
  chapterNow.className = 'text-[10px] font-medium text-theme-accent truncate max-w-[140px] sm:max-w-[200px]';

  const chapterArrow = document.createElement('span');
  chapterArrow.className = 'text-[9px] text-theme-muted flex-shrink-0';
  chapterArrow.textContent = '·';

  const chapterNext = document.createElement('span');
  chapterNext.id = 'player-chapter-next';
  chapterNext.className = 'text-[10px] text-theme-muted truncate max-w-[100px] sm:max-w-[150px]';

  chapterRow.appendChild(chapterNow);
  chapterRow.appendChild(chapterArrow);
  chapterRow.appendChild(chapterNext);

  textBlock.appendChild(titleRow);
  textBlock.appendChild(artistRow);
  textBlock.appendChild(chapterRow);


  leftBlock.appendChild(playBtn);
  leftBlock.appendChild(flameMount);
  leftBlock.appendChild(textBlock);

  // Right Block: Lyrics, Share, Time & Dandiya Deco
  const rightBlock = document.createElement('div');
  rightBlock.className = 'flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0';

  // Lyrics Button (Features v2)
  const lyricsBtn = document.createElement('button');
  lyricsBtn.id = 'lyrics-toggle-btn';
  lyricsBtn.type = 'button';
  lyricsBtn.className = [
    'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium',
    'bg-surface-card hover:bg-surface-elevated text-theme-primary border border-theme-subtle',
    'transition-all duration-200 cursor-pointer shadow-sm',
  ].join(' ');
  lyricsBtn.innerHTML = `<span>📜</span><span class="hidden md:inline">Lyrics</span>`;
  lyricsBtn.title = 'Open Sing-Along Lyrics & English Meaning';
  lyricsBtn.addEventListener('click', () => openLyricsModal());

  // WhatsApp / Share Button (Features v2)
  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = [
    'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium',
    'bg-surface-card hover:bg-surface-elevated text-theme-primary border border-theme-subtle',
    'transition-all duration-200 cursor-pointer shadow-sm',
  ].join(' ');
  shareBtn.innerHTML = `<span>📲</span><span class="hidden md:inline">Share</span>`;
  shareBtn.title = 'Share track to WhatsApp or friends';
  shareBtn.addEventListener('click', () => shareNowPlaying());

  // Time display
  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'text-right font-sans pl-1';

  const elapsed = document.createElement('span');
  elapsed.id = 'elapsed';
  elapsed.className = 'text-xs font-semibold text-theme-primary tabular-nums';
  elapsed.setAttribute('aria-hidden', 'true');
  elapsed.textContent = '0:00';

  const slash = document.createElement('span');
  slash.className = 'text-[10px] text-theme-muted mx-0.5';
  slash.setAttribute('aria-hidden', 'true');
  slash.textContent = '/';

  const duration = document.createElement('span');
  duration.id = 'duration';
  duration.className = 'text-xs text-theme-muted tabular-nums';
  duration.setAttribute('aria-hidden', 'true');
  duration.textContent = '0:00';

  timeDisplay.appendChild(elapsed);
  timeDisplay.appendChild(slash);
  timeDisplay.appendChild(duration);

  // Dandiya Icon Accent (Large Desktop)
  const dandiyaDeco = document.createElement('div');
  dandiyaDeco.className = 'hidden lg:flex items-center text-theme-gold opacity-50 flex-shrink-0 pl-1';
  dandiyaDeco.innerHTML = getCrossedDandiyaSVG(20);

  rightBlock.appendChild(lyricsBtn);
  rightBlock.appendChild(shareBtn);
  rightBlock.appendChild(timeDisplay);
  rightBlock.appendChild(dandiyaDeco);

  controls.appendChild(leftBlock);
  controls.appendChild(rightBlock);

  bar.appendChild(progressWrap);
  bar.appendChild(controls);

  return bar;
}

export function mountPlayerBar(container: HTMLElement): void {
  const bar = buildPlayerBar();
  container.appendChild(bar);

  const playBtn = bar.querySelector<HTMLButtonElement>('#play-pause-btn')!;
  const titleEl = bar.querySelector<HTMLParagraphElement>('#track-title')!;
  const artistEl = bar.querySelector<HTMLParagraphElement>('#track-artist')!;
  const bpmBadge = bar.querySelector<HTMLSpanElement>('#player-bpm-badge')!;
  const artistLink = bar.querySelector<HTMLAnchorElement>('#player-artist-link')!;
  const progressFill = bar.querySelector<HTMLDivElement>('#progress-fill')!;
  const seekDot = bar.querySelector<HTMLDivElement>('#seek-dot')!;
  const elapsedEl = bar.querySelector<HTMLSpanElement>('#elapsed')!;
  const durationEl = bar.querySelector<HTMLSpanElement>('#duration')!;
  const progressWrap = bar.querySelector<HTMLDivElement>('[role="slider"]')!;
  const flameMount = bar.querySelector<HTMLDivElement>('#player-diya-flame')!;
  const chapterRow = bar.querySelector<HTMLDivElement>('#player-chapter-row')!;
  const chapterNow = bar.querySelector<HTMLSpanElement>('#player-chapter-now')!;
  const chapterNext = bar.querySelector<HTMLSpanElement>('#player-chapter-next')!;

  subscribe('isPlaying', (s) => {
    playBtn.innerHTML = s.isPlaying ? PAUSE_ICON : PLAY_ICON;
    playBtn.setAttribute('aria-label', s.isPlaying ? 'Pause Garba' : 'Play Garba');
    flameMount.style.opacity = s.isPlaying ? '1' : '0.4';
    if (s.isPlaying) {
      playBtn.classList.add('ring-4', 'ring-theme-gold/30');
    } else {
      playBtn.classList.remove('ring-4', 'ring-theme-gold/30');
    }
  });

  subscribe('currentTrack', (s) => {
    titleEl.textContent = s.currentTrack?.title ?? 'GarbaWave 🪔';
    artistEl.textContent = s.currentTrack?.artist ?? 'Tap a genre or song to start the circle';

    if (s.currentTrack?.bpm) {
      bpmBadge.textContent = `⚡ ${s.currentTrack.bpm} BPM`;
      bpmBadge.classList.remove('hidden');
    } else {
      bpmBadge.classList.add('hidden');
    }

    if (s.currentTrack?.artistUrl) {
      artistLink.href = s.currentTrack.artistUrl;
      artistLink.classList.remove('hidden');
    } else {
      artistLink.classList.add('hidden');
    }

    // Hide chapter row when track has no tracklist
    if (!s.currentTrack?.tracklist || s.currentTrack.tracklist.length === 0) {
      chapterRow.classList.add('hidden');
    }
  });

  subscribe('progress', (s) => {
    const pct = `${(s.progress * 100).toFixed(1)}%`;
    progressFill.style.width = pct;
    seekDot.style.left = pct;
    progressWrap.setAttribute('aria-valuenow', String(Math.round(s.progress * 100)));

    const elapsedSecs = s.progress * s.durationSeconds;
    elapsedEl.textContent = formatSeconds(elapsedSecs);
    durationEl.textContent = formatSeconds(s.durationSeconds);
  });

  // Chapter tracker — shows current/next song within nonstop sets
  onChapterChange((current, next) => {
    if (!current) {
      chapterRow.classList.add('hidden');
      return;
    }
    chapterRow.classList.remove('hidden');
    chapterNow.textContent = `▶ ${current.title}`;
    if (next) {
      chapterNext.textContent = `Next: ${next.title}`;
      chapterNext.classList.remove('hidden');
    } else {
      chapterNext.textContent = 'Last song';
      chapterNext.classList.remove('hidden');
    }
  });
}

