self.addEventListener('install', event => {
    console.log('[Service Worker] Installing ...', event)
    event.waitUntil(caches.open('static')
        .then(cache => {
            console.log('[Service Worker] Pre-caching App Shell');
            cache.add('/src/js/app.js')
        })
    )
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating ...', event);
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});
