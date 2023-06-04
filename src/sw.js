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

const enablePreload = async () => {
  if ("navigationPreload" in self.registration) {
    await self.registration.navigationPreload.enable();
  }
};

const respondToFetch = async (event) => {
  const cached = await caches.match(event.request);
  if (cached) {
    return cached;
  }
  const response = await event.preloadResponse;
  if (response) {
    return response;
  }

  return fetch(event.request);
};

addEventListener("install", (event) => {
  event.waitUntil(addAssets());
});

addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([pruneCache(), enablePreload()]));
});

addEventListener("fetch", (event) => {
  event.respondWith(respondToFetch(event));
});
