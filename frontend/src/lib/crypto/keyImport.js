/**
 * Key Import Utility
 * Restores encrypted PGP keys from password-protected ZIP files
 */

import JSZip from 'jszip';
import { decryptData } from './keyExport.js';

/**
 * Imports and decrypts keys from a password-protected ZIP file
 * @param {File} zipFile - The ZIP file containing encrypted keys
 * @param {string} password - Password to decrypt the keys
 * @returns {Promise<{publicKey: JsonWebKey, privateKey: JsonWebKey}>}
 * @throws {Error} If file is invalid, password is wrong, or decryption fails
 */
export async function importKeysFromZip(zipFile, password) {
  try {
    // Load the ZIP file
    const zip = await JSZip.loadAsync(zipFile, { password: password });

    // Check if required files exist
    const privateKeyFile = zip.file("private_key.json");
    const publicKeyFile = zip.file("public_key.json");

    if (!privateKeyFile || !publicKeyFile) {
      throw new Error("Invalid key backup file: missing required key files");
    }

    // Read the encrypted key files
    const privateKeyContent = await privateKeyFile.async("string");
    const publicKeyContent = await publicKeyFile.async("string");

    // Parse the JSON
    let privateKeyData, publicKeyData;
    try {
      privateKeyData = JSON.parse(privateKeyContent);
      publicKeyData = JSON.parse(publicKeyContent);
    } catch (e) {
      throw new Error("Invalid key file format: unable to parse JSON");
    }

    // Validate file structure
    if (privateKeyData.type !== "mychat_encrypted_private_key" ||
        publicKeyData.type !== "mychat_encrypted_public_key") {
      throw new Error("Invalid key backup file: incorrect file type");
    }

    // Decrypt the keys
    let privateKey, publicKey;
    try {
      const decryptedPrivateKey = await decryptData(
        privateKeyData.encrypted,
        privateKeyData.iv,
        privateKeyData.salt,
        password
      );
      privateKey = JSON.parse(decryptedPrivateKey);

      const decryptedPublicKey = await decryptData(
        publicKeyData.encrypted,
        publicKeyData.iv,
        publicKeyData.salt,
        password
      );
      publicKey = JSON.parse(decryptedPublicKey);

    } catch (e) {
      throw new Error("Decryption failed: incorrect password or corrupted file");
    }

    // Validate that these are actually JWK keys
    if (!privateKey.kty || !publicKey.kty) {
      throw new Error("Invalid key format: not valid JWK keys");
    }

    if (privateKey.kty !== "RSA" || publicKey.kty !== "RSA") {
      throw new Error("Invalid key type: expected RSA keys");
    }

    return {
      publicKey: publicKey,
      privateKey: privateKey
    };

  } catch (error) {
    console.error("Failed to import keys from ZIP:", error);
    // Re-throw with a user-friendly message
    if (error.message.includes("password")) {
      throw new Error("Incorrect password or corrupted ZIP file");
    }
    throw error;
  }
}

/**
 * Validates a key backup file without decrypting it
 * @param {File} zipFile - The ZIP file to validate
 * @returns {Promise<{valid: boolean, info?: object, error?: string}>}
 */
export async function validateKeyBackupFile(zipFile) {
  try {
    // Try to load the ZIP (this validates it's a valid ZIP file)
    const zip = await JSZip.loadAsync(zipFile);

    // Check for required files
    const hasPrivateKey = zip.file("private_key.json") !== null;
    const hasPublicKey = zip.file("public_key.json") !== null;
    const hasReadme = zip.file("README.txt") !== null;

    if (!hasPrivateKey || !hasPublicKey) {
      return {
        valid: false,
        error: "Missing required key files"
      };
    }

    // Try to read and parse the metadata (without decrypting)
    const privateKeyFile = zip.file("private_key.json");
    const privateKeyContent = await privateKeyFile.async("string");
    const privateKeyData = JSON.parse(privateKeyContent);

    return {
      valid: true,
      info: {
        version: privateKeyData.version,
        created: privateKeyData.created,
        algorithm: privateKeyData.algorithm,
        hasPrivateKey: hasPrivateKey,
        hasPublicKey: hasPublicKey,
        hasReadme: hasReadme
      }
    };

  } catch (error) {
    return {
      valid: false,
      error: "Invalid or corrupted ZIP file: " + error.message
    };
  }
}

/**
 * Reads the README from a key backup file
 * @param {File} zipFile - The ZIP file
 * @returns {Promise<string|null>} README content or null if not found
 */
export async function readKeyBackupReadme(zipFile) {
  try {
    const zip = await JSZip.loadAsync(zipFile);
    const readmeFile = zip.file("README.txt");

    if (!readmeFile) {
      return null;
    }

    return await readmeFile.async("string");
  } catch (error) {
    console.error("Failed to read README:", error);
    return null;
  }
}
