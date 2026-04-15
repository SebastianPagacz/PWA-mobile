
export async function initDb(){
        let folders = await localforage.getItem('folders');
        if (!folders){
            folders = {};
            await localforage.setItem('folders', folders);
            return folders;
        }
    }