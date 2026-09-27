import { getState, subscribe } from '../state';

export interface PersonalStatsData {
  totalHoursDanced: number;
  favoriteArtist: string;
  highestBpmSession: number;
  favoriteNight: string;
  totalTracksPlayed: number;
  longestSession: number;
  
  // internal trackers
  artistCounts: Record<string, number>;
  nightMinutes: Record<string, number>;
}

const STORAGE_KEY = 'gw-personal-stats';

function getStoredStats(): PersonalStatsData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse personal stats', e);
  }
  
  return {
    totalHoursDanced: 0,
    favoriteArtist: 'None',
    highestBpmSession: 0,
    favoriteNight: 'None',
    totalTracksPlayed: 0,
    longestSession: 0,
    artistCounts: {},
    nightMinutes: {}
  };
}

function saveStats(stats: PersonalStatsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save personal stats', e);
  }
}

let sessionStart: number | null = null;
let currentSessionMinutes = 0;
let lastTrackId: string | null = null;
let secondsAccumulated = 0;

export function initPersonalStats(): void {
  // Track playing time and session
  setInterval(() => {
    const state = getState();
    if (state.isPlaying) {
      if (!sessionStart) sessionStart = Date.now();
      
      secondsAccumulated++;
      if (secondsAccumulated >= 60) {
        secondsAccumulated = 0;
        currentSessionMinutes++;
        
        const stats = getStoredStats();
        stats.totalHoursDanced += (1 / 60);
        
        if (currentSessionMinutes > stats.longestSession) {
          stats.longestSession = currentSessionMinutes;
        }
        
        // Track night minutes
        const night = `Night ${(new Date().getDate() % 9) || 9}`;
        stats.nightMinutes[night] = (stats.nightMinutes[night] || 0) + 1;
        
        // Compute favorite night
        let maxMinutes = 0;
        let favNight = 'None';
        for (const [n, mins] of Object.entries(stats.nightMinutes)) {
          if (mins > maxMinutes) {
            maxMinutes = mins;
            favNight = n;
          }
        }
        stats.favoriteNight = favNight;
        
        saveStats(stats);
      }
    } else {
      if (sessionStart) {
        sessionStart = null;
        currentSessionMinutes = 0;
      }
    }
  }, 1000);
  
  // Track track changes
  subscribe('currentTrack', (state) => {
    if (state.currentTrack && state.currentTrack.id !== lastTrackId) {
      lastTrackId = state.currentTrack.id;
      const stats = getStoredStats();
      
      stats.totalTracksPlayed++;
      
      // We don't have BPM in Song type from what we saw, but if it exists:
      const bpm = (state.currentTrack as any).bpm || 0;
      if (bpm > stats.highestBpmSession) {
        stats.highestBpmSession = bpm;
      }
      
      const artist = state.currentTrack.artist || 'Unknown';
      stats.artistCounts[artist] = (stats.artistCounts[artist] || 0) + 1;
      
      let maxPlays = 0;
      let favArtist = 'None';
      for (const [art, plays] of Object.entries(stats.artistCounts)) {
        if (plays > maxPlays) {
          maxPlays = plays;
          favArtist = art;
        }
      }
      stats.favoriteArtist = favArtist;
      
      saveStats(stats);
    }
  });
}

export function getPersonalStats(): PersonalStatsData {
  return getStoredStats();
}

export function mountStatsPill(el: HTMLElement): void {
  const pill = document.createElement('button');
  pill.className = 'flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-card border border-theme-subtle rounded-full text-sm font-medium text-theme-primary transition-colors shadow-sm';
  
  const stats = getStoredStats();
  const hrs = stats.totalHoursDanced.toFixed(1);
  pill.textContent = `⏱ ${hrs} hrs danced this Navratri`;
  
  pill.onclick = openPersonalStatsModal;
  
  el.appendChild(pill);
}

export function openPersonalStatsModal(): void {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'bg-surface-base rounded-2xl p-6 w-full max-w-2xl border border-theme-subtle shadow-2xl relative flex flex-col items-center';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'absolute top-4 right-4 text-theme-muted hover:text-theme-primary text-xl';
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => modalOverlay.remove();
  modalContent.appendChild(closeBtn);
  
  const title = document.createElement('h2');
  title.className = 'text-2xl font-display font-bold text-theme-primary mb-6';
  title.textContent = '💃 Your Garba Stats';
  modalContent.appendChild(title);
  
  const stats = getStoredStats();
  
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8';
  
  const cards = [
    { label: 'Hours Danced', value: `${stats.totalHoursDanced.toFixed(1)} hrs`, icon: '⏱' },
    { label: 'Tracks Played', value: String(stats.totalTracksPlayed), icon: '🎵' },
    { label: 'Peak BPM', value: String(stats.highestBpmSession || '-'), icon: '⚡' },
    { label: 'Longest Session', value: `${stats.longestSession} min`, icon: '🏆' },
    { label: 'Favourite Artist', value: stats.favoriteArtist, icon: '🎤' },
    { label: 'Best Night', value: stats.favoriteNight, icon: '🌙' },
  ];
  
  cards.forEach(c => {
    const card = document.createElement('div');
    card.className = 'bg-surface-elevated rounded-2xl p-4 flex flex-col items-center text-center border border-theme-subtle';
    
    const icon = document.createElement('div');
    icon.className = 'text-2xl mb-2';
    icon.textContent = c.icon;
    
    const val = document.createElement('div');
    val.className = 'font-display text-xl font-bold text-theme-primary mb-1 truncate w-full';
    val.textContent = c.value;
    
    const lbl = document.createElement('div');
    lbl.className = 'text-xs text-theme-secondary font-sans uppercase tracking-wider';
    lbl.textContent = c.label;
    
    card.appendChild(icon);
    card.appendChild(val);
    card.appendChild(lbl);
    grid.appendChild(card);
  });
  
  modalContent.appendChild(grid);
  
  const btnRow = document.createElement('div');
  btnRow.className = 'flex gap-4 w-full justify-center';
  
  const shareBtn = document.createElement('button');
  shareBtn.className = 'bg-theme-accent text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all';
  shareBtn.textContent = 'Share Stats';
  shareBtn.onclick = () => {
    const text = `My GarbaWave Navratri Stats 💃 ${stats.totalHoursDanced.toFixed(1)} hrs danced, ${stats.totalTracksPlayed} tracks, peak ${stats.highestBpmSession} BPM! #GarbaWave`;
    if (navigator.share) {
      navigator.share({ title: 'My Garba Stats', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      shareBtn.textContent = 'Copied!';
      setTimeout(() => shareBtn.textContent = 'Share Stats', 2000);
    }
  };
  
  const resetBtn = document.createElement('button');
  resetBtn.className = 'bg-transparent text-theme-muted font-bold py-2.5 px-6 rounded-xl hover:text-red-500 transition-colors border border-theme-subtle hover:border-red-500/50';
  resetBtn.textContent = 'Reset Stats';
  resetBtn.onclick = () => {
    if (confirm('Are you sure you want to reset all your stats?')) {
      localStorage.removeItem(STORAGE_KEY);
      modalOverlay.remove();
      // Optional: openPersonalStatsModal() again or just close
    }
  };
  
  btnRow.appendChild(shareBtn);
  btnRow.appendChild(resetBtn);
  modalContent.appendChild(btnRow);
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}
