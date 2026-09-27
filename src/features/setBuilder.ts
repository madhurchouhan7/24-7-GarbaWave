/**
 * features/setBuilder.ts — BPM/Tempo Tagging & Event Arc Set Builder (Features v2 §2).
 *
 * Designed for event organizers and Garba lovers to craft perfectly paced sets:
 *  Phase 1: Warm-up & Aarti (80–105 BPM)
 *  Phase 2: Traditional 2-Taali / 3-Taali (110–125 BPM)
 *  Phase 3: Fast Dandiya Raas (126–140 BPM)
 *  Phase 4: Peak Energy Sanedo & Nonstop Finale (141+ BPM)
 */

import type { Song, SetlistPhase } from '../types';
import { setQueue, setIsPlaying } from '../state';
import { player } from '../player';

export function buildEventArc(allSongs: Song[]): SetlistPhase[] {
  const playable = allSongs.filter((s) => s.playable);

  const phases: SetlistPhase[] = [
    {
      name: '1. Warm-up & Aarti',
      bpmRange: '80 – 105 BPM',
      description: 'Devotional entry, Aarti & graceful 2-Taali circles',
      songs: playable.filter((s) => (s.bpm ?? 100) <= 105 || s.genre.includes('Devotional')),
    },
    {
      name: '2. Traditional 3-Taali',
      bpmRange: '110 – 125 BPM',
      description: 'Classic Gujarati folk tunes & building group rhythm',
      songs: playable.filter((s) => {
        const bpm = s.bpm ?? 120;
        return bpm > 105 && bpm <= 125;
      }),
    },
    {
      name: '3. Dandiya Raas',
      bpmRange: '126 – 140 BPM',
      description: 'High-spirit stick dancing & synchronized swirls',
      songs: playable.filter((s) => {
        const bpm = s.bpm ?? 130;
        return bpm > 125 && bpm <= 140;
      }),
    },
    {
      name: '4. Peak Sanedo & Finale',
      bpmRange: '141+ BPM',
      description: 'Maximum velocity dancing, Sanedo calls & grand finale',
      songs: playable.filter((s) => (s.bpm ?? 145) > 140 || s.genre.includes('Sanedo')),
    },
  ];

  return phases;
}

/**
 * Creates an ordered full-night setlist transitioning smoothly from slow to peak.
 */
export function generateFullNightQueue(allSongs: Song[]): Song[] {
  const phases = buildEventArc(allSongs);
  const ordered: Song[] = [];
  const seen = new Set<string>();

  phases.forEach((phase) => {
    phase.songs.forEach((song) => {
      if (!seen.has(song.id)) {
        seen.add(song.id);
        ordered.push(song);
      }
    });
  });

  return ordered.length > 0 ? ordered : allSongs.filter((s) => s.playable);
}

/**
 * Mounts the Set Builder interactive modal / drawer.
 */
export function mountSetBuilderModal(allSongs: Song[]): void {
  const existing = document.getElementById('gw-set-builder-modal');
  if (existing) {
    existing.classList.remove('hidden');
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'gw-set-builder-modal';
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-label', 'Navratri Setlist Arc Builder');

  const card = document.createElement('div');
  card.className = [
    'w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl',
    'bg-surface-card border border-theme-subtle shadow-2xl overflow-hidden',
  ].join(' ');

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-5 border-b border-theme-subtle';

  const titleBlock = document.createElement('div');
  titleBlock.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-xl">🥢</span>
      <h3 class="font-display font-bold text-lg text-theme-primary">Navratri Setlist Arc Builder</h3>
    </div>
    <p class="text-xs text-theme-secondary mt-0.5">Auto-sequences songs by BPM for a complete event arc (Warm-up ➔ Peak)</p>
  `;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'w-8 h-8 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary bg-surface-elevated text-sm';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => backdrop.classList.add('hidden'));

  header.appendChild(titleBlock);
  header.appendChild(closeBtn);

  // Content (Phase Breakdown)
  const body = document.createElement('div');
  body.className = 'flex-1 overflow-y-auto p-5 space-y-4';

  const phases = buildEventArc(allSongs);

  phases.forEach((phase) => {
    const phaseBox = document.createElement('div');
    phaseBox.className = 'p-3.5 rounded-2xl bg-surface-elevated border border-theme-subtle';

    const pHeader = document.createElement('div');
    pHeader.className = 'flex items-center justify-between mb-1';
    pHeader.innerHTML = `
      <span class="font-display font-bold text-sm text-theme-primary">${phase.name}</span>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-theme-accent/20 text-theme-accent">${phase.bpmRange}</span>
    `;

    const pDesc = document.createElement('p');
    pDesc.className = 'text-xs text-theme-secondary mb-2';
    pDesc.textContent = phase.description;

    const songList = document.createElement('div');
    songList.className = 'space-y-1.5';

    if (phase.songs.length === 0) {
      songList.innerHTML = `<span class="text-[11px] text-theme-muted italic">No songs assigned to this range yet.</span>`;
    } else {
      phase.songs.slice(0, 3).forEach((s) => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-surface-card text-theme-primary';
        row.innerHTML = `
          <span class="truncate pr-2 font-medium">${s.title}</span>
          <span class="text-[10px] text-theme-gold flex-shrink-0">${s.bpm ? `${s.bpm} BPM` : ''}</span>
        `;
        songList.appendChild(row);
      });
    }

    phaseBox.appendChild(pHeader);
    phaseBox.appendChild(pDesc);
    phaseBox.appendChild(songList);
    body.appendChild(phaseBox);
  });

  // Footer Actions
  const footer = document.createElement('div');
  footer.className = 'p-4 border-t border-theme-subtle flex items-center justify-between gap-3 bg-surface-elevated';

  const countLabel = document.createElement('span');
  countLabel.className = 'text-xs text-theme-muted';
  const fullQueue = generateFullNightQueue(allSongs);
  countLabel.textContent = `${fullQueue.length} tracks structured in BPM sequence`;

  const startSetBtn = document.createElement('button');
  startSetBtn.type = 'button';
  startSetBtn.className = [
    'px-5 py-2.5 rounded-xl font-display font-bold text-sm text-white',
    'bg-theme-accent hover:opacity-90 active:scale-95 shadow-lg shadow-theme-glow',
    'transition-all duration-200 cursor-pointer flex items-center gap-2',
  ].join(' ');
  startSetBtn.innerHTML = `<span>▶ Start Full Night Arc</span>`;

  startSetBtn.addEventListener('click', () => {
    setQueue(fullQueue, 0);
    setIsPlaying(true);
    if (fullQueue[0]) player.load(fullQueue[0].youtubeId, true);
    backdrop.classList.add('hidden');
  });

  footer.appendChild(countLabel);
  footer.appendChild(startSetBtn);

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);
  backdrop.appendChild(card);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.add('hidden');
  });

  document.body.appendChild(backdrop);
}
