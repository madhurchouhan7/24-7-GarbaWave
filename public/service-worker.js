/**
 * service-worker.js — GarbaWave PWA Shell Caching Service Worker.
 *
 * Compliance Note (docs/04-safety-security.md):
 *  - Caches only the static app shell (HTML, CSS, JS, fonts, icons, manifest).
 *  - STRICTLY DOES NOT intercept or cache YouTube audio/video streaming requests.
 */

const CACHE_NAME = 'garbawave-shell-v2';
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/explore/',
  '/explore/index.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[GarbaWave SW] Pre-caching static app shell');
      return cache.addAll(APP_SHELL_ASSETS).catch((err) => {
        console.warn('[GarbaWave SW] Pre-cache partial fail:', err);
      });
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[GarbaWave SW] Removing outdated cache:', key);
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NEVER intercept YouTube iframe, audio, or video streams (YouTube ToS requirement)
  if (
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('youtube-nocookie.com') ||
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('ytimg.com')
  ) {
    return;
  }

  // Cache-first for static assets, scripts, stylesheets, fonts
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'font' ||
    event.request.destination === 'image' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      }),
    );
    return;
  }

  // Network-first for HTML pages with offline cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('/index.html')),
      ),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CURRENT_SET') {
    const urls = Array.isArray(event.data.urls) ? event.data.urls : [];
    caches.open(CACHE_NAME).then((cache) => {
      urls.forEach((u) => {
        fetch(u)
          .then((res) => {
            if (res.status === 200) cache.put(u, res);
          })
          .catch(() => {});
      });
    });
  }
});

