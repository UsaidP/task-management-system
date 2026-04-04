// TaskFlow Service Worker
// Provides offline caching and faster repeat visits

const CACHE_NAME = 'taskflow-v1'
const RUNTIME_CACHE = 'taskflow-runtime-v1'

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/favicon.svg',
]

// Install event - precache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
            .map((cacheName) => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) {
    return
  }

  // Strategy: Cache-first for static assets, network-first for HTML
  if (event.request.mode === 'navigate') {
    // Network-first for HTML (ensures fresh content)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request)
        })
    )
  } else {
    // Cache-first for static assets (JS, CSS, images, fonts)
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Fetch and cache
          return fetch(event.request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response
              }
              const responseClone = response.clone()
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(event.request, responseClone)
              })
              return response
            })
        })
    )
  }
})

// Message handler for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
