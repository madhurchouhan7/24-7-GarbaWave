// service-worker.js — Day 2 placeholder
// This file will be populated on Day 2 with shell caching logic.
// It intentionally does NOT intercept YouTube media requests.

self.addEventListener('install', (event) => {
  console.log('[GarbaWave SW] Install — Day 2 shell caching TBD');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[GarbaWave SW] Activate');
  self.clients.claim();
});

// No fetch interception in this placeholder — Day 2 will add cache-first
// strategy for app shell (HTML/CSS/JS/icons) only.
