const CACHE = 'crypto-beast-v11';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['crypto.html','crypto-manifest.json','legacy-empire.jpg'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
