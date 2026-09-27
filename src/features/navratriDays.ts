/**
 * features/navratriDays.ts — Navratri 9-Day Calendar & Daily Sacred Color Awareness (Features v2 §2).
 *
 * Each night of Navratri celebrates a distinct form of the Divine Mother (Navadurga)
 * with a sacred traditional color, energy, and musical tempo:
 *  - Day 1: Yellow (Shailaputri) — Joy, optimism, Aarti start
 *  - Day 2: Green (Brahmacharini) — Growth, peace, traditional 2-taali
 *  - Day 3: Grey/Silver (Chandraghanta) — Courage, folk classics
 *  - Day 4: Orange (Kushmanda) — Warmth, vibrant Dandiya
 *  - Day 5: White (Skandamata) — Purity, devotional grace
 *  - Day 6: Red (Katyayani) — Passion, high-energy Tahukar
 *  - Day 7: Royal Blue (Kalaratri) — Power, fast Raas
 *  - Day 8: Pink (Mahagauri) — Compassion, Sanedo & celebration
 *  - Day 9: Purple (Siddhidatri) — Spiritual completion, peak nonstop
 */

import type { NavratriDayInfo, Song } from '../types';
import { setQueue, setIsPlaying } from '../state';
import { player } from '../player';

export const NAVRATRI_DAYS: NavratriDayInfo[] = [
  {
    dayNumber: 1,
    title: 'Pratipada (પડવો)',
    goddess: 'Maa Shailaputri',
    colorName: 'Yellow (પીળો)',
    colorHex: '#fbc02d',
    significance: 'Ghatasthapana & Aarti start • Energy of new beginnings',
    recommendedGenres: ['Devotional', 'Traditional'],
  },
  {
    dayNumber: 2,
    title: 'Dwitiya (બીજ)',
    goddess: 'Maa Brahmacharini',
    colorName: 'Green (લીલો)',
    colorHex: '#388e3c',
    significance: 'Penance & devotion • Graceful 2-Taali circles',
    recommendedGenres: ['Traditional', 'Folk'],
  },
  {
    dayNumber: 3,
    title: 'Tritiya (ત્રીજ)',
    goddess: 'Maa Chandraghanta',
    colorName: 'Grey (ગ્રે)',
    colorHex: '#78909c',
    significance: 'Courage & strength • Deep cultural folk rhythms',
    recommendedGenres: ['Folk', 'Traditional'],
  },
  {
    dayNumber: 4,
    title: 'Chaturthi (ચોથ)',
    goddess: 'Maa Kushmanda',
    colorName: 'Orange (કેસરી)',
    colorHex: '#f57c00',
    significance: 'Cosmic light & warmth • Spirited Dandiya clacks',
    recommendedGenres: ['Dandiya', 'Traditional'],
  },
  {
    dayNumber: 5,
    title: 'Panchami (પાંચમ)',
    goddess: 'Maa Skandamata',
    colorName: 'White (સફેદ)',
    colorHex: '#ffffff',
    significance: 'Purity & motherhood • Peaceful Devotional melodies',
    recommendedGenres: ['Devotional', 'Folk'],
  },
  {
    dayNumber: 6,
    title: 'Shashthi (છઠ)',
    goddess: 'Maa Katyayani',
    colorName: 'Red (લાલ)',
    colorHex: '#d32f2f',
    significance: 'Valor & warrior energy • Fast 3-Taali Tahukar',
    recommendedGenres: ['Traditional', 'Folk', 'Sanedo'],
  },
  {
    dayNumber: 7,
    title: 'Saptami (સાતમ)',
    goddess: 'Maa Kalaratri',
    colorName: 'Royal Blue (વાદળી)',
    colorHex: '#1976d2',
    significance: 'Fierce protection • Fast-paced Raas & Dandiya',
    recommendedGenres: ['Dandiya', 'Fusion'],
  },
  {
    dayNumber: 8,
    title: 'Ashtami (આઠમ)',
    goddess: 'Maa Mahagauri',
    colorName: 'Pink (ગુલાબી)',
    colorHex: '#e91e63',
    significance: 'Peace & joy • Vibrant Sanedo & festive circles',
    recommendedGenres: ['Sanedo', 'Dandiya'],
  },
  {
    dayNumber: 9,
    title: 'Navami (નોમ)',
    goddess: 'Maa Siddhidatri',
    colorName: 'Purple (જાંબલી)',
    colorHex: '#7b1fa2',
    significance: 'Supreme fulfillment & celebration • Grand Nonstop Finale',
    recommendedGenres: ['Traditional', 'Dandiya', 'Sanedo', 'Fusion'],
  },
];

/**
 * Computes today's Navratri day index (or returns an active day based on date).
 */
