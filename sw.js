// Cache simples para o app abrir mesmo sem internet no estúdio.
const CACHE = 'era-pilates-v8';
const ARQUIVOS = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'icon-180.png', 'icon-192.png', 'icon-512.png', 'brand/logo-simbolo.png', 'brand/logo-palavra.png', 'brand/favicon-32.png',
  'js/app.js', 'js/store.js', 'js/sugestao.js', 'js/exercicios.js', 'js/pictos.js', 'js/xlsx.js',
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Rede primeiro (pega atualizações do Netlify), cache se estiver offline.
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET' || ev.request.url.includes('/.dados/')) return;
  ev.respondWith(
    fetch(ev.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(ev.request, copia)); return r; })
      .catch(() => caches.match(ev.request))
  );
});
