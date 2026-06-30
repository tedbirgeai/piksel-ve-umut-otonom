/* public/service-worker.js
 * Piksel ve Umut — Otonom Eğitim Ekosistemi PWA service worker.
 * Strateji:
 *   - Gezinme (HTML): network-first, çevrimdışıyken cache + "/" yedeği.
 *   - Statik varlık (script/style/font/image): cache-first + arka plan güncelleme.
 *   - Dış istekler (RPC, IPFS gateway, Ollama, /api): asla dokunma.
 */
const CACHE = "piksel-umut-v2";
const CORE_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // HATA ONARIMI: addAll all-or-nothing'tir — tek bir varlık 404 verirse
      // TÜM kurulum başarısız olur ve SW hiç aktifleşmez. Her varlığı tek
      // tek, hataya dayınıklı şekilde önbelleğe alıyoruz.
      .then((cache) =>
        Promise.allSettled(
          CORE_ASSETS.map((u) =>
            fetch(u, { cache: "reload" })
              .then((r) => (r.ok ? cache.put(u, r) : null))
              .catch(() => null),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // POST (api/ollama, api/ipfs, tx) atlanır

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // dış kaynaklar atlanır
  if (url.pathname.startsWith("/api/")) return; // API her zaman ağdan

  // Gezinme istekleri: network-first
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Statik varlıklar: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const dest = req.destination;
        if (
          res.ok &&
          (dest === "style" ||
            dest === "script" ||
            dest === "image" ||
            dest === "font")
        ) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    }),
  );
});
