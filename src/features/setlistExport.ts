import { getState } from '../state';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function exportSetlist(): string {
  const state = getState();
  const queue = state.queue;

  if (!queue || queue.length === 0) {
    return 'Your GarbaWave setlist is empty!';
  }

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  let text = `🎵 My GarbaWave Setlist — Navratri ${new Date().getFullYear()}\nNight: ${dateStr}\n\n`;

  let totalSecs = 0;

  queue.forEach((song, i) => {
    const dur = song.durationSeconds ?? 0;
    totalSecs += dur;
    const durStr = formatDuration(dur);
    const bpm = song.bpm ? ` ⚡${song.bpm} BPM` : '';
    text += `${i + 1}. ${song.title} — ${song.artist} (${durStr})${bpm}\n`;
  });

  const hours = (totalSecs / 3600).toFixed(1);
  text += `\nTotal: ${queue.length} songs, ${hours} hours\n\nPlayed on GarbaWave 🪔 garbawave.app`;

  return text;
}


export function openExportModal(): void {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4';
  
  const modal = document.createElement('div');
  modal.className = 'bg-surface-base w-full max-w-md rounded-2xl p-6 border border-theme-subtle flex flex-col gap-4 font-sans';
  
  const title = document.createElement('h2');
  title.className = 'text-xl font-display text-theme-primary';
  title.textContent = '📤 Export Setlist';
  
  const setlistText = exportSetlist();
  
  const textArea = document.createElement('textarea');
  textArea.className = 'w-full h-48 bg-surface-elevated border border-theme-subtle rounded-lg p-3 text-sm text-theme-secondary font-mono resize-none outline-none';
  textArea.readOnly = true;
  textArea.value = setlistText;
  
  const actionsRow = document.createElement('div');
  actionsRow.className = 'flex flex-wrap gap-2';
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'flex-1 bg-surface-elevated border border-theme-subtle py-2 rounded-lg text-theme-primary text-sm min-w-[100px]';
  copyBtn.textContent = 'Copy Text';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(setlistText).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy Text', 2000);
    });
  };
  
  const waBtn = document.createElement('button');
  waBtn.className = 'flex-1 bg-[#25D366] text-white py-2 rounded-lg text-sm font-medium min-w-[140px]';
  waBtn.textContent = 'Share via WhatsApp';
  waBtn.onclick = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(setlistText)}`, '_blank');
  };
  
  const dlBtn = document.createElement('button');
  dlBtn.className = 'w-full bg-theme-accent text-white py-2 rounded-lg text-sm font-medium mt-2';
  dlBtn.textContent = 'Download .txt';
  dlBtn.onclick = () => {
    const blob = new Blob([setlistText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GarbaWave-Setlist.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  actionsRow.appendChild(copyBtn);
  actionsRow.appendChild(waBtn);
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'mt-2 px-4 py-2 text-theme-secondary text-sm';
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => document.body.removeChild(overlay);
  
  modal.appendChild(title);
  modal.appendChild(textArea);
  modal.appendChild(actionsRow);
  modal.appendChild(dlBtn);
  modal.appendChild(closeBtn);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
