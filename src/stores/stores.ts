import { browser } from '$app/environment';
import type { Dayjs } from 'dayjs';
import { writable, derived } from 'svelte/store';
import type { ShiftConfig } from './shiftConfigStore';

interface PersistentStoreOptions<T> {
  key: string;
  initialValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  onchange?: (newValue: T, oldValue: T) => void; // modified onchange function
}

type IndexedDBStore<T> = {
  subscribe: (callback: (value: T) => void) => () => void;
  set: (value: T) => void;
  update: (callback: (value: T) => T) => void;
}

export function createIndexedDBStore<T>(options: PersistentStoreOptions<T>): IndexedDBStore<T> {
  if (!browser) {
    const noDB = writable<T>(options.initialValue);
    return {
      set: noDB.set,
      subscribe: noDB.subscribe,
      update: noDB.update,
    }
  }

  const { key, initialValue, serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const dbName = 'myDB';
  const storeName = 'myStore';

  const store = writable<T>(initialValue, () => {
    let db;
    const request = window.indexedDB.open(dbName);

    request.onupgradeneeded = event => {
      db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(storeName, { keyPath: 'key' });
    };

    request.onsuccess = event => {
      db = (event.target as IDBOpenDBRequest).result;

      const transaction = db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const getItemRequest = objectStore.get(key);
      getItemRequest.onsuccess = () => {
        const valueFromDB = getItemRequest.result;
        if (valueFromDB !== undefined) {
          const value = deserialize(valueFromDB.value);
          store.set(value);
        }
      };
    };

    return () => {
      // clanuep function
    }
  });

  store.subscribe(value => {
    let db;
    const request = window.indexedDB.open(dbName);

    request.onupgradeneeded = event => {
      db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(storeName, { keyPath: 'key' });
    };

    request.onsuccess = event => {
      db = (event.target as IDBOpenDBRequest).result;

      const transaction = db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      objectStore.put({ key, value: serialize(value) });

      if (options.onchange) {
        transaction.oncomplete = () => {
          if (options.onchange) {
            options.onchange(value, initialValue); // pass the old value to onchange
          }
        };
      }
    };
  });

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
  };
}


