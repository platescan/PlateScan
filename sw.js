// PlateScan service worker: offline caching, streak reminders, friend nudges and the app icon badge.
const V = 'platescan-v22-2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-180.png'];
// Libraries and models with a version in their URL never change, so they're served from cache after the first download.
const IMMUTABLE = [/^https:\/\/cdn\.jsdelivr\.net\/npm\/[^/]+@\d/, /^https:\/\/www\.gstatic\.com\/firebasejs\/\d/, /^https:\/\/storage\.googleapis\.com\/mediapipe-models\//, /^https:\/\/fonts\.(googleapis|gstatic)\.com\//];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('platescan-') && k !== V && k !== 'platescan-libs').map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  // Your own pages: open instantly from cache, then refresh the cache in the background (stale-while-revalidate).
  // The app checks for a new version and shows a "Refresh" bar, so updates still arrive quickly.
  if (url.startsWith(self.location.origin)) {
    if (url.includes('/config.js') || url.includes('sw.js') || url.includes('?v=')) return;
    const isPage = req.mode === 'navigate' || /\/(index\.html)?(\?.*)?$/.test(new URL(url).pathname + new URL(url).search);
    const net = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(isPage ? './index.html' : req, copy)); }
      return res;
    });
    e.waitUntil(net.then(() => {}, () => {}));
    e.respondWith(caches.match(isPage ? './index.html' : req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return net.catch(() => caches.match('./index.html'));
    }));
    return;
  }
  if (IMMUTABLE.some(r => r.test(url))) {
    e.respondWith(caches.open('platescan-libs').then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }))));
  }
  // Everything else (Firebase sync, food lookups, AI) goes straight to the network.
});

// The app's Refresh button asks for a fresh copy before reloading.
self.addEventListener('message', e => {
  if (e.data !== 'refresh') return;
  e.waitUntil(caches.open(V).then(c => Promise.all(['./index.html', './manifest.json'].map(u =>
    fetch(u, { cache: 'no-store' }).then(r => r.ok && c.put(u, r)).catch(() => {}))))
    .then(() => e.source && e.source.postMessage('refreshed')));
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  const tag = d.tag || 'streak';
  const jobs = [self.registration.showNotification(d.title || 'PlateScan', {
    body: d.body || 'Log a meal to keep your streak going.',
    icon: 'icon-192.png', badge: 'icon-192.png', tag, data: { url: d.url || './' }
  })];
  if (self.navigator && 'setAppBadge' in self.navigator) jobs.push(self.navigator.setAppBadge(1).catch(() => {}));
  e.waitUntil(Promise.all(jobs));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ('focus' in w) { if (url.includes('#') && 'navigate' in w) w.navigate(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
