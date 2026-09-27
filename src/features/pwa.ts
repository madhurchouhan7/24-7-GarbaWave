/**
 * features/pwa.ts — PWA Service Worker Registration & Install Prompt.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function initPWA(): void {
  // Register Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('[GarbaWave PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[GarbaWave PWA] Service Worker registration failed:', err);
        });
    });
  }

  // Handle Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    showInstallBanner();
  });
}

function showInstallBanner(): void {
  if (document.getElementById('gw-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'gw-install-banner';
  banner.className = [
    'fixed bottom-24 right-4 left-4 sm:left-auto sm:w-80 z-40 p-3 rounded-2xl',
    'bg-surface-card border border-theme-active shadow-2xl backdrop-blur-md',
    'flex items-center justify-between gap-3 text-xs',
  ].join(' ');

  banner.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-xl">🪔</span>
      <div>
        <p class="font-display font-bold text-theme-primary">Install GarbaWave App</p>
        <p class="text-[11px] text-theme-secondary">Quick 1-tap launch & offline shell</p>
      </div>
    </div>
    <div class="flex items-center gap-1.5 flex-shrink-0">
      <button id="gw-install-dismiss-btn" class="p-1 text-theme-muted hover:text-theme-primary text-xs">✕</button>
      <button id="gw-install-action-btn" class="px-3 py-1.5 rounded-xl font-bold bg-theme-accent text-white shadow-md">Install</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('gw-install-dismiss-btn')?.addEventListener('click', () => {
    banner.remove();
  });

  document.getElementById('gw-install-action-btn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('[GarbaWave PWA] App installed successfully');
      }
      deferredPrompt = null;
      banner.remove();
    }
  });
}