export function getTodaysNavratriDay(): NavratriDayInfo {
  const dayOfMonth = new Date().getDate();
  const dayIndex = (dayOfMonth % 9);
  return NAVRATRI_DAYS[dayIndex];
}

/**
 * Mounts the 9-Day Navratri Color Strip & Mood Filter.
 */
export function mountNavratriDayWidget(container: HTMLElement, allSongs: Song[]): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'w-full py-2 px-1';

  const today = getTodaysNavratriDay();

  // Header summary banner
  const banner = document.createElement('div');
  banner.className = [
    'flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl',
    'bg-surface-card border border-theme-subtle mb-3',
  ].join(' ');

  const infoSide = document.createElement('div');
  infoSide.className = 'flex items-center gap-2.5';

  const colorBadge = document.createElement('div');
  colorBadge.className = 'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white shadow-md text-xs';
  colorBadge.style.backgroundColor = today.colorHex;
  colorBadge.textContent = '🪔';

  const textBlock = document.createElement('div');
  textBlock.className = 'flex flex-col';

  const titleRow = document.createElement('div');
  titleRow.className = 'flex items-center gap-2';

  const dayTitle = document.createElement('span');
  dayTitle.className = 'font-display font-bold text-sm text-theme-primary';
  dayTitle.textContent = `Night ${today.dayNumber}: ${today.title}`;

  const colorLabel = document.createElement('span');
  colorLabel.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full text-white';
  colorLabel.style.backgroundColor = today.colorHex === '#ffffff' ? '#333333' : today.colorHex;
  colorLabel.textContent = today.colorName;

  titleRow.appendChild(dayTitle);
  titleRow.appendChild(colorLabel);

  const desc = document.createElement('span');
  desc.className = 'text-[11px] text-theme-secondary font-sans mt-0.5';
  desc.textContent = `${today.goddess} • ${today.significance}`;

  textBlock.appendChild(titleRow);
  textBlock.appendChild(desc);

  infoSide.appendChild(colorBadge);
  infoSide.appendChild(textBlock);

  // Filter button
  const filterBtn = document.createElement('button');
  filterBtn.type = 'button';
  filterBtn.className = [
    'px-3 py-1.5 rounded-xl text-xs font-bold text-white',
    'bg-theme-accent hover:opacity-90 active:scale-95 shadow-md shadow-theme-glow',
    'transition-all duration-200 cursor-pointer flex items-center gap-1 self-start sm:self-auto',
  ].join(' ');
  filterBtn.innerHTML = `<span>▶ Play Night ${today.dayNumber} Set</span>`;

  filterBtn.addEventListener('click', () => {
    const matchingSongs = allSongs.filter((s) =>
      s.playable && s.genre.some((g) => today.recommendedGenres.includes(g)),
    );
    const queue = matchingSongs.length > 0 ? matchingSongs : allSongs.filter((s) => s.playable);
    setQueue(queue, 0);
    setIsPlaying(true);
    if (queue[0]) player.load(queue[0].youtubeId, true);
  });

  banner.appendChild(infoSide);
  banner.appendChild(filterBtn);

  // 9-Day Pill Selector Strip
  const daysStrip = document.createElement('div');
  daysStrip.className = 'flex gap-1.5 overflow-x-auto scrollbar-hide py-1';
  daysStrip.setAttribute('role', 'tablist');
  daysStrip.setAttribute('aria-label', '9 Nights of Navratri');

  NAVRATRI_DAYS.forEach((d) => {
    const isToday = d.dayNumber === today.dayNumber;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = [
      'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium',
      'border transition-all duration-200 cursor-pointer select-none',
      isToday
        ? 'bg-surface-elevated border-theme-active font-bold scale-[1.03] shadow-sm'
        : 'bg-surface-card border-theme-subtle hover:border-theme-active text-theme-secondary',
    ].join(' ');

    const dot = document.createElement('span');
    dot.className = 'w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/20';
    dot.style.backgroundColor = d.colorHex;

    const label = document.createElement('span');
    label.textContent = `N${d.dayNumber}`;

    btn.appendChild(dot);
    btn.appendChild(label);

    btn.title = `Night ${d.dayNumber} (${d.title}): ${d.goddess} — ${d.colorName}`;

    btn.addEventListener('click', () => {
      const matchingSongs = allSongs.filter((s) =>
        s.playable && s.genre.some((g) => d.recommendedGenres.includes(g)),
      );
      const queue = matchingSongs.length > 0 ? matchingSongs : allSongs.filter((s) => s.playable);
      setQueue(queue, 0);
      setIsPlaying(true);
      if (queue[0]) player.load(queue[0].youtubeId, true);
    });

    daysStrip.appendChild(btn);
  });

  wrap.appendChild(banner);
  wrap.appendChild(daysStrip);
  container.appendChild(wrap);
  return wrap;
}
