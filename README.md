# DTMF — Debi Tirar Mas Fotos

A mobile-first Progressive Web App for capturing photos and organising them by location. Built as a PWA, it installs to your home screen and works offline.

---

## Features

- **Camera capture** — take photos directly from the app using your device camera
- **Folder organisation** — group photos into named folders for easy browsing
- **Geolocation & map** — view your current location on an interactive Leaflet map when taking a photo
- **Recent folders** — quick access to your most recently used folders from the home screen
- **Stats dashboard** — see total folder and photo counts at a glance
- **Offline support** — service worker caches all core assets so the app works without a connection
- **Installable** — full PWA manifest with icons; installs to home screen on Android and iOS

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | Bootstrap 5.3 |
| Maps | Leaflet 1.9 |
| Local storage | LocalForage |
| JS | Vanilla ES Modules |
| Offline | Service Worker (Cache API) |

---

## Project Structure

```
/
├── index.html              # App shell, all views
├── manifest.json           # PWA manifest
├── service-worker.js       # Caching & offline logic
├── icon/                   # App icons (png, avif)
└── src/
    ├── css/
    │   └── style.css
    ├── img/
    │   └── icons/
    └── js/
        ├── main.js         # Entry point, routing
        ├── folders.js      # Folder logic
        ├── db.js           # LocalForage wrappers
        ├── ui.js           # DOM helpers
        └── localforage.js  # LocalForage bundle
```

---

## Getting Started

No build step required — just serve the project root from any static file server.

```bash
# Using Python
python -m http.server 8080

# Using Node
npx serve .
```

Then open `http://localhost:8080` in your browser. On mobile, use your browser's "Add to Home Screen" option to install the PWA.

### Permissions

The app will request:
- **Camera** — for taking photos
- **Geolocation** — for tagging photos with a map location