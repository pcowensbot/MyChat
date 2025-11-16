/**
 * PGP/RSA Key Generation and Management
 * Implements RSA-4096-OAEP key pair generation for end-to-end encryption
 */

/**
 * Generates a new RSA-4096 key pair for encryption/decryption
 * @returns {Promise<{publicKey: JsonWebKey, privateKey: JsonWebKey}>}
 */
export async function generateKeyPair() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    const publicKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

    return {
      publicKey: publicKeyJWK,
      privateKey: privateKeyJWK
    };
  } catch (error) {
    console.error("Failed to generate key pair:", error);
    throw new Error("Key generation failed: " + error.message);
  }
}

/**
 * Generates a SHA-256 fingerprint for a public key
 * @param {JsonWebKey} publicKeyJWK - The public key in JWK format
 * @returns {Promise<string>} Formatted fingerprint (e.g., "A3F2-8B4C-9D1E-7F6A-...")
 */
export async function generateFingerprint(publicKeyJWK) {
  try {
    const keyString = JSON.stringify(publicKeyJWK);
    const hashBuffer = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(keyString)
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Format as groups of 4 characters separated by hyphens
    return hashHex.match(/.{1,4}/g).join('-').toUpperCase();
  } catch (error) {
    console.error("Failed to generate fingerprint:", error);
    throw new Error("Fingerprint generation failed: " + error.message);
  }
}

/**
 * Converts a JWK public key to PEM format for server storage
 * @param {JsonWebKey} publicKeyJWK - The public key in JWK format
 * @returns {Promise<string>} PEM formatted public key
 */
export async function jwkToPem(publicKeyJWK) {
  try {
    // Import the JWK
    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      publicKeyJWK,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );

    // Export as SPKI (SubjectPublicKeyInfo) format
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);

    // Convert to base64
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
    const exportedAsBase64 = window.btoa(exportedAsString);

    // Format as PEM
    const pemString = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

    return pemString;
  } catch (error) {
    console.error("Failed to convert JWK to PEM:", error);
    throw new Error("JWK to PEM conversion failed: " + error.message);
  }
}

/**
 * Derives an AES-256 key from a password using PBKDF2
 * @param {string} password - User's password
 * @param {Uint8Array} salt - Salt for key derivation (optional, generates if not provided)
 * @returns {Promise<{key: CryptoKey, salt: Uint8Array}>}
 */
export async function deriveKeyFromPassword(password, salt = null) {
  try {
    // Generate salt if not provided
    if (!salt) {
      salt = window.crypto.getRandomValues(new Uint8Array(16));
    }

    // Import password as key material
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    // Derive AES-256 key
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000, // OWASP recommended minimum
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    return { key: derivedKey, salt: salt };
  } catch (error) {
    console.error("Failed to derive key from password:", error);
    throw new Error("Password key derivation failed: " + error.message);
  }
}

/**
 * Helper: Convert ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer) {
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
export function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
