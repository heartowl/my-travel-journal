// Cache version must match the script URL used by index.html.
const CACHE = 'travel-journal-v3-10-manual-sync';
const APP_SCRIPT = './app.js?v=manual-sync-20261027-2';
const FILES = ['./', './index.html', APP_SCRIPT, './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(FILES.map(async url => {
        // Refresh the actual versioned script, not a different unversioned URL.
        const response = await fetch(new Request(url, {cache: 'reload'}));
        if (!response.ok) throw new Error('Unable to cache ' + url);
        await cache.put(url, response);
      })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('travel-journal-') && key !== CACHE)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const isAppCode = request.mode === 'navigate' || /\/(?:index\.html|app\.js)$/.test(url.pathname);
    try {
      const response = await fetch(isAppCode ? new Request(request, {cache: 'reload'}) : request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const page = await caches.match('./index.html');
        if (page) return page;
      }
      throw error;
    }
  })());
});
