// Minimal service worker — exists solely to enable
// ServiceWorkerRegistration.showNotification() on mobile browsers
// (Android Chrome requires this for notifications to fire reliably
// when the page is in a background tab).
//
// No caching, no push events — just install and activate.
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(clients.claim()));
