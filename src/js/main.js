import { createFolder } from "./folders.js";

const init = async () => {
    let swRegistration = null;

    if ("serviceWorker" in navigator){
        navigator.serviceWorker
            .register("service-worker.js")
            .then((reg) => {
                swRegistration = reg;
            });
    }

    async function initDb(){
        let folders = await localforage.getItem('folders');
        if (!folders){
            folders = {};
            await localforage.setItem('folders', folders);
            return folders;
        }
    }

    initDb();

    const folderBtn = document.getElementById('folderBtn');

    folderBtn.addEventListener('click', () => {
        const folderName = document.getElementById('folderName').value;
        createFolder(folderName);
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
    });

}

document.addEventListener("DOMContentLoaded", init);

