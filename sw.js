/* Unjammed — offline cache. Bump CACHE when you ship a new build. */
const CACHE = 'unjammed-v0.2.0';

self.addEventListener('install', e => {
  // Pre-cache the shell; hashed JS/CSS are cached on first fetch below.
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(['./', './manifest.webmanifest', './icon-192.png', './icon-512.png']))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./')))
  );
});
