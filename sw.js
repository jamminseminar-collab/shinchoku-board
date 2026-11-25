// 画面の部品だけを手元に残して、電波が弱いときでもすぐ開けるようにする。
// ボードの中身（Dropbox）はここでは扱わない。
const CACHE = "shinchoku-v18";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-metal-180.png", "./icon-metal-192.png", "./icon-metal-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // 新しい版を優先し、つながらないときだけ手元の版を使う
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
