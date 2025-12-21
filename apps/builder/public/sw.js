// Service Worker for Wedding Invitation PWA
const CACHE_NAME = 'wedding-invitation-v1';
const DEFAULT_ASSETS_CACHE = 'default-assets-v1';
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
          if (cacheName !== CACHE_NAME && cacheName !== DEFAULT_ASSETS_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Check if URL is a default asset (from CDN)
function isDefaultAsset(url) {
  try {
    const urlObj = new URL(url);
    // Check if URL contains /defaults/ path (R2 CDN) or matches CDN base URL pattern
    return urlObj.pathname.includes('/defaults/') || 
           urlObj.hostname.includes('pub') || 
           urlObj.hostname.includes('sacredvows.io');
  } catch {
    // If URL parsing fails, check if it's a relative path to assets
    return url.startsWith('/assets/') || url.startsWith('/layouts/');
  }
}

// Fetch event - Different strategies for different resource types
// Default assets: Cache First (immutable, long TTL)
// App resources: Stale-while-revalidate (fast, fresh)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;
  const isAsset = isDefaultAsset(url);

  if (isAsset) {
    // Default assets: Cache First strategy (immutable, long TTL)
    event.respondWith(
      caches.open(DEFAULT_ASSETS_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return from cache immediately
            return cachedResponse;
          }

          // Cache miss - fetch from network
          return fetch(event.request).then((networkResponse) => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Network failed - return cached version if available, or error
            return cachedResponse || new Response('Asset not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
  } else {
    // App resources: Stale-while-revalidate strategy
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
  }
});

