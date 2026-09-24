/* Minimal online-first worker: provides a valid installable PWA without claiming offline data sync. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
