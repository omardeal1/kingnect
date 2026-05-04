// KINGNECT — Service Worker para PWA
// Estrategia: cache-first para assets estáticos, network-first para API

const CACHE_NAME = 'kingnect-v1';

// Assets estáticos a pre-cachear durante la instalación
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/logo.svg',
  '/robots.txt',
];

// Instalación: pre-cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activar inmediatamente sin esperar a que cierre el SW anterior
  self.skipWaiting();
});

// Activación: limpiar cachés viejas y tomar control de los clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Tomar control de todos los clientes inmediatamente
  self.clients.claim();
});

// Fetch: estrategia cache-first para assets, network-first para API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar solicitudes GET
  if (request.method !== 'GET') return;

  // Estrategia network-first para llamadas a la API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas de la API
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si no hay red, servir desde la caché
          return caches.match(request);
        })
    );
    return;
  }

  // Estrategia cache-first para assets estáticos y páginas
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Cachear respuestas exitosas
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
