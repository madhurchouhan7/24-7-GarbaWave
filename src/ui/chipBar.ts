/**
 * ui/chipBar.ts — Navratri Genre Chip Bar with Bandhani pattern & Garba Clap Ripple.
 *
 * Tapping a chip:
 *  - Spawns a rhythmic "Garba clap" ripple animation
 *  - Filters the catalogue queue to that genre
 *  - Starts playback from the first track
 *
 * Spec reference: docs/07-design-theme-spec.md §5
 */

import type { Genre } from '../types';
import { getQueue } from '../catalogue';
import { setQueue, setIsPlaying } from '../state';
import { player } from '../player';
import { getAbhlaMirrorSVG } from './motifs';

interface ChipDef {
  label: string;
  gujaratiLabel: string;
  value: Genre | 'all';
  emoji: string;
}

const CHIPS: ChipDef[] = [
  { label: 'All Garba',   gujaratiLabel: 'બધા ગરબા',  value: 'all',         emoji: '🎵' },
  { label: 'Traditional', gujaratiLabel: 'પરંપરાગત',  value: 'Traditional', emoji: '🏺' },
  { label: 'Dandiya',     gujaratiLabel: 'દાંડિયા',    value: 'Dandiya',     emoji: '🥢' },
  { label: 'Devotional',  gujaratiLabel: 'ભક્તિ',      value: 'Devotional',  emoji: '🪔' },
  { label: 'Folk',        gujaratiLabel: 'લોકગીત',     value: 'Folk',        emoji: '🌾' },
  { label: 'Sanedo',      gujaratiLabel: 'સણેદો',      value: 'Sanedo',      emoji: '🥁' },
  { label: 'Fusion',      gujaratiLabel: 'ફ્યુઝન',     value: 'Fusion',      emoji: '✨' },
];

export function mountChipBar(container: HTMLElement): void {
  const wrap = document.createElement('div');
  wrap.id = 'chip-bar';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Filter by Garba genre');
  wrap.className = [
    'flex gap-2.5 overflow-x-auto scrollbar-hide',
    'py-2 px-4',
    'snap-x snap-mandatory',
  ].join(' ');

  let activeChip: HTMLButtonElement | null = null;

  CHIPS.forEach((chip, idx) => {
    const btn = document.createElement('button');
    btn.className = buildChipClass(idx === 0);
    btn.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
    btn.setAttribute('data-genre', chip.value);

    // Emoji icon
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'text-sm select-none';
    emojiSpan.setAttribute('aria-hidden', 'true');
    emojiSpan.textContent = chip.emoji;

    // Label text
    const textWrap = document.createElement('span');
    textWrap.className = 'flex flex-col text-left leading-tight';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'font-sans font-semibold text-xs tracking-wide';
    labelSpan.textContent = chip.label;

    const gujSpan = document.createElement('span');
    gujSpan.className = 'text-[9px] opacity-70 font-sans leading-none -mt-0.5';
    gujSpan.textContent = chip.gujaratiLabel;

    textWrap.appendChild(labelSpan);
    textWrap.appendChild(gujSpan);

    // Active mirror sparkle container
    const sparkleMount = document.createElement('span');
    sparkleMount.className = 'chip-sparkle-indicator inline-flex items-center ml-0.5' + (idx === 0 ? '' : ' hidden');
    sparkleMount.innerHTML = getAbhlaMirrorSVG(12);

    btn.appendChild(emojiSpan);
    btn.appendChild(textWrap);
    btn.appendChild(sparkleMount);

    btn.addEventListener('click', (e: MouseEvent) => {
      // 1. Trigger Garba Clap Ripple Animation
      spawnClapRipple(btn, e);

      // 2. Update active chip styling
      if (activeChip) {
        activeChip.className = buildChipClass(false);
        activeChip.setAttribute('aria-pressed', 'false');
        const prevSparkle = activeChip.querySelector('.chip-sparkle-indicator');
        if (prevSparkle) prevSparkle.classList.add('hidden');
      }

      btn.className = buildChipClass(true);
      btn.setAttribute('aria-pressed', 'true');
      sparkleMount.classList.remove('hidden');
      activeChip = btn;

      // 3. Update queue and start playback
      const songs = getQueue(chip.value, 'playable-first');
      if (songs.length === 0) {
        console.warn(`[GarbaWave] No playable songs for genre: ${chip.value}`);
        return;
      }
      setQueue(songs, 0);
      setIsPlaying(true);
      player.load(songs[0].youtubeId, true);
    });

    if (idx === 0) {
      activeChip = btn;
    }

    wrap.appendChild(btn);
  });

  container.appendChild(wrap);
}

/**
 * Spawns a radiating "Garba clap" ripple from the click position.
 */
function spawnClapRipple(button: HTMLButtonElement, event: MouseEvent): void {
  const rect = button.getBoundingClientRect();
  const diameter = Math.max(rect.width, rect.height) * 1.6;
  const radius = diameter / 2;

  const ripple = document.createElement('span');
  ripple.className = 'clap-ripple-effect';
  ripple.style.width = `${diameter}px`;
  ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - rect.left - radius}px`;
  ripple.style.top = `${event.clientY - rect.top - radius}px`;

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function buildChipClass(active: boolean): string {
  const base = [
    'relative flex-shrink-0 snap-start',
    'flex items-center gap-2',
    'px-3.5 py-2 rounded-xl text-xs',
    'border transition-all duration-200 whitespace-nowrap overflow-hidden',
    'cursor-pointer select-none font-sans',
    'focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2',
    'bandhani-chip-texture',
  ].join(' ');

  if (active) {
    return [
      base,
      'bg-theme-accent text-white font-bold border-theme-accent',
      'shadow-lg shadow-theme-glow scale-[1.02]',
    ].join(' ');
  }

  return [
    base,
    'bg-surface-card hover:bg-surface-elevated text-theme-primary',
    'border-theme-subtle hover:border-theme-active',
  ].join(' ');
}
