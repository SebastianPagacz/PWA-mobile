export async function createFolder(folderName) {
  if (!folderName || !folderName.trim()) return null;
  folderName = folderName.trim();
  const folders = (await localforage.getItem('folders')) || {};
  if (folders[folderName]) {
    console.log(`${folderName} already exists`);
    return folderName;
  }
  folders[folderName] = { photos: [] };
  await localforage.setItem('folders', folders);
  console.log(`${folderName} album was created`);
  return folderName;
}

export async function getFolders() {
  const folders = await localforage.getItem('folders');
  if (!folders) return [];
  return Object.keys(folders);
}

export async function savePhotoToFolder(folderName, photoData, metadata = {}) {
  if (!folderName || !folderName.trim()) throw new Error('Folder name is required');
  folderName = folderName.trim();
  const folders = (await localforage.getItem('folders')) || {};
  if (!folders[folderName]) {
    folders[folderName] = { photos: [] };
  }
  const photo = {
    id: Date.now(),
    data: photoData,
    timestamp: new Date().toISOString(),
    ...metadata,
  };
  folders[folderName].photos.push(photo);
  await localforage.setItem('folders', folders);
  console.log(`Photo saved to folder "${folderName}"`);
  return photo;
}

export async function getPhotosFromFolder(folderName) {
  const folders = (await localforage.getItem('folders')) || {};
  if (!folders[folderName]) return [];
  return folders[folderName].photos || [];
}