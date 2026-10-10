const CACHE = "menu-do-dia-v3";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const rede = fetch(e.request).then(res => {
        if (res && res.status === 200 && new URL(e.request.url).origin === location.origin) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return res;
      }).catch(() => hit || caches.match("index.html"));
      return hit || rede;
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(lista => {
      if (e.action === "copo") {
        if (lista.length) { lista[0].postMessage({ tipo: "copo" }); return; }
        return self.clients.openWindow("./index.html?copo=1");
      }
      for (const c of lista) { if ("focus" in c) return c.focus(); }
      return self.clients.openWindow("./index.html");
    })
  );
});
