const CACHE_NAME = 'tpv-festa-major-v1'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/app-icon.svg', '/app-icon-maskable.svg', '/config/productes.json']

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(APP_SHELL)

  const indexResponse = await fetch('/index.html', { cache: 'no-cache' })
  const indexHtml = await indexResponse.clone().text()
  const assetUrls = Array.from(
    indexHtml.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g),
    (match) => match[1],
  )

  await cache.put('/index.html', indexResponse)

  if (assetUrls.length > 0) {
    await cache.addAll(assetUrls)
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    cacheAppShell().then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch {
    return (await cache.match(request)) ?? (await cache.match(fallbackUrl))
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(request, response.clone())
  }

  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/index.html'))
    return
  }

  if (url.pathname === '/config/productes.json') {
    event.respondWith(networkFirst(request, '/config/productes.json'))
    return
  }

  event.respondWith(cacheFirst(request))
})
