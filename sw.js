// PlateScan service worker: receives streak reminders and sets the app icon badge.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  const jobs = [self.registration.showNotification(d.title || 'PlateScan', {
    body: d.body || 'Log a meal to keep your streak going.',
    icon: 'icon-192.png', badge: 'icon-192.png', tag: 'streak', data: { url: d.url || './' }
  })];
  if (self.navigator && 'setAppBadge' in self.navigator) jobs.push(self.navigator.setAppBadge(1).catch(() => {}));
  e.waitUntil(Promise.all(jobs));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if ('focus' in w) return w.focus();
    return self.clients.openWindow(url);
  }));
});
