// Manual Service Worker for JongQue PWA
const CACHE_NAME = 'jongque-v1'
const urlsToCache = [
  '/',
  '/test-pwa',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache opened')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully')
        self.skipWaiting()
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Service Worker activated successfully')
      self.clients.claim()
    })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})
