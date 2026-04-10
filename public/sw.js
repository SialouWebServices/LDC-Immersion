const CACHE_NAME = 'ldc-tracker-v3';

// Cache uniquement les ressources essentielles
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy pour les appels API Convex
  if (event.request.url.includes('convex.cloud')) {
    return; // Laisser passer sans interception
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => {
        // Si offline et pas en cache, retourner la page principale
        return caches.match('/index.html');
      });
    })
  );
});
