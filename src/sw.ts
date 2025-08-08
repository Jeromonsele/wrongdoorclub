/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = "wdc-v2";
const ASSETS = [
  "/",
  "/index.html",
  "/src/index.css",
  "/offline.html"
];

sw.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  sw.skipWaiting();
});

sw.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  sw.clients.claim();
});

sw.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const url = new URL(req.url);
      if (url.origin === location.origin) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    } catch {
      if (req.mode === "navigate") return (await caches.match("/offline.html")) as Response;
      return (cached as unknown as Response) || new Response("", { status: 504 });
    }
  })());
});

