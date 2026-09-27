const NAVRATRI_DATES = [
  { year: 2024, start: new Date('2024-10-03T00:00:00'), end: new Date('2024-10-12T00:00:00') },
  { year: 2025, start: new Date('2025-09-22T00:00:00'), end: new Date('2025-10-01T00:00:00') },
  { year: 2026, start: new Date('2026-10-13T00:00:00'), end: new Date('2026-10-21T00:00:00') }
];

const COLORS = [
  { hex: '#1a237e', name: 'Royal Blue', goddess: 'Shailaputri' },
  { hex: '#2e7d32', name: 'Green', goddess: 'Brahmacharini' },
  { hex: '#616161', name: 'Grey', goddess: 'Chandraghanta' },
  { hex: '#e65100', name: 'Orange', goddess: 'Kushmanda' },
  { hex: '#f5f5f5', name: 'White', goddess: 'Skandamata' },
  { hex: '#c62828', name: 'Red', goddess: 'Katyayani' },
  { hex: '#1565c0', name: 'Royal Blue', goddess: 'Kalaratri' },
  { hex: '#e91e63', name: 'Pink', goddess: 'Mahagauri' },
  { hex: '#6a1b9a', name: 'Purple', goddess: 'Siddhidatri' }
];

export function getCurrentNavratriNight(): number | null {
  const now = new Date();
  
  for (const range of NAVRATRI_DATES) {
    if (now >= range.start && now <= range.end) {
      const diffTime = Math.abs(now.getTime() - range.start.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return Math.min(Math.max(1, diffDays + 1), 9);
    }
  }
  
  return null;
}

export function getNightColor(night: number): { hex: string; name: string; goddess: string } {
  const index = Math.max(0, Math.min(night - 1, 8));
  return COLORS[index];
}

export function showColorOfNightToast(): void {
  const night = getCurrentNavratriNight();
  if (!night) return;

  const dismissed = sessionStorage.getItem('gw-color-toast-dismissed');
  if (dismissed) return;

  const colorInfo = getNightColor(night);
  
  const toast = document.createElement('div');
  toast.className = 'fixed top-0 left-0 w-full p-4 z-50 flex items-center justify-between shadow-md transition-transform duration-500 transform -translate-y-full';
  toast.style.backgroundColor = `${colorInfo.hex}26`;
  toast.style.backdropFilter = 'blur(8px)';
  toast.style.borderBottom = `2px solid ${colorInfo.hex}`;

  const textContainer = document.createElement('div');
  
  const title = document.createElement('h3');
  title.className = 'font-display font-bold text-theme-primary text-lg';
  title.textContent = `🎨 Tonight is Night ${night} — ${colorInfo.name}`;
  
  const subtitle = document.createElement('p');
  subtitle.className = 'text-sm text-theme-secondary font-sans';
  subtitle.textContent = `Tradition: wear this color to the Garba circle. Goddess ${colorInfo.goddess}.`;
  
  textContainer.appendChild(title);
  textContainer.appendChild(subtitle);
  
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'text-theme-primary font-bold px-3 py-1 rounded bg-black/10 hover:bg-black/20 cursor-pointer';
  dismissBtn.textContent = '✕';
  
  const close = () => {
    toast.style.transform = 'translate-y(-100%)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 500);
    sessionStorage.setItem('gw-color-toast-dismissed', 'true');
  };
  
  dismissBtn.onclick = close;

  toast.appendChild(textContainer);
  toast.appendChild(dismissBtn);

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translate-y(0)';
  });

  setTimeout(() => {
    close();
  }, 8000);
}

export function mountNightColorIndicator(el: HTMLElement): void {
  const night = getCurrentNavratriNight();
  if (!night) {
    el.style.display = 'none';
    return;
  }
  
  const colorInfo = getNightColor(night);
  
  while (el.firstChild) { el.removeChild(el.firstChild); }
  
  const chip = document.createElement('div');
  chip.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-theme-subtle shadow-sm text-xs font-sans text-theme-secondary';
  
  const dot = document.createElement('div');
  dot.className = 'w-3 h-3 rounded-full shadow-sm';
  dot.style.backgroundColor = colorInfo.hex;
  
  const label = document.createElement('span');
  label.textContent = `Night ${night}: ${colorInfo.name}`;
  
  chip.appendChild(dot);
  chip.appendChild(label);
  
  el.appendChild(chip);
}
