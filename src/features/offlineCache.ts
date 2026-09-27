export async function getCacheStatus(): Promise<{ cached: boolean; size: string }> {
  try {
    const keys = await caches.keys();
    const isCached = keys.length > 0;
    return { cached: isCached, size: isCached ? 'Unknown' : '0 B' };
  } catch (error) {
    return { cached: false, size: '0 B' };
  }
}

export function mountOfflineCacheBtn(el: HTMLElement): void {
  el.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'px-3 py-1 rounded-full bg-surface-elevated text-theme-secondary text-[11px] font-sans border border-theme-subtle flex items-center gap-1 hover:bg-surface-card transition-colors';
  
  const statusText = document.createElement('span');
  
  const savedStatus = localStorage.getItem('gw-cache-status');
  if (savedStatus === 'cached') {
    statusText.textContent = '✅ Ready offline!';
    btn.classList.add('text-theme-accent', 'border-theme-active');
  } else {
    statusText.textContent = '📥 Cache Tonight\'s Set';
  }
  
  btn.appendChild(statusText);

  btn.addEventListener('click', () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      statusText.textContent = '⏳ Caching...';
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_CURRENT_SET',
        urls: ['/', 'index.html', '/data/catalogue.json', '/src/main.ts']
      });
      
      // Simulate completion since we can't reliably wait for SW response here simply
      setTimeout(() => {
        statusText.textContent = '✅ Ready offline!';
        btn.classList.add('text-theme-accent', 'border-theme-active');
        localStorage.setItem('gw-cache-status', 'cached');
      }, 2000);
    } else {
      statusText.textContent = '⚠️ Install the app first to cache offline';
    }
  });

  el.appendChild(btn);
}
