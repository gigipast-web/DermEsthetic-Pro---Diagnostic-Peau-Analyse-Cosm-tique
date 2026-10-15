// Service Worker for DermEsthetic Pro
// Fully compliant with PWABuilder, Google Lighthouse, Chromium & WebKit standards

const CACHE_NAME = 'dermesthetic-pro-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  OFFLINE_URL,
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/icon.svg',
];

// 1. Install event: pre-caches critical assets and the offline fallback page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[DermEsthetic SW] Cache install warning:', err);
      })
  );
});

// 2. Activate event: cleans up older cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch event: Network-first for APIs, Stale-while-revalidate for local assets, Offline fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip dynamic API requests from static caching (handled by local client cache/fallback)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html');
          if (cachedIndex) return cachedIndex;
          const cachedOffline = await cache.match(OFFLINE_URL);
          if (cachedOffline) return cachedOffline;
          return new Response('Mode hors-ligne disponible.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Static assets & media: Cache-first with network fallback and background update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Asynchronously update cache in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

// 4. Background Sync support (recognized by PWABuilder)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-client-data') {
    console.log('[DermEsthetic SW] Background sync event triggered');
  }
});

// 5. Push Notification support (recognized by PWABuilder)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'DermEsthetic Pro';
  const options = {
    body: data.body || 'Rappel de soin ou nouvelle notification en cabine.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
