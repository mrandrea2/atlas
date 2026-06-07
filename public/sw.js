/* Service worker minimale, NETWORK-FIRST.
   Online: prende sempre l'ultima versione (niente build vecchia bloccata in cache).
   Offline: serve l'ultima copia salvata come fallback.
   skipWaiting + clients.claim: gli aggiornamenti entrano in vigore subito. */

const CACHE = "atlas-fallback-v1";

self.addEventListener("install", () => { self.skipWaiting(); });

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;                       // mai cache di POST (API)
  if (!req.url.startsWith(self.location.origin)) return;  // solo stessa origine

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
      return fresh;
    } catch {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === "navigate") {
        const root = await caches.match("/");
        if (root) return root;
      }
      throw new Error("offline");
    }
  })());
});
