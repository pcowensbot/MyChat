/**
 * Client-side encryption library using Web Crypto API
 * Implements hybrid RSA + AES encryption for messages
 */

// Helper functions for base64 encoding/decoding
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate RSA key pair for user
 */
export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Export public key
  const publicKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );

  // Export private key
  const privateKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );

  // Convert to PEM format for public key (to match backend)
  const publicKeyPEM = await jwkToPem(publicKeyJWK, 'public');

  return {
    publicKey: publicKeyJWK,
    privateKey: privateKeyJWK,
    publicKeyPEM: publicKeyPEM
  };
}

/**
 * Convert JWK to PEM format
 */
async function jwkToPem(jwk, type) {
  // For simplicity, we'll just use JWK format
  // In production, convert to actual PEM
  return JSON.stringify(jwk);
}

/**
 * Encrypt message for recipient
 */
export async function encryptMessage(messageText, recipientPublicKeyPEM) {
  try {
    // Parse recipient's public key
    const recipientPublicKeyJWK = JSON.parse(recipientPublicKeyPEM);

    // Import recipient's public key
    const recipientPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      recipientPublicKeyJWK,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      false,
      ["encrypt"]
    );

    // Generate random AES key for this message
    const aesKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // Encrypt message with AES key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      new TextEncoder().encode(messageText)
    );

    // Encrypt AES key with recipient's RSA public key
    const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedAESKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      recipientPublicKey,
      exportedAESKey
    );

    return {
      encrypted_content: arrayBufferToBase64(encryptedContent),
      encrypted_key: arrayBufferToBase64(encryptedAESKey),
      iv: arrayBufferToBase64(iv),
      algorithm: "AES-256-GCM+RSA-4096-OAEP"
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt message with private key
 */
export async function decryptMessage(encryptedMessage, privateKeyJWK) {
  try {
    // Import private key
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      privateKeyJWK,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      false,
      ["decrypt"]
    );

    // Decrypt AES key with private RSA key
    const encryptedAESKey = base64ToArrayBuffer(encryptedMessage.encrypted_key);
    const aesKeyData = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedAESKey
    );

    // Import decrypted AES key
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      aesKeyData,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt message content
    const iv = base64ToArrayBuffer(encryptedMessage.iv);
    const encryptedContent = base64ToArrayBuffer(encryptedMessage.encrypted_content);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      encryptedContent
    );

    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Decryption failed]';
  }
}

/**
 * Generate fingerprint from public key
 */
export async function generateFingerprint(publicKeyJWK) {
  const keyString = JSON.stringify(publicKeyJWK);
  const hashBuffer = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(keyString)
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Format as groups of 4 for readability
  return hashHex.match(/.{1,4}/g).join('-').toUpperCase();
}

/**
 * Derive encryption key from password (for encrypting private key)
 */
export async function deriveKeyFromPassword(password, salt = "mychat-salt-v1") {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt private key with password before storing
 */
export async function encryptPrivateKey(privateKeyJWK, password) {
  const passwordKey = await deriveKeyFromPassword(password);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    passwordKey,
    new TextEncoder().encode(JSON.stringify(privateKeyJWK))
  );

  return {
    encrypted: arrayBufferToBase64(encryptedKey),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt private key with password
 */
export async function decryptPrivateKey(encryptedData, password) {
  const passwordKey = await deriveKeyFromPassword(password);

  const iv = base64ToArrayBuffer(encryptedData.iv);
  const encrypted = base64ToArrayBuffer(encryptedData.encrypted);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    passwordKey,
    encrypted
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}
