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

const init = async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }

  await initDb();

  const folderBtn = document.getElementById('folderBtn');
  const foldersContainer = document.getElementById('foldersContainer');

  const refreshFolderList = async () => {
    const folders = await getFolders();
    renderFolders(folders, foldersContainer);
  };

  await refreshFolderList();

  folderBtn.addEventListener('click', async () => {
    const folderName = document.getElementById('folderName').value.trim();
    if (!folderName) return;
    await createFolder(folderName);
    document.getElementById('folderName').value = '';
    await refreshFolderList();
  });

  const cameraBtn = document.querySelector('.camera-btn');
  const cameraContainer = document.getElementById('camera-container');
  const videoStream = document.getElementById('video-stream');
  const snapBtn = document.getElementById('snap-btn');
  const canvas = document.getElementById('photo-canvas');
  const photoPreview = document.getElementById('photo-preview');
  const mapContainer = document.getElementById('map-container');

  cameraBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    cameraContainer.style.display = 'flex';
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
    photoPreview.style.display = 'block';

    let lat, lng, locationName;
    try {
      const position = await getPosition({ timeout: 10000 });
      lat = position.coords.latitude;
      lng = position.coords.longitude;

      mapContainer.style.display = 'block';
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