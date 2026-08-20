// Shohnaat Logistics — Service Worker for PWA Offline Support
const CACHE_NAME = 'shohnaat-rider-v1';
const STATIC_ASSETS = [
  '/rider',
  '/rider/pickups',
  '/rider/cod',
  '/rider/history',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignore caching errors — will work on next install
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests — network only
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline — please check your connection' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Static assets — cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        // Update cache with fresh version
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Network failed, return cached or offline page
        return cached || new Response('Offline', { status: 503 });
      });

      return cached || networkFetch;
    })
  );
});

// Background Sync — for offline delivery reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-deliveries') {
    event.waitUntil(syncPendingDeliveries());
  }
});

async function syncPendingDeliveries() {
  // Get pending deliveries from IndexedDB and sync
  const cache = await caches.open('pending-deliveries');
  const requests = await cache.keys();
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      const data = await response.json();
      await fetch('/api/v1/riders/complete-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await cache.delete(request);
    } catch {
      // Will retry on next sync
    }
  }
}

// Push Notifications — for new task assignments
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'New Task Assigned',
    body: 'You have a new delivery task. Open the app to view details.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: '/rider' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'shohnaat-task',
      data: data.data,
    })
  );
});

// Notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/rider')
  );
});
