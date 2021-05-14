self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('fala-off-v2').then(function (cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/script.js',
        '/styles.css',
        '/manifest.json',
        '/img/android-icon-144x144.png',
        '/img/android-icon-192x192.png',
        '/img/android-icon-36x36.png',
        '/img/android-icon-48x48.png',
        '/img/android-icon-72x72.png',
        '/img/android-icon-96x96.png',
        '/img/apple-icon-114x114.png',
        '/img/apple-icon-120x120.png',
        '/img/apple-icon-144x144.png',
        '/img/apple-icon-152x152.png',
        '/img/apple-icon-180x180.png',
        '/img/apple-icon-57x57.png',
        '/img/apple-icon-60x60.png',
        '/img/apple-icon-72x72.png',
        '/img/apple-icon-76x76.png',
        '/img/apple-icon-precomposed.png',
        '/img/apple-icon.png',
        '/img/browserconfig.xml',
        '/img/favicon-16x16.png',
        '/img/favicon-32x32.png',
        '/img/favicon-96x96.png',
        '/img/favicon.ico',
        '/img/icon-192x192.png',
        '/img/icon-256x256.png',
        '/img/icon-384x384.png',
        '/img/icon-512x512.png' 
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (request) {
      return request || fetch(event.request)
    })
  )
})

// Delete outdated caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key, i) {
        if (key !== "fala-off-v1") {
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})