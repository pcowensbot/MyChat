# MyChat Frontend - Key Backup System

## Overview

This implementation provides a **mandatory key backup system** for MyChat's end-to-end encryption. It addresses the critical security concern that PGP keys stored only in browser storage (IndexedDB) are lost when users clear their browser data.

## Problem Statement

**Original Issue:** When users clear browser history/data, their private encryption keys stored in IndexedDB are permanently deleted, making all encrypted messages unrecoverable.

**Solution:** During account registration, users are **required** to download their encryption keys in a password-protected ZIP file before completing registration.

## Key Features

### 🔒 Security

- **Multi-layer encryption:**
  - Layer 1: Keys encrypted with AES-256-GCM using PBKDF2-derived password
  - Layer 2: ZIP file password protection (AES-256)
  - Layer 3: User password protection

- **Password-based key derivation:**
  - Algorithm: PBKDF2-SHA256
  - Iterations: 100,000 (OWASP recommended)
  - Secure salt generation

- **RSA-4096 key pairs:**
  - Strong asymmetric encryption
  - Client-side generation (keys never sent to server)
  - Public key sent to server, private key stays on device

### 📦 Backup File Contents

The downloaded ZIP file (`mychat-keys-{username}-{timestamp}.zip`) contains:

1. **private_key.json** - Encrypted private key with metadata
2. **public_key.json** - Encrypted public key with metadata
3. **README.txt** - Instructions for key storage and restoration

### 🔄 User Flow

#### Registration Flow

1. User fills registration form (username, email, password)
2. System generates RSA-4096 key pair in browser
3. System creates encrypted key backup ZIP
4. **User downloads keys (required)**
5. System displays security warnings and backup instructions
6. **User confirms they've saved the keys (checkbox)**
7. System stores encrypted keys in IndexedDB
8. System sends public key to server
9. Account creation completes

#### Key Restoration Flow

1. User accesses "Restore Keys" on login page
2. User selects backup ZIP file
3. System validates file structure
4. User enters password
5. System decrypts and restores keys to browser
6. User can access encrypted messages

## File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── crypto/
│   │       ├── keys.js           # Core cryptography utilities
│   │       ├── storage.js        # IndexedDB operations
│   │       ├── keyExport.js      # Key backup creation
│   │       └── keyImport.js      # Key restoration
│   └── components/
│       └── auth/
│           ├── RegisterForm.jsx  # Registration with key download
│           ├── RegisterForm.css
│           ├── KeyRestoreForm.jsx # Key restoration interface
│           └── KeyRestoreForm.css
├── package.json
├── vite.config.js
└── README.md (this file)
```

## API Reference

### Key Generation

```javascript
import { generateKeyPair, generateFingerprint } from './lib/crypto/keys.js';

// Generate RSA-4096 key pair
const { publicKey, privateKey } = await generateKeyPair();

// Generate key fingerprint
const fingerprint = await generateFingerprint(publicKey);
// Returns: "A3F2-8B4C-9D1E-7F6A-..."
```

### Key Export

```javascript
import { exportKeysToZip, downloadKeysZip } from './lib/crypto/keyExport.js';

// Create password-protected ZIP
const zipBlob = await exportKeysToZip(
  publicKey,
  privateKey,
  password,
  username
);

// Trigger download
downloadKeysZip(zipBlob, username);
// Downloads: mychat-keys-alice-1234567890.zip
```

### Key Import

```javascript
import { importKeysFromZip } from './lib/crypto/keyImport.js';

// Restore keys from backup
const { publicKey, privateKey } = await importKeysFromZip(
  zipFile,
  password
);
```

### Storage

```javascript
import {
  storeEncryptedPrivateKey,
  storePublicKey,
  retrievePrivateKey,
  hasStoredKeys
} from './lib/crypto/storage.js';

// Store keys in IndexedDB
await storeEncryptedPrivateKey(privateKey, password);
await storePublicKey(publicKey);

// Retrieve keys
const privateKey = await retrievePrivateKey(password);
const hasKeys = await hasStoredKeys();
```

## Security Considerations

### Defense in Depth

1. **Client-side key generation** - Private keys never leave the user's device
2. **Password-based encryption** - Keys encrypted before storage
3. **Dual encryption** - Both AES-256-GCM and ZIP password protection
4. **Mandatory backup** - Users cannot skip key download
5. **User confirmation** - Explicit checkbox confirmation required

### Threat Model

**Protected Against:**
- ✅ Browser data clearing
- ✅ Lost device/computer
- ✅ Browser crashes/corruption
- ✅ IndexedDB data loss
- ✅ Server compromise (private keys never sent)

**NOT Protected Against:**
- ❌ Password compromise (if attacker has both ZIP file and password)
- ❌ Keyloggers on user's device
- ❌ Physical access to unlocked device
- ❌ User losing both password and backup file

### Best Practices for Users

**Recommended Storage Locations:**
- Password manager (1Password, Bitwarden, etc.)
- Encrypted USB drive
- Encrypted cloud storage (with separate password)
- Multiple secure backups in different locations

**NOT Recommended:**
- Unencrypted cloud storage
- Email attachments
- Shared drives
- Public computers

## Installation

```bash
cd frontend
npm install
```

## Dependencies

- **jszip** (^3.10.1) - ZIP file creation with encryption
- **react** (^18.3.1) - UI framework
- **react-router-dom** (^6.22.0) - Routing

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Key Backup System

### Manual Testing Steps

1. **Test Registration:**
   - Navigate to `/register`
   - Fill out form with test credentials
   - Verify key generation progress indicator
   - Check that download is triggered
   - Verify warning messages display
   - Confirm checkbox is required
   - Complete registration

2. **Test Key Download:**
   - Unzip downloaded file manually
   - Verify it contains: `private_key.json`, `public_key.json`, `README.txt`
   - Check file structure matches specification

3. **Test Key Restoration:**
   - Clear browser data (IndexedDB)
   - Navigate to restore keys page
   - Upload previously downloaded ZIP
   - Enter password
   - Verify keys are restored
   - Verify messages decrypt properly

### Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+

**Required APIs:**
- Web Crypto API (window.crypto.subtle)
- IndexedDB
- Blob API
- File API

## Error Handling

The system handles various error scenarios:

- **Invalid ZIP file** - User-friendly error message
- **Wrong password** - Clear feedback without revealing details
- **Corrupted keys** - Validation before restoration
- **Network errors** - Retry mechanisms
- **Browser compatibility** - Feature detection

## Future Enhancements

Potential improvements:

1. **QR Code Backup** - Alternative backup method via QR code
2. **Multiple Backup Formats** - Support for different export formats
3. **Cloud Backup Integration** - Optional encrypted cloud backup
4. **Key Rotation** - Ability to generate new keys and re-encrypt messages
5. **Social Recovery** - Split key recovery with trusted contacts

## Contributing

When making changes to the key backup system:

1. **Never weaken security** - Always maintain or improve encryption strength
2. **Test thoroughly** - Verify all encryption/decryption paths
3. **Document changes** - Update README and code comments
4. **Maintain backwards compatibility** - Support importing old backup formats

## License

Part of the MyChat project - see main repository for license information.

## Support

For issues related to key backup/restoration:

1. Check browser console for detailed error messages
2. Verify file integrity (not corrupted)
3. Confirm password is correct
4. Check browser compatibility
5. Report issues with steps to reproduce

---

**CRITICAL:** This system is the last line of defense against data loss. Any changes must be carefully reviewed and tested.
