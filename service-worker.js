const cacheName = "dtmf_cache";
const cachedItems = [
    "/",
    "manifest.json",
    "/index.html",
    "src/css/style.css",
    "src/js/main.js",
    "src/js/localforage.js",
    "src/img/icons/camera-icon.avif",
    "src/img/icons/folder-icon.avif",
    "icon/dtmf_icon_144x144.png",
    "icon/dtmf_icon.png",
    "icon/logo-500x500.avif"
];

self.addEventListener("install", (e) => {
    console.log("installed!"); // debug
    
    e.waitUntil(
        caches.open(cacheName).then((cache) =>{
            console.log("cached"); // debug
            return cache.addAll(cachedItems);
        })
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request, {ignoreSearch: true}).then(response => {
            return response || fetch(e.request);
        })
    );
});

