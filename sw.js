/* Service worker mínimo: garda o armazón da app para que funcione sen
   conexión. Só se rexistra cando a app se serve por http(s) — desde
   file:// os service workers non están permitidos. */
const CACHE = 'qch-v6';

const ARMAZON = [
  './',
  'index.html',
  'css/estilos.css',
  'vendor/tailwind-browser.js',
  'vendor/gsap.min.js',
  'js/datos/ingredientes.js',
  'js/datos/receitas.js',
  'js/datos/familia.js',
  'js/utilidades.js',
  'js/estado.js',
  'js/api.js',
  'js/xerador.js',
  'js/vistas/comuns.js',
  'js/vistas/hoxe.js',
  'js/vistas/semana.js',
  'js/vistas/receitario.js',
  'js/vistas/neveira.js',
  'js/vistas/familia.js',
  'js/vistas/detalle.js',
  'js/vistas/cociñar.js',
  'js/vistas/configuracion.js',
  'js/publico.js',
  'js/compartirImaxe.js',
  'js/app.js',
  'manifest.json',
  'iconos/icona.svg'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE)
      // addAll falla enteiro se un só recurso falla; mellor un a un.
      .then(c => Promise.all(ARMAZON.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // As fotos e as fontes externas van pola rede; se non hai, non pasa nada:
  // a app ten ilustracións vectoriais propias e tipografías de reserva.
  if (url.origin !== location.origin) return;

  ev.respondWith(
    caches.match(req).then(gardado => {
      if (gardado) return gardado;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
