// adding assets to the cache
addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => {
      cache.addAll(ASSETS);
    })
  );
});

// removing outdated caches
addEventListener("activate", () => {
  console.log("activate");
});

// fetching assets from the cache
addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
