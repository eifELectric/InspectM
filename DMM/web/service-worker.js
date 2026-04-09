self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.js',
        '/src/file-handler.js',
        '/src/i18n.js',
        '/src/chart.js',
        '/src/toast.js',
        '/locals/translations.js',
        '/css/style.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
