/**
 * Service Worker Registration & Lifecycle Manager
 */

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Only register in production or when enabled
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.debug("[PWA] Service Worker registered:", registration.scope);
        }

        // Check for service worker updates
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener("statechange", () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                if (import.meta.env.DEV) {
                  console.debug("[PWA] New update available.");
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn("[PWA] Service Worker registration failed:", error);
        }
      });
  });
}
