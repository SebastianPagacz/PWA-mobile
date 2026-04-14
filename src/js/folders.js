
export async function createFolder(folderName){
    const folders = await localforage.getItem('folders');

    if(folders[folderName]){
        console.log(`${folderName} already exists`);
        return `${folderName} already exists`;
    }

    folders[folderName] = [];
    console.log(`${folderName} album was created`);
    await localforage.setItem('folders', folders);
}