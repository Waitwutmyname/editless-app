// Offline cache. Bump CACHE when you change any file so phones pick up the update.
// v2 (2026-11-16): 12-key main / 6-key mini rewrite with voice notes.
// v2.1 (2026-11-16): remote sound preview.
// v2.2 (2026-11-16): history list and HISTORY by holding KEEP ALL 2 s; tag keys toggle.
// v2.3 (2026-11-17): second, phone-first view with a Remote / Phone switch (same data).
const CACHE = 'editless-v2.3.3-2026-11-17';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first (so updates arrive when the server is reachable), cache fallback (so it works
// with no signal and with the computer switched off). Only this site's own files are cached.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
