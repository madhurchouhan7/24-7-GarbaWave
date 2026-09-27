/**
 * ui/fullPlayerModal.ts — Full-Screen Mobile "Now Playing" Stage View.
 *
 * Immersive stage view with:
 *  - Giant rotating Mandala & glowing Diya flame
 *  - Large display typography & artist badges
 *  - Scrollable Karaoke Sing-Along lyrics
 *  - Full playback transport (Prev / Play / Next / Dandiya Seek Slider)
 *  - Live Floating Reaction toolbar
 */

import { getState, subscribe } from '../state';
import { player } from '../player';
import { getMandalaSVG, getDiyaFlameSVG } from './motifs';
import { mountReactionBar } from '../features/reactions';
import { shareNowPlaying } from '../features/share';
import { onChapterChange, getCurrentChapterIndex, getTracklist } from '../features/chapterTracker';
import type { TrackChapter } from '../types';


const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
const PAUSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const PREV_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
const NEXT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;

function formatSeconds(secs: number): string {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function openFullPlayerModal(): void {
  const existing = document.getElementById('gw-full-player-modal');
  if (existing) {
    existing.classList.remove('hidden');
    updateModalContent();
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'gw-full-player-modal';
  modal.className = 'fixed inset-0 z-50 flex flex-col bg-surface-base/98 backdrop-blur-2xl transition-all duration-300 overflow-y-auto';
  modal.style.backgroundColor = 'var(--bg-base)';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Full Screen Now Playing Stage');

  modal.innerHTML = `
    <!-- Top Bar with Minimize & Share -->
    <div class="max-w-xl mx-auto w-full px-5 py-4 flex items-center justify-between border-b border-theme-subtle">
      <button id="modal-minimize-btn" class="flex items-center gap-1 text-xs font-semibold text-theme-muted hover:text-theme-primary px-3 py-1.5 rounded-full bg-surface-card border border-theme-subtle cursor-pointer">
        <span>↓</span>
        <span>Minimize</span>
      </button>

      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold text-theme-primary font-display">Now in Circle</span>
        <span class="w-2 h-2 rounded-full bg-theme-accent animate-ping"></span>
      </div>

      <button id="modal-share-btn" class="flex items-center gap-1 text-xs font-semibold text-theme-primary px-3 py-1.5 rounded-full bg-surface-card border border-theme-subtle cursor-pointer">
        <span>📲</span>
        <span>Share</span>
      </button>
    </div>

    <!-- Center Stage Container -->
    <div class="max-w-xl mx-auto w-full px-5 py-6 flex-1 flex flex-col items-center justify-between space-y-6">

      <!-- Visual Stage: Rotating Mandala & Diya Flame -->
      <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
        <div class="absolute inset-0 flex items-center justify-center mandala-rotate select-none opacity-40">
          ${getMandalaSVG(280)}
        </div>
        <div class="relative z-10 flex flex-col items-center justify-center p-6 rounded-3xl bg-surface-card/90 border-2 border-theme-active shadow-2xl shadow-theme-glow text-center">
          <div class="mb-2 scale-125">${getDiyaFlameSVG(32)}</div>
          <span id="modal-stage-title" class="font-display font-extrabold text-lg sm:text-xl text-theme-primary truncate max-w-[200px] leading-tight">GarbaWave</span>
          <span id="modal-stage-artist" class="font-sans text-xs text-theme-secondary truncate max-w-[180px] mt-1">Authentic Garba</span>
          <span id="modal-stage-bpm" class="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-elevated text-theme-gold border border-theme-subtle">⚡ 124 BPM</span>
        </div>
      </div>

      <!-- Karaoke Sing-Along Lyrics Box -->
      <div class="w-full p-4 rounded-2xl bg-surface-card border border-theme-subtle shadow-md">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span>📜</span>
            <span class="font-display font-bold text-xs text-theme-primary">Sing-Along Lyrics (Karaoke)</span>
          </div>
          <span class="text-[10px] text-theme-muted">Bilingual Gujarati + English</span>
        </div>
        <div id="modal-lyrics-box" class="max-h-32 overflow-y-auto space-y-2 text-center p-2 rounded-xl bg-surface-elevated/50 text-xs">
          <!-- Lyrics populated dynamically -->
        </div>
      </div>

      <!-- Tracklist Panel — shown only for nonstop sets with chapters -->
      <div id="modal-tracklist-panel" class="hidden w-full p-4 rounded-2xl bg-surface-card border border-theme-subtle shadow-md">
        <div class="flex items-center gap-1.5 mb-3">
          <span>🎵</span>
          <span class="font-display font-bold text-xs text-theme-primary">Songs in This Set</span>
          <span id="modal-tracklist-count" class="ml-auto text-[10px] text-theme-muted"></span>
        </div>
        <div id="modal-tracklist-scroll" class="max-h-48 overflow-y-auto space-y-1 pr-1 scroll-smooth">
          <!-- Chapters rendered dynamically -->
        </div>
      </div>

      <!-- Dandiya Progress Slider -->
      <div class="w-full space-y-1.5">
        <div id="modal-progress-wrap" class="w-full dandiya-progress-track cursor-pointer group" role="slider" aria-label="Seek track" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div id="modal-progress-fill" class="dandiya-progress-fill" style="width: 0%;"></div>
          <div id="modal-seek-dot" class="dandiya-seek-dot" style="left: 0%;"></div>
        </div>
        <div class="flex items-center justify-between text-xs font-sans tabular-nums text-theme-muted">
          <span id="modal-time-elapsed">0:00</span>
          <span id="modal-time-duration">0:00</span>
        </div>
      </div>

      <!-- Large Transport Controls -->
      <div class="flex items-center justify-center gap-6 w-full">
        <button id="modal-prev-btn" class="w-12 h-12 rounded-full flex items-center justify-center text-theme-primary hover:bg-surface-elevated active:scale-90 transition-all cursor-pointer">
          ${PREV_ICON}
        </button>

        <button id="modal-play-btn" class="w-16 h-16 rounded-full flex items-center justify-center bg-theme-accent text-white shadow-2xl shadow-theme-glow hover:opacity-95 active:scale-95 transition-all cursor-pointer ring-4 ring-theme-gold/30">
          ${PLAY_ICON}
        </button>

        <button id="modal-next-btn" class="w-12 h-12 rounded-full flex items-center justify-center text-theme-primary hover:bg-surface-elevated active:scale-90 transition-all cursor-pointer">
          ${NEXT_ICON}
        </button>
      </div>

      <!-- Live Floating Reaction Toolbar -->
      <div class="w-full flex flex-col items-center gap-2 pt-2">
        <span class="text-[10px] text-theme-muted uppercase tracking-wider font-semibold">Send Live Cheer</span>
        <div id="modal-reaction-mount"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Wire controls
  document.getElementById('modal-minimize-btn')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('modal-share-btn')?.addEventListener('click', () => {
    shareNowPlaying();
  });

  const playBtn = document.getElementById('modal-play-btn');
  playBtn?.addEventListener('click', () => {
    const { isPlaying } = getState();
    if (isPlaying) player.pause();
    else player.play();
  });

  document.getElementById('modal-prev-btn')?.addEventListener('click', () => {
    const { queue, queueIndex } = getState();
    if (queue.length > 0) {
      const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
      player.load(queue[prevIdx].youtubeId, true);
    }
  });

  document.getElementById('modal-next-btn')?.addEventListener('click', () => {
    const { queue, queueIndex } = getState();
    if (queue.length > 0) {
      const nextIdx = (queueIndex + 1) % queue.length;
      player.load(queue[nextIdx].youtubeId, true);
    }
  });

  // Seek
  const progressWrap = document.getElementById('modal-progress-wrap');
  progressWrap?.addEventListener('click', (e) => {
    const rect = progressWrap.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    player.seek(fraction);
  });

  // Mount Reaction Bar
  const reactionMount = document.getElementById('modal-reaction-mount');
  if (reactionMount) mountReactionBar(reactionMount);

  // State Subscriptions
  subscribe('isPlaying', (s) => {
    if (playBtn) playBtn.innerHTML = s.isPlaying ? PAUSE_ICON : PLAY_ICON;
  });

  subscribe('currentTrack', () => {
    updateModalContent();
    renderTracklist();
  });

  subscribe('progress', (s) => {
    const pct = `${(s.progress * 100).toFixed(1)}%`;
    const fill = document.getElementById('modal-progress-fill');
    const dot = document.getElementById('modal-seek-dot');
    const elapsedEl = document.getElementById('modal-time-elapsed');
    const durationEl = document.getElementById('modal-time-duration');

    if (fill) fill.style.width = pct;
    if (dot) dot.style.left = pct;
    if (elapsedEl) elapsedEl.textContent = formatSeconds(s.progress * s.durationSeconds);
    if (durationEl) durationEl.textContent = formatSeconds(s.durationSeconds);
  });

  // Chapter tracker — highlight active chapter row in tracklist
  onChapterChange((_current, _next, idx) => {
    highlightChapterRow(idx);
  });

  updateModalContent();
  renderTracklist();
}

// ─── Tracklist Rendering ──────────────────────────────────────────────────────

function renderTracklist(): void {
  const panel = document.getElementById('modal-tracklist-panel');
  const scroll = document.getElementById('modal-tracklist-scroll');
  const count = document.getElementById('modal-tracklist-count');
  if (!panel || !scroll || !count) return;

  const { currentTrack } = getState();
  const tracklist = currentTrack ? getTracklist(currentTrack) : [];

  if (tracklist.length === 0) {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');
  count.textContent = `${tracklist.length} songs`;

  scroll.innerHTML = '';
  tracklist.forEach((chapter: TrackChapter, idx: number) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.id = `modal-chapter-row-${idx}`;
    row.className = [
      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left',
      'transition-all duration-200 cursor-pointer border',
      'hover:bg-surface-elevated border-transparent',
      'focus:outline-none focus:ring-2 focus:ring-theme-gold',
    ].join(' ');
    row.setAttribute('aria-label', `Jump to ${chapter.title}`);

    // Index number
    const numEl = document.createElement('span');
    numEl.className = 'text-[10px] font-bold text-theme-muted w-5 text-center flex-shrink-0 tabular-nums';
    numEl.textContent = String(idx + 1);

    // Title + artist
    const textWrap = document.createElement('div');
    textWrap.className = 'flex-1 min-w-0';

    const titleEl = document.createElement('p');
    titleEl.className = 'text-xs font-semibold text-theme-primary truncate leading-tight';
    titleEl.textContent = chapter.title;

    const artistEl = document.createElement('p');
    artistEl.className = 'text-[10px] text-theme-secondary truncate mt-0.5';
    artistEl.textContent = chapter.artist ?? currentTrack?.artist ?? '';

    textWrap.appendChild(titleEl);
    if (artistEl.textContent) textWrap.appendChild(artistEl);

    // Start time
    const timeEl = document.createElement('span');
    timeEl.className = 'text-[10px] font-mono text-theme-muted flex-shrink-0 tabular-nums';
    timeEl.textContent = formatSeconds(chapter.startSeconds);

    row.appendChild(numEl);
    row.appendChild(textWrap);
    row.appendChild(timeEl);

    // Click: seek to chapter start
    row.addEventListener('click', () => {
      player.seekToSeconds(chapter.startSeconds);
      player.play();
    });

    scroll.appendChild(row);
  });

  // Highlight current chapter on initial render
  const activeIdx = getCurrentChapterIndex();
  if (activeIdx >= 0) highlightChapterRow(activeIdx);
}

function highlightChapterRow(activeIdx: number): void {
  const scroll = document.getElementById('modal-tracklist-scroll');
  if (!scroll) return;

  const rows = scroll.querySelectorAll<HTMLButtonElement>('[id^="modal-chapter-row-"]');
  rows.forEach((row, idx) => {
    if (idx === activeIdx) {
      row.classList.add(
        'bg-surface-elevated',
        'border-theme-active',
        'text-theme-accent',
        'ring-1',
        'ring-theme-gold/40',
      );
      // Smooth scroll the active chapter into view
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      row.classList.remove(
        'bg-surface-elevated',
        'border-theme-active',
        'text-theme-accent',
        'ring-1',
        'ring-theme-gold/40',
      );
      row.classList.add('border-transparent');
    }
  });
}

function updateModalContent(): void {
  const { currentTrack } = getState();
  if (!currentTrack) return;

  const stageTitle = document.getElementById('modal-stage-title');
  const stageArtist = document.getElementById('modal-stage-artist');
  const stageBpm = document.getElementById('modal-stage-bpm');
  const lyricsBox = document.getElementById('modal-lyrics-box');

  if (stageTitle) stageTitle.textContent = currentTrack.title;
  if (stageArtist) stageArtist.textContent = `${currentTrack.artist} ${currentTrack.regionalStyle ? `• ${currentTrack.regionalStyle}` : ''}`;
  if (stageBpm) stageBpm.textContent = currentTrack.bpm ? `⚡ ${currentTrack.bpm} BPM` : '⚡ 124 BPM';

  if (lyricsBox) {
    if (currentTrack.lyrics && currentTrack.lyrics.gujarati.length > 0) {
      lyricsBox.innerHTML = currentTrack.lyrics.gujarati
        .map(
          (line, idx) => `
          <div class="py-1">
            <p class="font-bold text-sm text-theme-primary">${line}</p>
            <p class="text-xs text-theme-accent font-medium">${currentTrack.lyrics?.englishPhonetic[idx] || ''}</p>
            <p class="text-[11px] text-theme-secondary italic">"${currentTrack.lyrics?.meaning[idx] || ''}"</p>
          </div>
        `,
        )
        .join('');
    } else {
      lyricsBox.innerHTML = `
        <div class="py-3 text-theme-muted">
          <p class="font-bold text-xs">Sing with the circle rhythm 🪔</p>
          <p class="text-[11px] mt-0.5">Verified lyrics coming in next batch</p>
        </div>
      `;
    }
  }
}
