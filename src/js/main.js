import { createFolder, getFolders, savePhotoToFolder } from './folders.js';
import { initDb } from './db.js';
import { renderFolders } from './ui.js';

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const a = data.address || {};
    return a.city || a.town || a.village || a.municipality || a.county || a.state || a.country || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

function getPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

const views = ['home', 'folders', 'about'];

function showView(name) {
  views.forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle('d-none', v !== name);
  });
  document.querySelectorAll('[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === name);
  });
}

const init = async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }

  await initDb();

  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showView(el.dataset.view);
    });
  });

  showView('home');

  const foldersContainer = document.getElementById('foldersContainer');
  const recentFolders = document.getElementById('recentFolders');

  const refreshHomeStats = async () => {
    const folders = await getFolders();
    let totalPhotos = 0;
    for (const f of folders) {
      const photos = (await localforage.getItem('folders'))?.[f]?.photos || [];
      totalPhotos += photos.length;
    }
    document.getElementById('stat-folders').textContent = folders.length;
    document.getElementById('stat-photos').textContent = totalPhotos;
    renderFolders(folders.slice(-4).reverse(), recentFolders, 'col-12');
  };

  const refreshFolderList = async () => {
    const folders = await getFolders();
    renderFolders(folders, foldersContainer, 'col-auto');
    await refreshHomeStats();
  };

  await refreshFolderList();

  const cameraBtn = document.querySelector('.camera-btn');
  const cameraContainer = document.getElementById('camera-container');
  const videoStream = document.getElementById('video-stream');
  const snapBtn = document.getElementById('snap-btn');
  const canvas = document.getElementById('photo-canvas');
  const photoPreview = document.getElementById('photo-preview');
  const mapContainer = document.getElementById('map-container');

  cameraBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    cameraContainer.classList.remove('d-none');
    cameraContainer.classList.add('d-flex');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoStream.srcObject = stream;
    } catch (err) {
      console.error('Camera access error', err);
      alert('Cannot access the camera. Please check permissions!');
    }
  });

  snapBtn.addEventListener('click', async () => {
    canvas.width = videoStream.videoWidth;
    canvas.height = videoStream.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg');

    photoPreview.src = photoData;
    photoPreview.classList.remove('d-none');

    let lat, lng, locationName;
    try {
      const position = await getPosition({ timeout: 10000 });
      lat = position.coords.latitude;
      lng = position.coords.longitude;

      mapContainer.classList.remove('d-none');
      if (window.myMap) {
        window.myMap.setView([lat, lng], 15);
        window.myMarker.setLatLng([lat, lng]);
      } else {
        window.myMap = L.map('map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(window.myMap);
        window.myMarker = L.marker([lat, lng]).addTo(window.myMap);
      }
      setTimeout(() => window.myMap.invalidateSize(), 100);

      locationName = await reverseGeocode(lat, lng);
    } catch (err) {
      console.error('GPS error', err);
      locationName = 'Unknown Location';
      lat = null;
      lng = null;
    }

    await createFolder(locationName);
    await savePhotoToFolder(locationName, photoData, { lat, lng, locationName });
    await refreshFolderList();

    alert(`Photo saved to folder: "${locationName}"`);
  });
};

document.addEventListener('DOMContentLoaded', init);