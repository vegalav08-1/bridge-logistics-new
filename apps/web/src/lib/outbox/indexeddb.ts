const DB_NAME = 'erp_outbox';
const STORE = 'items';
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      const st = db.createObjectStore(STORE, { keyPath: 'id' });
      st.createIndex('by_chat', 'chatId');
      st.createIndex('by_status', 'status');
      st.createIndex('by_created', 'createdAt');
    };
    req.onsuccess = () => resolve(req.result);
  });
  return dbPromise;
}

export async function idbAdd(item: any, blob?: Blob) {
  const db = await openDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    const st = tx.objectStore(STORE);
    st.put(item);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  if (blob) await idbPutBlob(item.id, blob);
}

export async function idbGet(id: string) {
  const db = await openDB();
  return new Promise<any>((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const st = tx.objectStore(STORE);
    const r = st.get(id);
    r.onsuccess = () => res(r.result ?? null);
    r.onerror = () => rej(r.error);
  });
}

export async function idbPut(item: any) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function idbDelete(id: string) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function idbAllQueued() {
  const db = await openDB();
  return new Promise<any[]>((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const st = tx.objectStore(STORE).index('by_status').openCursor('queued');
    const out: any[] = [];
    st.onsuccess = (e: any) => {
      const c: IDBCursorWithValue | null = e.target.result;
      if (c) { out.push(c.value); c.continue(); } else res(out);
    };
    st.onerror = () => rej(st.error);
  });
}

// --- Blob хранение (отдельный ObjectStore) ---
const BLOB_STORE = 'blobs';

// Only run on client side
if (typeof window !== 'undefined') {
  (async () => {
    // ensure blob store
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) db.createObjectStore(BLOB_STORE);
    };
    req.onsuccess = () => req.result.close();
  })();
}

async function openBlobDB() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available on server side');
  }
  
  return new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, 2);
    r.onerror = () => reject(r.error);
    r.onsuccess = () => resolve(r.result);
  });
}

export async function idbPutBlob(id: string, blob: Blob) {
  const db = await openBlobDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(BLOB_STORE, 'readwrite');
    tx.objectStore(BLOB_STORE).put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function idbGetBlob(id: string): Promise<Blob | null> {
  const db = await openBlobDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(BLOB_STORE, 'readonly');
    const r = tx.objectStore(BLOB_STORE).get(id);
    r.onsuccess = () => res((r.result as Blob) ?? null);
    r.onerror = () => rej(r.error);
  });
}

export async function idbDeleteBlob(id: string) {
  const db = await openBlobDB();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(BLOB_STORE, 'readwrite');
    tx.objectStore(BLOB_STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

