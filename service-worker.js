const cacheName = "dtmf_cache";
const cachedItems = [
    "index.html",
    "src/css/style.css",
    "src/js/main.js",
    "src/img/icons/camera-icon.avif",
    "src/img/icons/folder-icon.avif"
];

self.addEventListener("install", (e) =>{
    console.log("installed!");
    
    e.waitUntil(
        caches.open(cacheName).then((cache) =>{
            console.log("cached");
            return cache.addAll(cachedItems);
        })
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});