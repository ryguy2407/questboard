// ============================================================
// SERVICE WORKER — Quest Board
// Auto-updates when new files are deployed to GitHub Pages
// ============================================================

// Bump this version string whenever you deploy.
// The app does this automatically via version.json — you don't
// need to edit this file manually.
const CACHE_NAME = 'questboard-v1';

// data.json is intentionally excluded — always fetched live from GitHub API
// version.json is excluded — always fetched network-first for update detection
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/avatar.js',
  '/icons.js',
  '/storage.js',
  '/style.css',
  '/sw.js',
  '/version.js',
];

// ---- Install: cache all app files ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ---- Activate: delete old caches ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ---- Fetch: network-first for version.json, cache-first for everything else ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache: GitHub API calls, version.json, or data.json
  // These must always be fetched live
  const isGitHubApi = url.hostname === 'api.github.com';
  const isVersionFile = url.pathname.endsWith('version.json');
  const isDataFile = url.pathname.endsWith('data.json');

  if (isGitHubApi || isVersionFile || isDataFile) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For everything else: try cache first, fall back to network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses for app files
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ---- Message: force reload all clients ----
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
