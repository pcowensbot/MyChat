/**
 * IndexedDB Storage for Encrypted Keys
 * Provides secure local storage for encrypted private keys
 */

const DB_NAME = 'MyChatDB';
const DB_VERSION = 1;
const STORE_NAME = 'keys';

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Encrypts and stores a private key in IndexedDB
 * @param {JsonWebKey} privateKeyJWK - Private key to store
 * @param {string} password - Password to encrypt the key
 * @returns {Promise<void>}
 */
export async function storeEncryptedPrivateKey(privateKeyJWK, password) {
  try {
    // Derive encryption key from password
    const { key: passwordKey, salt } = await deriveKeyFromPassword(password);

    // Generate IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the private key
    const encryptedKey = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      passwordKey,
      new TextEncoder().encode(JSON.stringify(privateKeyJWK))
    );

    // Store in IndexedDB
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data = {
      encrypted: arrayBufferToBase64(encryptedKey),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
      timestamp: Date.now()
    };

    await new Promise((resolve, reject) => {
      const request = store.put(data, 'encrypted_private_key');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to store encrypted private key:", error);
    throw new Error("Key storage failed: " + error.message);
  }
}

/**
 * Retrieves and decrypts the private key from IndexedDB
 * @param {string} password - Password to decrypt the key
 * @returns {Promise<JsonWebKey|null>} Decrypted private key or null if not found
 */
export async function retrievePrivateKey(password) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const data = await new Promise((resolve, reject) => {
      const request = store.get('encrypted_private_key');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!data) {
      return null;
    }

    // Derive decryption key from password
    const salt = base64ToArrayBuffer(data.salt);
    const { key: passwordKey } = await deriveKeyFromPassword(password, new Uint8Array(salt));

    // Decrypt the private key
    const iv = base64ToArrayBuffer(data.iv);
    const encryptedData = base64ToArrayBuffer(data.encrypted);

    const decryptedKey = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      passwordKey,
      encryptedData
    );

    const privateKeyJWK = JSON.parse(new TextDecoder().decode(decryptedKey));
    return privateKeyJWK;

  } catch (error) {
    console.error("Failed to retrieve private key:", error);
    // Wrong password will throw here
    throw new Error("Key retrieval failed: " + error.message);
  }
}

/**
 * Stores the public key in IndexedDB (unencrypted, for quick access)
 * @param {JsonWebKey} publicKeyJWK - Public key to store
 * @returns {Promise<void>}
 */
export async function storePublicKey(publicKeyJWK) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data = {
      publicKey: publicKeyJWK,
      timestamp: Date.now()
    };

    await new Promise((resolve, reject) => {
      const request = store.put(data, 'public_key');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to store public key:", error);
    throw new Error("Public key storage failed: " + error.message);
  }
}

/**
 * Retrieves the public key from IndexedDB
 * @returns {Promise<JsonWebKey|null>}
 */
export async function retrievePublicKey() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const data = await new Promise((resolve, reject) => {
      const request = store.get('public_key');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    return data ? data.publicKey : null;
  } catch (error) {
    console.error("Failed to retrieve public key:", error);
    throw new Error("Public key retrieval failed: " + error.message);
  }
}

/**
 * Checks if keys exist in IndexedDB
 * @returns {Promise<boolean>}
 */
export async function hasStoredKeys() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const hasPrivateKey = await new Promise((resolve) => {
      const request = store.get('encrypted_private_key');
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });

    db.close();

    return hasPrivateKey;
  } catch (error) {
    console.error("Failed to check for stored keys:", error);
    return false;
  }
}

/**
 * Clears all stored keys from IndexedDB
 * @returns {Promise<void>}
 */
export async function clearStoredKeys() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await Promise.all([
      new Promise((resolve, reject) => {
        const request = store.delete('encrypted_private_key');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const request = store.delete('public_key');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);

    db.close();
  } catch (error) {
    console.error("Failed to clear stored keys:", error);
    throw new Error("Key clearing failed: " + error.message);
  }
}

// Import helper functions from keys.js
async function deriveKeyFromPassword(password, salt = null) {
  if (!salt) {
    salt = window.crypto.getRandomValues(new Uint8Array(16));
  }

  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return { key: derivedKey, salt: salt };
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
