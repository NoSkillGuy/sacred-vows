// Service Worker for Wedding Invitation PWA
const CACHE_NAME = 'wedding-invitation-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/photos/icons/icon-192.png',
  '/assets/photos/icons/icon-512.png',
  '/assets/music/1.mp3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Stale-while-revalidate strategy
// Serve cached version immediately (fast), then update cache in background
// This provides instant loading while keeping content fresh
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // First, try to get from cache (fast response)
    caches.match(event.request).then((cachedResponse) => {
      // Fetch latest version in background (don't wait for it)
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Check if valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          // Clone the response for caching
          const responseToCache = networkResponse.clone();

          // Update cache with latest version
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            console.log('Cache updated with latest version:', event.request.url);
          });

          return networkResponse;
        })
        .catch((error) => {
          // Network failed - that's okay, we'll use cache
          console.log('Background update failed (offline):', event.request.url);
        });

      // If we have cached version, return it immediately
      if (cachedResponse) {
        // Return cached version immediately, update in background
        return cachedResponse;
      }

      // No cache available - wait for network
      return fetchPromise.then((networkResponse) => {
        if (networkResponse) {
          return networkResponse;
        }
        
        // Network failed and no cache - return offline fallback for HTML pages
        if (event.request.destination === 'document' || 
            (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('/index.html');
        }
        
        // For other resources, return a basic error response
        return new Response('Offline - Resource not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

