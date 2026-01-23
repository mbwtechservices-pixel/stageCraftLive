const CACHE_NAME = 'stagecraft-gallery-v1';
const CACHE_DURATION = 72 * 60 * 60 * 1000; // 72 hours in milliseconds

const urlsToCache = [
  'gallery.html',
  'styles.css',
  'script.js',
  'Images/logo.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache installation error:', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement cache-first strategy with 72-hour expiration
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if available
        if (response) {
          // Check cache timestamp
          const cacheTime = response.headers.get('X-Cache-Time');
          if (cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age < CACHE_DURATION) {
              return response;
            }
          }
        }

        // Fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache cross-origin requests (YouTube, CDNs)
            if (!response || response.status !== 200 || response.type === 'basic' && !event.request.url.includes(self.location.origin)) {
              return response;
            }

            // Clone response to cache it
            const responseToCache = response.clone();
            const cachedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: new Headers(responseToCache.headers)
            });
            cachedResponse.headers.set('X-Cache-Time', Date.now().toString());

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, cachedResponse);
              });

            return response;
          })
          .catch(() => {
            // Return cached response even if stale, or a fallback
            return caches.match(event.request)
              .then(cachedResponse => {
                return cachedResponse || new Response('Video unavailable - please check your connection', {
                  status: 503,
                  statusText: 'Service Unavailable'
                });
              });
          });
      })
  );
});
