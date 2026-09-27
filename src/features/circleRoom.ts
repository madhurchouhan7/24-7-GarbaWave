// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY_CODE = 'gw-room-code';

// ─── Exported Functions ───────────────────────────────────────────────────────

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  try {
    localStorage.setItem(STORAGE_KEY_CODE, code);
  } catch {}
  return code;
}

export function getRoomCode(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_CODE);
    if (existing) return existing;
  } catch {}
  return generateRoomCode();
}

export function openCircleRoomModal(): void {
  const code = getRoomCode();
  const url = `${window.location.origin}?circle=${code}`;
  
  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-[60] backdrop-blur-xl bg-black/40 flex items-center justify-center p-4';
  
  // Modal panel
  const panel = document.createElement('div');
  panel.className = 'relative w-full max-w-sm mx-auto rounded-3xl p-6 bg-surface-card border border-theme-subtle shadow-2xl flex flex-col gap-4 text-center';
  
  // Close handler
  const closeModal = () => {
    if (backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
  };
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.className = 'absolute top-4 right-4 text-theme-muted hover:text-theme-primary';
  closeBtn.onclick = closeModal;
  backdrop.onclick = (e) => { if (e.target === backdrop) closeModal(); };
  
  // Title
  const title = document.createElement('h2');
  title.textContent = 'Garba Circle';
  title.className = 'font-display text-xl text-theme-primary';
  
  const note = document.createElement('p');
  note.textContent = 'Share this code with friends to sync your Garba circle';
  note.className = 'text-sm text-theme-secondary';
  
  // Room code display
  const codeBox = document.createElement('div');
  codeBox.textContent = code;
  codeBox.className = 'font-display text-4xl font-bold tracking-[0.2em] text-theme-accent bg-surface-elevated py-4 rounded-xl border border-theme-subtle';
  
  // QR fallback display
  const qrFallback = document.createElement('div');
  qrFallback.textContent = url;
  qrFallback.className = 'text-[10px] break-all p-3 bg-white text-black font-mono rounded-lg border-2 border-theme-subtle max-h-24 overflow-hidden';
  
  // Action buttons
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy Link';
  copyBtn.className = 'py-2 px-4 rounded-full bg-surface-elevated text-theme-primary font-medium border border-theme-subtle hover:bg-surface-base transition-colors';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(url).then(() => {
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy Link'; }, 2000);
    });
  };
  
  const shareBtn = document.createElement('a');
  shareBtn.textContent = 'Share via WhatsApp';
  shareBtn.href = `https://wa.me/?text=${encodeURIComponent(`Join my Garba circle tonight! ${url}`)}`;
  shareBtn.target = '_blank';
  shareBtn.className = 'py-2 px-4 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors inline-block';
  
  // Assemble
  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(note);
  panel.appendChild(codeBox);
  panel.appendChild(qrFallback);
  panel.appendChild(copyBtn);
  panel.appendChild(shareBtn);
  backdrop.appendChild(panel);
  
  document.body.appendChild(backdrop);
}
