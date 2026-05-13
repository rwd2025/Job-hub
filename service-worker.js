const CACHE="rolling-cecil-phase9-qa-debug";
const ASSETS=["./","./index.html","./app.js","./style.css","./manifest.json","./service-worker.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))});
self.addEventListener("fetch",e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))))});
