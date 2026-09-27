/**
 * features/requestSong.ts — Community Song Request & Submission Modal.
 *
 * Allows dancers and organizers to suggest missing Garba/Raas YouTube tracks.
 * Stored locally and formatted for easy inclusion into catalogue.json.
 */

export interface SongRequest {
  id: string;
  title: string;
  artist: string;
  youtubeUrl: string;
  genre: string;
  notes?: string;
  timestamp: number;
}

const STORAGE_KEY = 'garbawave_song_requests';

export function openRequestSongModal(): void {
  const existing = document.getElementById('gw-request-song-modal');
  if (existing) {
    existing.classList.remove('hidden');
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'gw-request-song-modal';
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-label', 'Request a Garba Track');

  const card = document.createElement('div');
  card.className = [
    'w-full max-w-md rounded-3xl p-6',
    'bg-surface-card border border-theme-subtle shadow-2xl space-y-4',
  ].join(' ');

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between border-b border-theme-subtle pb-3';
  header.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-2xl">🎵</span>
      <div>
        <h3 class="font-display font-bold text-base text-theme-primary leading-tight">Request a Garba Track</h3>
        <p class="text-xs text-theme-secondary mt-0.5">Suggest missing classic or live Mandli anthems</p>
      </div>
    </div>
  `;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'w-8 h-8 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-primary bg-surface-elevated text-sm';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => backdrop.classList.add('hidden'));
  header.appendChild(closeBtn);

  // Form Body
  const form = document.createElement('form');
  form.className = 'space-y-3';
  form.innerHTML = `
    <div>
      <label class="block text-xs font-semibold text-theme-primary mb-1">Song / Track Title *</label>
      <input
        type="text"
        name="title"
        required
        placeholder="e.g. Mogar Dev No Garbo / Pari Hoon Main"
        class="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-theme-subtle text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
      />
    </div>

    <div>
      <label class="block text-xs font-semibold text-theme-primary mb-1">Artist / Singer *</label>
      <input
        type="text"
        name="artist"
        required
        placeholder="e.g. Atul Purohit / Falguni Pathak / Kirtidan Gadhvi"
        class="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-theme-subtle text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
      />
    </div>

    <div>
      <label class="block text-xs font-semibold text-theme-primary mb-1">YouTube Link or Video ID *</label>
      <input
        type="text"
        name="youtubeUrl"
        required
        placeholder="https://youtube.com/watch?v=... or YouTube ID"
        class="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-theme-subtle text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
      />
    </div>

    <div>
      <label class="block text-xs font-semibold text-theme-primary mb-1">Genre Category</label>
      <select
        name="genre"
        class="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-theme-subtle text-theme-primary text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
      >
        <option value="Traditional">Traditional Garba</option>
        <option value="Dandiya">Dandiya Raas</option>
        <option value="Devotional">Devotional / Aarti</option>
        <option value="Folk">Gujarati Folk</option>
        <option value="Sanedo">Sanedo</option>
        <option value="Fusion">Urban / Bollywood Fusion</option>
      </select>
    </div>

    <button
      type="submit"
      class="w-full mt-2 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-theme-accent hover:opacity-90 active:scale-95 shadow-lg shadow-theme-glow transition-all cursor-pointer"
    >
      Submit Song Suggestion
    </button>
  `;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const req: SongRequest = {
      id: `req-${Date.now()}`,
      title: String(formData.get('title') || '').trim(),
      artist: String(formData.get('artist') || '').trim(),
      youtubeUrl: String(formData.get('youtubeUrl') || '').trim(),
      genre: String(formData.get('genre') || 'Traditional'),
      timestamp: Date.now(),
    };

    saveSongRequest(req);
    backdrop.classList.add('hidden');
    form.reset();
    showToast(`🪔 Thank you! "${req.title}" submitted to community review queue.`);
  });

  card.appendChild(header);
  card.appendChild(form);
  backdrop.appendChild(card);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.add('hidden');
  });

  document.body.appendChild(backdrop);
}

function saveSongRequest(req: SongRequest): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push(req);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Storage quota
  }
}

function showToast(msg: string): void {
  const toast = document.createElement('div');
  toast.className = 'fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-theme-active text-theme-primary shadow-xl';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
