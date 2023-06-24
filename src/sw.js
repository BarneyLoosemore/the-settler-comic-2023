const addAssets = () => {
  caches.open(VERSION).then((cache) => {
    cache.addAll(ASSETS);
  });
};

const pruneCache = () => {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== VERSION) {
        caches.delete(key);
      }
    });
  });
};

const respondToFetch = async (event) => {
  const cached = await caches.match(event.request);
  if (cached) return cached;

  return fetch(event.request);
};

addEventListener("install", (event) => {
  event.waitUntil(addAssets());
});

addEventListener("activate", (event) => {
  event.waitUntil(pruneCache());
});

addEventListener("fetch", (event) => {
  event.respondWith(respondToFetch(event));
});
