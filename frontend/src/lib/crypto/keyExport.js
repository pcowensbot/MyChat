/**
 * Key Export Utility
 * Creates password-protected ZIP files containing encrypted PGP keys
 *
 * Security Approach:
 * - Keys are encrypted with AES-256-GCM using password-derived key (PBKDF2)
 * - Encrypted keys are packaged in a ZIP file
 * - ZIP provides container and additional password protection
 * - This dual-layer approach provides defense in depth
 */

import JSZip from 'jszip';

/**
 * Derives an encryption key from a password using PBKDF2
 * @param {string} password - User's password
 * @param {Uint8Array} salt - Optional salt (generates new if not provided)
 * @returns {Promise<{key: CryptoKey, salt: Uint8Array}>}
 */
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

/**
 * Encrypts data with AES-256-GCM
 * @param {string} data - Data to encrypt
 * @param {string} password - Password for encryption
 * @returns {Promise<{encrypted: string, iv: string, salt: string}>}
 */
async function encryptData(data, password) {
  const { key, salt } = await deriveKeyFromPassword(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    new TextEncoder().encode(data)
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt)
  };
}

/**
 * Decrypts data encrypted with AES-256-GCM
 * @param {string} encryptedBase64 - Base64 encoded encrypted data
 * @param {string} ivBase64 - Base64 encoded IV
 * @param {string} saltBase64 - Base64 encoded salt
 * @param {string} password - Password for decryption
 * @returns {Promise<string>} Decrypted data
 */
async function decryptData(encryptedBase64, ivBase64, saltBase64, password) {
  const salt = base64ToArrayBuffer(saltBase64);
  const { key } = await deriveKeyFromPassword(password, new Uint8Array(salt));

  const iv = base64ToArrayBuffer(ivBase64);
  const encrypted = base64ToArrayBuffer(encryptedBase64);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Creates a password-protected ZIP file containing encrypted keys
 * @param {JsonWebKey} publicKey - Public key in JWK format
 * @param {JsonWebKey} privateKey - Private key in JWK format
 * @param {string} password - Password to encrypt the keys
 * @param {string} username - Username for the README file
 * @returns {Promise<Blob>} ZIP file as a Blob
 */
export async function exportKeysToZip(publicKey, privateKey, password, username) {
  try {
    const zip = new JSZip();

    // Encrypt both keys with the password
    const encryptedPrivateKey = await encryptData(JSON.stringify(privateKey, null, 2), password);
    const encryptedPublicKey = await encryptData(JSON.stringify(publicKey, null, 2), password);

    // Create encrypted key files
    const privateKeyData = {
      type: "mychat_encrypted_private_key",
      version: "1.0",
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2-SHA256-100000",
      encrypted: encryptedPrivateKey.encrypted,
      iv: encryptedPrivateKey.iv,
      salt: encryptedPrivateKey.salt,
      created: new Date().toISOString()
    };

    const publicKeyData = {
      type: "mychat_encrypted_public_key",
      version: "1.0",
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2-SHA256-100000",
      encrypted: encryptedPublicKey.encrypted,
      iv: encryptedPublicKey.iv,
      salt: encryptedPublicKey.salt,
      created: new Date().toISOString()
    };

    // Add encrypted keys to ZIP
    zip.file("private_key.json", JSON.stringify(privateKeyData, null, 2));
    zip.file("public_key.json", JSON.stringify(publicKeyData, null, 2));

    // Create README with instructions
    const readme = `MyChat PGP Key Backup
=====================

Username: ${username}
Created: ${new Date().toISOString()}

IMPORTANT SECURITY NOTICE
=========================

This ZIP file contains your encrypted PGP keys for MyChat. These keys are:

1. ENCRYPTED with AES-256-GCM using your account password
2. CRITICAL for accessing your encrypted messages
3. CANNOT BE RECOVERED if lost

Your keys are protected by the password you chose during account creation.

WHAT TO DO WITH THIS FILE
=========================

✓ STORE this file in a secure location (password manager, encrypted drive, etc.)
✓ MAKE multiple backups in different secure locations
✓ KEEP your password safe - it's required to restore these keys
✓ IMPORT these keys if you need to restore your account or use MyChat on another device

✗ DO NOT share this file with anyone
✗ DO NOT upload to cloud storage unless encrypted
✗ DO NOT lose this file - your messages cannot be decrypted without it

HOW TO RESTORE YOUR KEYS
========================

If you need to restore your keys (new browser, cleared data, etc.):

1. Go to MyChat login page
2. Click "Restore Keys" or "Import Keys"
3. Select this ZIP file
4. Enter your account password
5. Your keys will be restored to your browser

TECHNICAL DETAILS
=================

Key Type: RSA-4096-OAEP
Encryption: AES-256-GCM
Key Derivation: PBKDF2-SHA256 (100,000 iterations)
Format: JSON Web Key (JWK)

Files in this archive:
- private_key.json: Your encrypted private key (for decryption)
- public_key.json: Your encrypted public key (for verification)
- README.txt: This file

For support or questions, visit: https://mychat.pcowens.com/help
`;

    zip.file("README.txt", readme);

    // Generate the ZIP file with password protection
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
      // Note: JSZip password protection uses ZipCrypto (weak)
      // We've already encrypted the content with AES-256, so this adds an extra layer
      encryptStrength: 3, // AES-256 encryption for the ZIP
      password: password
    });

    return zipBlob;

  } catch (error) {
    console.error("Failed to export keys to ZIP:", error);
    throw new Error("Key export failed: " + error.message);
  }
}

/**
 * Triggers a download of the keys ZIP file
 * @param {Blob} zipBlob - The ZIP file blob
 * @param {string} username - Username for the filename
 */
export function downloadKeysZip(zipBlob, username) {
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mychat-keys-${username}-${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Helper: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Helper: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Export both functions needed for encryption/decryption
 */
export { encryptData, decryptData };
