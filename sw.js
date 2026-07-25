const CACHE = 'dueto-v2';
const CORE = ['./', './index.html', './songs.json', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    try {
      const songs = await (await fetch('./songs.json')).json();
      await cache.addAll(songs);
    } catch (e) { /* offline on first install, nothing to precache yet */ }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      cache.put(event.request, response.clone());
      return response;
    } catch (e) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      throw e;
    }
  })());
});
