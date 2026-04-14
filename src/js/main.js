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

}

document.addEventListener("DOMContentLoaded", init);