import { subscribe } from '../state';

// ─── Constants & Types ────────────────────────────────────────────────────────

const STORAGE_KEY = 'gw-night-diary';

export interface NightDiaryEntry {
  night: number;
  date: string;
  tracksPlayed: string[];
  totalMinutes: number;
  peakBpm: number;
}

const GODDESSES = [
  'Shailaputri',
  'Brahmacharini',
  'Chandraghanta',
  'Kushmanda',
  'Skandamata',
  'Katyayani',
  'Kalaratri',
  'Mahagauri',
  'Siddhidatri'
];

const COLORS = [
  'bg-red-500/10 border-red-500/30',
  'bg-blue-500/10 border-blue-500/30',
  'bg-yellow-500/10 border-yellow-500/30',
  'bg-green-500/10 border-green-500/30',
  'bg-gray-500/10 border-gray-500/30',
  'bg-orange-500/10 border-orange-500/30',
  'bg-white/10 border-white/30',
  'bg-pink-500/10 border-pink-500/30',
  'bg-purple-500/10 border-purple-500/30'
];

let currentNightData: NightDiaryEntry | null = null;
let lastUpdateMs = Date.now();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadDiary(): NightDiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveDiary(diary: NightDiaryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diary));
  } catch {}
}

// ─── Exported Functions ───────────────────────────────────────────────────────

export function initNightDiary(): void {
  const today = getTodayString();
  const diary = loadDiary();
  
  // Find or create today's entry (max 9 nights)
  const existingIndex = diary.findIndex(d => d.date === today);
  if (existingIndex >= 0) {
    currentNightData = diary[existingIndex];
  } else if (diary.length < 9) {
    currentNightData = {
      night: diary.length + 1,
      date: today,
      tracksPlayed: [],
      totalMinutes: 0,
      peakBpm: 0
    };
    diary.push(currentNightData);
    saveDiary(diary);
  }
  
  subscribe('currentTrack', (state) => {
    if (!currentNightData || !state.currentTrack) return;
    
    // Add track if new
    if (!currentNightData.tracksPlayed.includes(state.currentTrack.id)) {
      currentNightData.tracksPlayed.push(state.currentTrack.id);
    }
    
    // Update peak BPM
    const bpm = state.currentTrack.bpm || 0;
    if (bpm > currentNightData.peakBpm) {
      currentNightData.peakBpm = bpm;
    }
    
    // Save
    const all = loadDiary();
    const idx = all.findIndex(d => d.date === currentNightData!.date);
    if (idx >= 0) {
      all[idx] = currentNightData;
      saveDiary(all);
    }
  });
  
  subscribe('progress', (state) => {
    if (!currentNightData || !state.isPlaying) return;
    
    const now = Date.now();
    const diffMs = now - lastUpdateMs;
    lastUpdateMs = now;
    
    if (diffMs > 0 && diffMs < 5000) {
      currentNightData.totalMinutes += diffMs / 1000 / 60;
      // Throttling save would be good, but we'll trust the minimal logic for now
      if (Math.random() < 0.05) {
        const all = loadDiary();
        const idx = all.findIndex(d => d.date === currentNightData!.date);
        if (idx >= 0) {
          all[idx] = currentNightData;
          saveDiary(all);
        }
      }
    }
  });
  
  subscribe('isPlaying', (state) => {
    if (state.isPlaying) {
      lastUpdateMs = Date.now();
    }
  });
}

export function getNightDiaryEntry(night: number): NightDiaryEntry | undefined {
  return loadDiary().find(d => d.night === night);
}

export function openNightDiaryModal(): void {
  const diary = loadDiary();
  
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-[60] backdrop-blur-xl bg-black/40 flex items-center justify-center p-4';
  
  const panel = document.createElement('div');
  panel.className = 'relative w-full max-w-sm mx-auto rounded-3xl p-6 bg-surface-card border border-theme-subtle shadow-2xl flex flex-col gap-4 text-center';
  
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
  title.textContent = 'Navratri Night Diary';
  title.className = 'font-display text-xl text-theme-primary';
  
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-3 gap-2';
  
  for (let i = 1; i <= 9; i++) {
    const entry = diary.find(d => d.night === i);
    const card = document.createElement('div');
    const colorClass = COLORS[i-1] || 'bg-surface-elevated';
    
    if (entry) {
      card.className = `flex flex-col items-center justify-center p-2 rounded-xl border ${colorClass}`;
      
      const nightLabel = document.createElement('div');
      nightLabel.textContent = `N${i}`;
      nightLabel.className = 'font-bold text-sm text-theme-primary';
      
      const goddess = document.createElement('div');
      goddess.textContent = GODDESSES[i-1];
      goddess.className = 'text-[9px] text-theme-secondary mb-1';
      
      const stats = document.createElement('div');
      stats.textContent = `${entry.tracksPlayed.length} trk`;
      stats.className = 'text-[10px] text-theme-muted';
      
      card.appendChild(nightLabel);
      card.appendChild(goddess);
      card.appendChild(stats);
    } else {
      card.className = 'flex flex-col items-center justify-center p-2 rounded-xl border border-theme-subtle bg-surface-base opacity-50 grayscale';
      
      const nightLabel = document.createElement('div');
      nightLabel.textContent = `N${i}`;
      nightLabel.className = 'font-bold text-sm text-theme-muted';
      
      card.appendChild(nightLabel);
    }
    
    grid.appendChild(card);
  }
  
  const shareBtn = document.createElement('button');
  shareBtn.textContent = 'Share My Navratri Journey';
  shareBtn.className = 'mt-2 py-2 px-4 rounded-full bg-theme-accent text-white font-medium hover:bg-theme-accent/90 transition-colors shadow-lg shadow-theme-accent/20';
  shareBtn.onclick = () => {
    const summary = `I've danced ${diary.length}/9 nights of Navratri on GarbaWave! 🌸✨`;
    navigator.clipboard.writeText(summary).then(() => {
      shareBtn.textContent = '✓ Copied!';
      setTimeout(() => { shareBtn.textContent = 'Share My Navratri Journey'; }, 2000);
    });
  };
  
  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(grid);
  panel.appendChild(shareBtn);
  backdrop.appendChild(panel);
  
  document.body.appendChild(backdrop);
}
