import { getPhotosFromFolder } from './folders.js';

export async function renderFolders(folders, container, colClass = 'col-6') {
  container.innerHTML = '';
  if (!folders || folders.length === 0) return;

  for (const folder of folders) {
    const photos = await getPhotosFromFolder(folder);

    const col = document.createElement('div');
    col.classList.add(colClass);

    const folderContainer = document.createElement('div');
    folderContainer.classList.add('single-folder');

    const folderIcon = document.createElement('span');
    folderIcon.innerText = '📁';
    folderIcon.classList.add('folder-icon');

    const folderName = document.createElement('p');
    folderName.classList.add('folder-name');
    folderName.innerText = folder;

    const photoCount = document.createElement('p');
    photoCount.classList.add('folder-count');
    photoCount.innerText = `${photos.length} photo${photos.length !== 1 ? 's' : ''}`;

    folderContainer.appendChild(folderIcon);
    folderContainer.appendChild(folderName);
    folderContainer.appendChild(photoCount);
    folderContainer.addEventListener('click', () => openFolderModal(folder, photos));

    col.appendChild(folderContainer);
    container.appendChild(col);
  }
}

function openFolderModal(folderName, photos) {
  const existing = document.getElementById('folder-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'folder-modal';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.75)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'flex-start', overflowY: 'auto', zIndex: '1000',
    padding: '20px',
  });

  const box = document.createElement('div');
  Object.assign(box.style, {
    background: '#fff', borderRadius: '8px', padding: '20px',
    maxWidth: '900px', width: '100%',
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px',
  });

  const title = document.createElement('h2');
  title.textContent = `📁 ${folderName}`;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  Object.assign(closeBtn.style, {
    fontSize: '1.25em', cursor: 'pointer', border: 'none',
    background: 'none', padding: '4px 8px',
  });
  closeBtn.addEventListener('click', () => overlay.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);
  box.appendChild(header);

  if (photos.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No photos in this folder yet.';
    box.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    Object.assign(grid.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
    });

    for (const photo of photos) {
      const card = document.createElement('div');
      Object.assign(card.style, {
        borderRadius: '6px', overflow: 'hidden',
        border: '1px solid #ddd', background: '#f9f9f9',
      });

      const img = document.createElement('img');
      img.src = photo.data;
      img.alt = `Photo from ${photo.locationName || folderName}`;
      Object.assign(img.style, { width: '100%', display: 'block' });

      const info = document.createElement('div');
      Object.assign(info.style, { padding: '6px 8px', fontSize: '0.75em', color: '#555' });

      const ts = new Date(photo.timestamp).toLocaleString();
      info.innerHTML = `<strong>${photo.locationName || folderName}</strong><br>${ts}` +
        (photo.lat != null ? `<br>📍 ${photo.lat.toFixed(5)}, ${photo.lng.toFixed(5)}` : '');

      card.appendChild(img);
      card.appendChild(info);
      grid.appendChild(card);
    }

    box.appendChild(grid);
  }

  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}