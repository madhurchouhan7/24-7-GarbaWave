/**
 * features/lyrics.ts — Lyrics, Transliteration & English Meaning Sheet (Features v2 §2).
 *
 * Provides a 3-way toggle for diaspora & global listeners:
 *  1. Gujarati Script (ગુજરાતી)
 *  2. Romanized Phonetic Transliteration (for singing along)
 *  3. English Meaning / Gloss
 */

import type { Song } from '../types';
import { getState, subscribe } from '../state';

type LyricsViewMode = 'all' | 'phonetic' | 'gujarati' | 'meaning';
let currentMode: LyricsViewMode = 'all';

export function openLyricsModal(song?: Song): void {
  const targetSong = song ?? getState().currentTrack;
  if (!targetSong) return;

  const existing = document.getElementById('gw-lyrics-modal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'gw-lyrics-modal';
  backdrop.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-label', `Lyrics for ${targetSong.title}`);

  const card = document.createElement('div');
  card.className = [
    'w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl',
    'bg-surface-card border border-theme-subtle shadow-2xl overflow-hidden',
    'animate-in fade-in slide-in-from-bottom duration-300',
  ].join(' ');

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 sm:p-5 border-b border-theme-subtle bg-surface-elevated';

  const titleBlock = document.createElement('div');
  titleBlock.className = 'flex-1 min-w-0 pr-3';
  titleBlock.innerHTML = `
    <div class="flex items-center gap-1.5">
      <span class="text-base">📜</span>
      <h3 class="font-display font-bold text-base text-theme-primary truncate">${targetSong.title}</h3>
    </div>
    <p class="text-xs text-theme-secondary truncate mt-0.5">${targetSong.artist} ${targetSong.regionalStyle ? `• ${targetSong.regionalStyle} Style` : ''}</p>
  `;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'w-8 h-8 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary bg-surface-card text-sm';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => backdrop.remove());

  header.appendChild(titleBlock);
  header.appendChild(closeBtn);

  // View Mode Tabs
  const tabStrip = document.createElement('div');
  tabStrip.className = 'flex gap-1 p-2 bg-surface-elevated/50 border-b border-theme-subtle overflow-x-auto';

  const modes: { id: LyricsViewMode; label: string }[] = [
    { id: 'all', label: '📖 All / Verse View' },
    { id: 'phonetic', label: '🗣️ Sing-Along (Phonetic)' },
    { id: 'gujarati', label: 'ગુજરાતી' },
    { id: 'meaning', label: '🇬🇧 Meaning' },
  ];

  const contentBody = document.createElement('div');
  contentBody.className = 'flex-1 overflow-y-auto p-5 space-y-4';

  function renderContent() {
    contentBody.innerHTML = '';

    if (!targetSong?.lyrics || targetSong.lyrics.gujarati.length === 0) {
      contentBody.innerHTML = `
        <div class="text-center py-10 text-theme-muted space-y-2">
          <span class="text-3xl block">🪔</span>
          <p class="font-display font-bold text-sm text-theme-primary">Full verified lyrics coming soon!</p>
          <p class="text-xs text-theme-secondary">Our cultural team is verifying the Gujarati script & English meaning.</p>
        </div>
      `;
      return;
    }

    const { gujarati, englishPhonetic, meaning } = targetSong.lyrics;
    const count = Math.max(gujarati.length, englishPhonetic.length, meaning.length);

    for (let i = 0; i < count; i++) {
      const verseBox = document.createElement('div');
      verseBox.className = 'p-3.5 rounded-2xl bg-surface-elevated border border-theme-subtle space-y-1.5';

      if (currentMode === 'all') {
        if (gujarati[i]) {
          const g = document.createElement('p');
          g.className = 'font-bold text-base text-theme-primary';
          g.textContent = gujarati[i];
          verseBox.appendChild(g);
        }
        if (englishPhonetic[i]) {
          const p = document.createElement('p');
          p.className = 'font-sans font-medium text-xs text-theme-accent';
          p.textContent = englishPhonetic[i];
          verseBox.appendChild(p);
        }
        if (meaning[i]) {
          const m = document.createElement('p');
          m.className = 'text-xs text-theme-secondary italic';
          m.textContent = `"${meaning[i]}"`;
          verseBox.appendChild(m);
        }
      } else if (currentMode === 'gujarati') {
        if (gujarati[i]) {
          const g = document.createElement('p');
          g.className = 'font-bold text-base text-theme-primary';
          g.textContent = gujarati[i];
          verseBox.appendChild(g);
        }
      } else if (currentMode === 'phonetic') {
        if (englishPhonetic[i]) {
          const p = document.createElement('p');
          p.className = 'font-sans font-semibold text-sm text-theme-accent';
          p.textContent = englishPhonetic[i];
          verseBox.appendChild(p);
        }
      } else if (currentMode === 'meaning') {
        if (meaning[i]) {
          const m = document.createElement('p');
          m.className = 'text-xs text-theme-primary';
          m.textContent = meaning[i];
          verseBox.appendChild(m);
        }
      }

      contentBody.appendChild(verseBox);
    }
  }

  modes.forEach((m) => {
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = [
      'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer',
      currentMode === m.id
        ? 'bg-theme-accent text-white font-bold shadow-sm'
        : 'text-theme-secondary hover:text-theme-primary hover:bg-surface-elevated',
    ].join(' ');
    tabBtn.textContent = m.label;

    tabBtn.addEventListener('click', () => {
      currentMode = m.id;
      // Re-render tab classes
      tabStrip.querySelectorAll('button').forEach((b, idx) => {
        const isCurrent = modes[idx].id === currentMode;
        b.className = [
          'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer',
          isCurrent
            ? 'bg-theme-accent text-white font-bold shadow-sm'
            : 'text-theme-secondary hover:text-theme-primary hover:bg-surface-elevated',
        ].join(' ');
      });
      renderContent();
    });

    tabStrip.appendChild(tabBtn);
  });

  renderContent();

  card.appendChild(header);
  card.appendChild(tabStrip);
  card.appendChild(contentBody);
  backdrop.appendChild(card);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });

  document.body.appendChild(backdrop);
}

// Keep modal synchronized if track changes while open
subscribe('currentTrack', (s) => {
  const modal = document.getElementById('gw-lyrics-modal');
  if (modal && s.currentTrack) {
    openLyricsModal(s.currentTrack);
  }
});
