import { subscribe } from '../state';

// ─── Constants & Types ────────────────────────────────────────────────────────

const STORAGE_KEY = 'gw-passport';

interface PassportState {
  Kutchi: boolean;
  Kathiawadi: boolean;
  Ahmedabadi: boolean;
  Saurashtra: boolean;
  Fusion: boolean;
}

type RegionStyle = keyof PassportState;

const REGIONS: { id: RegionStyle; name: string; emoji: string; desc: string }[] = [
  { id: 'Kutchi', name: 'Kutchi', emoji: '🏔️', desc: 'Desert vibes and rapid Dhol beats' },
  { id: 'Kathiawadi', name: 'Kathiawadi', emoji: '🌾', desc: 'Folkloric and deeply traditional' },
  { id: 'Ahmedabadi', name: 'Ahmedabadi', emoji: '🏙️', desc: 'Modern urban Garba styles' },
  { id: 'Saurashtra', name: 'Saurashtra', emoji: '⚓', desc: 'Coastal energetic rhythms' },
  { id: 'Fusion', name: 'Fusion', emoji: '🎨', desc: 'Electronic and modern blends' }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadPassport(): PassportState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { Kutchi: false, Kathiawadi: false, Ahmedabadi: false, Saurashtra: false, Fusion: false };
}

function savePassport(p: PassportState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export function initPassport(): void {
  subscribe('currentTrack', (state) => {
    if (!state.currentTrack || !state.currentTrack.regionalStyle) return;

    const regionName = state.currentTrack.regionalStyle as RegionStyle;

    const p = loadPassport();
    if (Object.prototype.hasOwnProperty.call(p, regionName) && !p[regionName]) {
      p[regionName] = true;
      savePassport(p);
    }
  });
}


export function mountPassportBadge(el: HTMLElement): void {
  const p = loadPassport();
  
  el.className = 'flex items-center gap-1 cursor-pointer';
  el.innerHTML = '';
  
  REGIONS.forEach(r => {
    const unlocked = p[r.id];
    const badge = document.createElement('div');
    badge.className = `w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-colors ${unlocked ? 'bg-theme-gold text-white border-theme-gold' : 'bg-surface-base text-theme-muted border-theme-subtle opacity-50'}`;
    badge.textContent = unlocked ? '✓' : r.name.charAt(0);
    el.appendChild(badge);
  });
  
  el.onclick = () => openPassportModal();
}

export function openPassportModal(): void {
  const p = loadPassport();
  
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-[60] backdrop-blur-xl bg-black/40 flex items-center justify-center p-4';
  
  const panel = document.createElement('div');
  panel.className = 'relative w-full max-w-sm mx-auto rounded-3xl p-6 bg-surface-card border border-theme-subtle shadow-2xl flex flex-col gap-4';
  
  const closeModal = () => {
    if (backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
  };
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.className = 'absolute top-4 right-4 text-theme-muted hover:text-theme-primary';
  closeBtn.onclick = closeModal;
  backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };
  
  const title = document.createElement('h2');
  title.textContent = '🗺️ Your Garba Passport';
  title.className = 'font-display text-xl text-theme-primary text-center';
  
  const grid = document.createElement('div');
  grid.className = 'flex flex-col gap-2';
  
  let unlockedCount = 0;
  
  REGIONS.forEach(r => {
    const unlocked = p[r.id];
    if (unlocked) unlockedCount++;
    
    const card = document.createElement('div');
    card.className = `p-3 rounded-xl border flex items-center gap-3 ${unlocked ? 'bg-surface-elevated border-theme-gold/50 shadow-[0_0_10px_rgba(255,215,0,0.1)] relative overflow-hidden' : 'bg-surface-base border-theme-subtle opacity-60'}`;
    
    // Shimmer effect
    if (unlocked) {
      const shimmer = document.createElement('div');
      shimmer.className = 'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]';
      card.appendChild(shimmer);
    }
    
    const icon = document.createElement('div');
    icon.textContent = r.emoji;
    icon.className = 'text-2xl z-10';
    
    const info = document.createElement('div');
    info.className = 'flex-1 z-10';
    
    const nameLabel = document.createElement('div');
    nameLabel.textContent = r.name;
    nameLabel.className = `font-bold text-sm ${unlocked ? 'text-theme-gold' : 'text-theme-primary'}`;
    
    const descLabel = document.createElement('div');
    descLabel.textContent = r.desc;
    descLabel.className = 'text-xs text-theme-secondary truncate';
    
    info.appendChild(nameLabel);
    info.appendChild(descLabel);
    
    const status = document.createElement('div');
    status.className = 'z-10';
    if (unlocked) {
      status.textContent = '✓ Unlocked';
      status.className += ' text-[10px] text-theme-gold font-bold px-2 py-1 rounded bg-theme-gold/10';
    } else {
      status.textContent = '🔒 Locked';
      status.className += ' text-[10px] text-theme-muted px-2 py-1 rounded bg-surface-base border border-theme-subtle';
    }
    
    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(status);
    
    grid.appendChild(card);
  });
  
  const progressBox = document.createElement('div');
  progressBox.className = 'mt-2 text-center text-sm font-medium text-theme-primary';
  progressBox.textContent = `${unlockedCount}/5 regions explored`;
  
  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(grid);
  panel.appendChild(progressBox);
  backdrop.appendChild(panel);
  
  document.body.appendChild(backdrop);
}
