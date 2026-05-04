// KINGNECT — Service Worker para PWA
// Estrategia: cache-first para assets estáticos, network-first para API
// Soporta instalación de mini webs individuales como PWA

const CACHE_NAME = 'kingnect-v2';
const MINI_WEB_CACHE = 'kingnect-mini-web-v1';

// Assets estáticos a pre-cachear durante la instalación
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/logo.svg',
  '/robots.txt',
];

// Página offline fallback
const OFFLINE_FALLBACK = '/offline.html';

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
          .filter((name) => name !== CACHE_NAME && name !== MINI_WEB_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Tomar control de todos los clientes inmediatamente
  self.clients.claim();
});

// Fetch: estrategia según tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar solicitudes GET
  if (request.method !== 'GET') return;

  // No cachear requests de autenticación
  if (url.pathname.startsWith('/api/auth')) return;

  // Estrategia network-first para llamadas a la API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas de la API (excepto webhook y checkout)
          if (response.ok && !url.pathname.includes('/stripe/')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si no hay red, servir desde la caché
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(
              JSON.stringify({ error: 'Sin conexión' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Estrategia cache-first para manifest dinámicos de mini webs
  if (url.pathname.startsWith('/api/manifest/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Actualizar en background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(MINI_WEB_CACHE).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(MINI_WEB_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Estrategia stale-while-revalidate para imágenes y assets del mini web
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
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
      }).catch(() => {
        // Fallback offline para navegación
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_FALLBACK) || new Response(
            '<html><body><h1>Sin conexión</h1><p>No hay conexión a internet y no se encontró la página en caché.</p></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html' } }
          );
        }
        return new Response('', { status: 503 });
      });
    })
  );
});

// Manejar mensajes del cliente (ej: para forzar actualización)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => {
      console.log('Cachés limpiadas');
    });
  }
});
