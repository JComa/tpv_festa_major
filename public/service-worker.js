const CACHE_NAME = 'tpv-festa-major-v2'
const BASE_URL = new URL('./', self.location.href)
const appUrl = (path = '') => new URL(path, BASE_URL).href
const INDEX_URL = appUrl('index.html')
const PRODUCTS_URL = appUrl('config/productes.json')
const APP_SHELL = [
  appUrl(),
  INDEX_URL,
  appUrl('manifest.webmanifest'),
  appUrl('app-icon.svg'),
  appUrl('app-icon-maskable.svg'),
  PRODUCTS_URL,
]

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(APP_SHELL)

  const indexResponse = await fetch(INDEX_URL, { cache: 'no-cache' })
  const indexHtml = await indexResponse.clone().text()
  const assetUrls = Array.from(
    indexHtml.matchAll(/(?:src|href)="([^"?]*\/assets\/[^"?]+)"/g),
    (match) => new URL(match[1], BASE_URL).href,
  )

  await cache.put(INDEX_URL, indexResponse)

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
    event.respondWith(networkFirst(request, INDEX_URL))
    return
  }

  if (url.href === PRODUCTS_URL) {
    event.respondWith(networkFirst(request, PRODUCTS_URL))
    return
  }

  event.respondWith(cacheFirst(request))
})
