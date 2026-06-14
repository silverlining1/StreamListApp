/*
 * serviceWorkerRegistration.js
 * Registers the StreamList service worker after the page loads.
 *
 * Usage:
 *   - Create React App:  import and call register() in src/index.js
 *   - Vite:              import and call register() in src/main.jsx
 *
 * The service worker is only registered when the browser supports it.
 * It is served from the site root, so its scope covers the whole app.
 */

export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // process.env.PUBLIC_URL works in CRA; falls back to "" for Vite.
      const base =
        typeof process !== "undefined" && process.env && process.env.PUBLIC_URL
          ? process.env.PUBLIC_URL
          : "";
      const swUrl = `${base}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("StreamList service worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("StreamList service worker registration failed:", error);
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => console.error(error));
  }
}
