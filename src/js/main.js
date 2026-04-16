import { createFolder, getFolders } from "./folders.js";
import { initDb } from "./db.js";
import { renderFolders } from "./ui.js";

const init = async () => {
    let swRegistration = null;

    if ("serviceWorker" in navigator){
        navigator.serviceWorker
            .register("service-worker.js")
            .then((reg) => {
                swRegistration = reg;
            });
    }

    initDb();

    
    const folderBtn = document.getElementById('folderBtn');
    const foldersContainer = document.getElementById('foldersContainer');
    
    const folders = await getFolders();
    renderFolders(folders, foldersContainer);

    folderBtn.addEventListener('click', async () => {
        const folderName = document.getElementById('folderName').value;
        await createFolder(folderName);
        const folders = await getFolders();
        renderFolders(folders, foldersContainer);
    });

    const cameraBtn = document.querySelector('.camera-btn');
    const cameraContainer = document.getElementById('camera-container');
    const videoStream = document.getElementById('video-stream');
    const snapBtn = document.getElementById('snap-btn');
    const canvas = document.getElementById('photo-canvas');
    const photoPreview = document.getElementById('photo-preview');

    cameraBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        cameraContainer.style.display = 'flex';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            videoStream.srcObject = stream;
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Cannot access the camera. Please check permissions!");
        }
    });

    snapBtn.addEventListener('click', () => {
        canvas.width = videoStream.videoWidth;
        canvas.height = videoStream.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
        
        const photoData = canvas.toDataURL('image/jpeg');
        photoPreview.src = photoData;
        photoPreview.style.display = 'block';

        const mapContainer = document.getElementById('map-container');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    mapContainer.style.display = 'block';
                    
                    if (window.myMap) {
                        window.myMap.setView([lat, lng], 15);
                        window.myMarker.setLatLng([lat, lng]);
                    } else {
                        window.myMap = L.map('map').setView([lat, lng], 15);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                        }).addTo(window.myMap);
                        window.myMarker = L.marker([lat, lng]).addTo(window.myMap);
                    }
                    
                    setTimeout(() => window.myMap.invalidateSize(), 100);
                },
                (err) => {
                    console.error("GPS download error:", err);
                    alert("Failed to retrieve GPS location. Please check if your browser has permissions!");
                }
            );
        } else {
            alert("Your browser does not support Geolocation.");
        }
    });
}

document.addEventListener("DOMContentLoaded", init);

