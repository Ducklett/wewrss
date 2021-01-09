const CACHE_NAME = 'static-cache-v1';

const FILES_TO_CACHE = [
	'/index.html',
	'/manifest.json',
	'/service-worker.js',
	'/style.css',
	'/src/domfluid.js',
	'/src/gui.js',
	'/src/hamburger.png',
	'/src/icon.png',
	'/src/index.js',
	'/src/loading.gif',
	'/src/rss.js',
	'/src/sourcecode.png',
	"/icons/icon-128.png",
	"/icons/icon-144.png",
	"/icons/icon-152.png",
	"/icons/icon-192.png",
	"/icons/icon-256.png",
	"/icons/icon-512.png",
]

self.addEventListener('install', (evt) => {
	console.log('[ServiceWorker] Install');
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('[ServiceWorker] Pre-caching offline page')
			return cache.addAll(FILES_TO_CACHE)
		})
	)
	self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(keyList.map((key) => {
				if (key !== CACHE_NAME) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	self.clients.claim()
})

self.addEventListener('fetch', (evt) => {
	console.log('[ServiceWorker] Fetch', evt.request.url);
	evt.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(evt.request, { ignoreSearch: true })
				.then((response) => {
					return response || fetch(evt.request);
				});
		})
	);
});
