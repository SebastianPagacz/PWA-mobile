
export function renderFolders(folders, container){
    container.innerHTML = '';

    if(!folders)
        return [];

    folders.forEach(folder => {
        const folderContainer = document.createElement('div');
        const folderIcon = document.createElement('p');
        const folderName = document.createElement('p');

        folderIcon.innerText = "📂";
        folderIcon.classList.add('folder-icon')
        folderName.innerText = folder;

        folderContainer.appendChild(folderIcon);
        folderContainer.appendChild(folderName);
        folderContainer.classList.add('single-folder');

        container.appendChild(folderContainer);
    })
}