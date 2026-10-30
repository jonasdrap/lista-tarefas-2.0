// Guarda o app no celular para abrir sem internet. Ao mudar o app, troque a versão abaixo.
const VERSION = "tarefas-v4";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fonts = url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  if (url.origin !== location.origin && !fonts) return;
  // Mostra a cópia guardada na hora e atualiza em segundo plano quando houver internet
  e.respondWith(caches.open(VERSION).then(async c => {
    const key = req.mode === "navigate" ? "index.html" : req;
    const hit = await c.match(key, { ignoreSearch: req.mode === "navigate" });
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(key, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response("Sem conexão", { status: 503 });
  }));
});
