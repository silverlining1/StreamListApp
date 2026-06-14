/*
 * StreamList Service Worker
 * INT499 Capstone - EZTechMovie
 *
 * Responsibilities (Wargo, 2020, Ch. 3):
 *   1. Install  -> precache the app shell so the app loads offline.
 *   2. Activate -> remove stale caches when the version changes.
 *   3. Fetch    -> serve cached assets fast, fall back to the network.
 *
 * Bump CACHE_VERSION whenever you change cached files so users get the update.
 */

const CACHE_VERSION = "streamlist-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.ico",
  "./logo192.png",
  "./logo512.png"
];

// 1. INSTALL: open the cache and store the app shell.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate this worker immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

// 2. ACTIVATE: delete any cache that is not the current version.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of open pages without requiring a reload.
  self.clients.claim();
});

// 3. FETCH: choose a strategy based on the request type.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests; let POST/PUT (e.g., form sends) pass through.
  if (request.method !== "GET") {
    return;
  }

  // Let cross-origin calls (e.g., the TMDB API) always hit the network so
  // movie data stays live and is never served stale from the cache.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Page navigations: network-first, fall back to the cached shell offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Static same-origin assets (JS, CSS, images): cache-first for speed,
  // then update the cache in the background with the network response.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached); // offline and not cached -> resolve with whatever we have
      return cached || networkFetch;
    })
  );
});
