the server hardware running this project

Hal-Inhouse chatbot
### Server Specs
- **CPU:** Intel Xeon E5-2687W v3 (10c/20t @ 3.1GHz)
- **RAM:**128GB 4 sticks total(Samsung 32GB 2Rx4 PC4-2133P-R ECC REG RDIMM)
- **MB:** GIGABYTE GA-X99-UD4P
- **GPU:**GTX 1050: ~75W
- **GPU:**GTX 1070: ~180W
- **OS:**Ubuntu 22.04 LTS (Jammy Jellyfish)
- **HDD:**4tb NVME drive
- **PS:** 1000watt gold powersupply

this server is already setup with this chatbot app

https://github.com/pcowensbot/Hal-InHouse

its located on this server too and is located in ~/hal

i would like this new "MyChat" app to run long side my other app "Hal-InHouse"
MyChat: Federated Privacy-First Chat System
Complete Technical Specification v1.0

🎯 Executive Summary
MyChat is a federated, end-to-end encrypted chat system designed to reclaim digital privacy from centralized platforms. It enables individuals and communities to run their own chat nodes while maintaining secure, private communication across the federated network.
Core Philosophy

"Private conversations, transparent patterns. Community-owned infrastructure, individual privacy."

Key Principles

Privacy by Design: E2EE for content, transparent metadata for lawful oversight
Decentralization: No single point of control or failure
Simplicity: Easy for users, manageable for operators
Sustainability: Community-funded, no ads, no data mining
Transparency: Open source, auditable, honest about what we protect (and don't)


📋 Table of Contents

System Architecture
Technology Stack
Database Schema
Encryption Protocol
API Specifications
Federation Protocol
Frontend Architecture
Admin Dashboard
Donation System
Deployment Guide
Security Considerations
Performance & Scalability
Legal Compliance
Future Enhancements


🏗️ System Architecture
High-Level Overview
┌─────────────────────────────────────────────────────────┐
│                    USER DEVICES                         │
│  (Web Browser, Mobile App, Desktop App)                 │
│  ┌──────────────────────────────────────┐               │
│  │  Client-Side Encryption Layer        │               │
│  │  • RSA Key Pair Generation           │               │
│  │  • Message Encryption/Decryption     │               │
│  │  • Local Key Storage                 │               │
│  └──────────────────────────────────────┘               │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS/WSS (TLS)
                      ↓
┌─────────────────────────────────────────────────────────┐
│              NODE: mychat.pcowens.com                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │              Nginx (Reverse Proxy)              │    │
│  │  • TLS Termination (Let's Encrypt)              │    │
│  │  • Static File Serving                          │    │
│  │  • Request Routing                              │    │
│  └─────────────────────────────────────────────────┘    │
│                      ↓                                   │
│  ┌──────────────┬────────────────┬──────────────┐       │
│  │              │                │              │       │
│  │  FastAPI     │   WebSocket    │  Federation  │       │
│  │  REST API    │   Server       │  Service     │       │
│  │              │                │              │       │
│  │  • Auth      │   • Real-time  │  • Node      │       │
│  │  • Messages  │     Updates    │    Discovery │       │
│  │  • Users     │   • Presence   │  • Message   │       │
│  │  • Groups    │   • Typing     │    Routing   │       │
│  │  • Admin     │     Indicators │  • Key       │       │
│  │              │                │    Exchange  │       │
│  └──────────────┴────────────────┴──────────────┘       │
│                      ↓                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Data Layer                         │    │
│  │  ┌────────────────┐    ┌──────────────────┐    │    │
│  │  │  PostgreSQL    │    │  Redis Cache     │    │    │
│  │  │  • Users       │    │  • Sessions      │    │    │
│  │  │  • Messages    │    │  • Presence      │    │    │
│  │  │  • Keys        │    │  • Rate Limiting │    │    │
│  │  │  • Groups      │    │                  │    │    │
│  │  └────────────────┘    └──────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────┘
                      │ Federation Protocol (HTTPS)
                      ↓
┌─────────────────────────────────────────────────────────┐
│         OTHER FEDERATED NODES                           │
│  • chat.alicesdomain.com                                │
│  • secure.bobsnode.org                                  │
│  • privacy.charlies.net                                 │
└─────────────────────────────────────────────────────────┘
Component Breakdown
1. Client Layer (Frontend)

Single-page React application
Web Crypto API for client-side encryption
IndexedDB for local key storage
Progressive Web App (PWA) capable

2. API Layer (Backend Services)

REST API: User management, message CRUD, admin operations
WebSocket Server: Real-time message delivery, presence
Federation Service: Node-to-node communication

3. Data Layer

PostgreSQL: Persistent storage (users, encrypted messages, metadata)
Redis: Caching, sessions, real-time data

4. Proxy Layer

Nginx: TLS termination, static file serving, load balancing


💻 Technology Stack
Backend
yamlPrimary Language: Python 3.11+
Framework: FastAPI
  - Async/await support
  - Automatic OpenAPI documentation
  - High performance
  - Built-in validation (Pydantic)

Database: PostgreSQL 15+
  - JSONB support for flexible data
  - Full-text search capabilities
  - Robust ACID compliance

Cache/Session Store: Redis 7+
  - In-memory performance
  - Pub/Sub for real-time features
  - Session management

Web Server: Nginx 1.24+
  - Reverse proxy
  - TLS termination
  - Static file serving

Process Manager: systemd
  - Service management
  - Auto-restart on failure
  - Logging integration
Frontend
yamlFramework: React 18+
  - Component-based architecture
  - Hooks for state management
  - Virtual DOM performance

State Management: 
  - React Context API (simple state)
  - Zustand (complex state, optional)

UI Components:
  - Tailwind CSS (utility-first styling)
  - shadcn/ui (accessible components)
  - Lucide React (icons)

Crypto Library: Web Crypto API
  - Native browser crypto
  - RSA-OAEP encryption
  - AES-GCM for symmetric operations

Real-time: WebSocket API
  - Native browser WebSocket
  - Automatic reconnection

Build Tool: Vite
  - Fast development server
  - Optimized production builds
DevOps
yamlDeployment: Native systemd services
Container Option (Future): Docker + Docker Compose
SSL Certificates: Let's Encrypt (Certbot)
Monitoring: 
  - systemd journal
  - Custom admin dashboard
Backup: pg_dump + cron
Version Control: Git
CI/CD (Future): GitHub Actions

🗄️ Database Schema
PostgreSQL Tables
sql-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    domain VARCHAR(255) NOT NULL, -- e.g., 'mychat.pcowens.com'
    full_handle VARCHAR(306) GENERATED ALWAYS AS (username || '@' || domain) STORED,
    email VARCHAR(255), -- Optional, for local users only
    password_hash VARCHAR(255), -- For local users only (bcrypt)
    public_key TEXT NOT NULL, -- PEM format RSA public key
    public_key_fingerprint VARCHAR(64) NOT NULL, -- SHA-256 hash for verification
    is_local BOOLEAN DEFAULT TRUE, -- TRUE if registered on this node
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP,
    avatar_url TEXT,
    status_message VARCHAR(280),
    
    UNIQUE(username, domain),
    INDEX idx_full_handle (full_handle),
    INDEX idx_last_seen (last_seen),
    INDEX idx_is_local (is_local)
);

-- ============================================================================
-- CONTACTS TABLE
-- ============================================================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(100), -- Optional custom name
    added_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP,
    
    UNIQUE(user_id, contact_id),
    INDEX idx_user_contacts (user_id, last_message_at DESC)
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    
    -- Encrypted content (base64)
    encrypted_content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file'
    
    -- Metadata (UNENCRYPTED - visible to node operators)
    sender_handle VARCHAR(306) NOT NULL,
    recipient_handle VARCHAR(306),
    message_size INTEGER NOT NULL, -- bytes
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'delivered', 'read', 'failed'
    
    -- For federation
    origin_node VARCHAR(255), -- Which node originated this message
    
    CHECK (
        (recipient_id IS NOT NULL AND group_id IS NULL) OR
        (recipient_id IS NULL AND group_id IS NOT NULL)
    ),
    
    INDEX idx_recipient_messages (recipient_id, created_at DESC),
    INDEX idx_sender_messages (sender_id, created_at DESC),
    INDEX idx_group_messages (group_id, created_at DESC),
    INDEX idx_created_at (created_at DESC)
);

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Group encryption key (encrypted for each member individually)
    -- Stored in group_members table
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    avatar_url TEXT,
    description TEXT,
    
    -- Settings
    max_members INTEGER DEFAULT 50,
    is_public BOOLEAN DEFAULT FALSE,
    
    INDEX idx_creator (creator_id)
);

-- ============================================================================
-- GROUP MEMBERS TABLE
-- ============================================================================
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Encrypted group key (encrypted with user's public key)
    encrypted_group_key TEXT NOT NULL,
    
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP,
    
    UNIQUE(group_id, user_id),
    INDEX idx_group_members (group_id),
    INDEX idx_user_groups (user_id)
);

-- ============================================================================
-- FEDERATED NODES TABLE
-- ============================================================================
CREATE TABLE federated_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    federation_api_url TEXT NOT NULL,
    
    -- Discovery info
    server_version VARCHAR(50),
    public_key TEXT, -- Node's public key for verification
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'blocked', 'offline'
    last_seen TIMESTAMP,
    
    -- Stats
    user_count INTEGER DEFAULT 0,
    avg_latency_ms INTEGER,
    
    -- Settings
    auto_discovered BOOLEAN DEFAULT TRUE,
    manually_added BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_status (status),
    INDEX idx_last_seen (last_seen DESC)
);

-- ============================================================================
-- MESSAGE QUEUE (for federation)
-- ============================================================================
CREATE TABLE message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    target_node VARCHAR(255) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    
    created_at TIMESTAMP DEFAULT NOW(),
    next_attempt_at TIMESTAMP DEFAULT NOW(),
    last_error TEXT,
    
    INDEX idx_pending (status, next_attempt_at) WHERE status = 'pending'
);

-- ============================================================================
-- FILE ATTACHMENTS TABLE
-- ============================================================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Encrypted file data
    encrypted_data BYTEA, -- For small files
    file_path TEXT, -- For larger files stored on disk
    
    -- Metadata
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER NOT NULL,
    
    -- Encryption info
    encryption_method VARCHAR(50) DEFAULT 'AES-256-GCM',
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- Optional expiration
    
    INDEX idx_message_attachments (message_id)
);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_token (token),
    INDEX idx_user_sessions (user_id, last_activity DESC),
    INDEX idx_expires (expires_at)
);

-- ============================================================================
-- LEGAL COMPLIANCE TABLES
-- ============================================================================

-- Legal requests (subpoenas, warrants)
CREATE TABLE legal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- Request details
    authority_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    case_number VARCHAR(100),
    
    -- Document
    document_path TEXT, -- Path to uploaded legal document
    document_hash VARCHAR(64), -- SHA-256 for integrity
    
    -- Scope
    target_users TEXT[], -- Array of user handles
    date_range_start TIMESTAMP,
    date_range_end TIMESTAMP,
    data_requested TEXT, -- Description of data requested
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'under_review', 'fulfilled', 'denied'
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- Response
    report_path TEXT, -- Path to generated report
    fulfilled_at TIMESTAMP,
    denial_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
);

-- Audit log for legal requests
CREATE TABLE legal_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES legal_requests(id) ON DELETE CASCADE,
    
    action VARCHAR(100) NOT NULL, -- 'created', 'reviewed', 'fulfilled', 'denied'
    performed_by UUID REFERENCES users(id),
    details JSONB,
    
    timestamp TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_request_log (request_id, timestamp DESC)
);

-- ============================================================================
-- DONATION SYSTEM TABLES
-- ============================================================================

-- Node donation settings
CREATE TABLE node_donation_settings (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    custom_message TEXT,
    monthly_goal DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crypto wallet addresses
CREATE TABLE donation_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_type VARCHAR(50) NOT NULL, -- 'bitcoin', 'ethereum', 'monero', etc.
    wallet_address TEXT NOT NULL,
    label VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_display_order (display_order)
);

-- Other payment links (Patreon, Ko-fi, etc.)
CREATE TABLE donation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL, -- 'patreon', 'kofi', 'github_sponsors', etc.
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_display_order (display_order)
);

-- Anonymous donation analytics (no PII)
CREATE TABLE donation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'wallet_copied', 'link_clicked'
    wallet_type VARCHAR(50),
    platform VARCHAR(50),
    
    timestamp TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_timestamp (timestamp DESC)
);

-- ============================================================================
-- SYSTEM CONFIGURATION TABLE
-- ============================================================================
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Insert default config
INSERT INTO system_config (key, value, description) VALUES
    ('node_domain', 'mychat.pcowens.com', 'This node''s domain'),
    ('max_users', '500', 'Maximum users allowed on this node'),
    ('federation_enabled', 'true', 'Allow federation with other nodes'),
    ('registration_open', 'true', 'Allow new user registrations'),
    ('max_message_size', '10485760', 'Max message size in bytes (10MB)'),
    ('max_file_size', '52428800', 'Max file attachment size (50MB)'),
    ('session_timeout_hours', '168', 'Session timeout (7 days)');
```

### Redis Schema
```
# Session storage
session:{token} → {user_id, expires_at, ip, user_agent}
TTL: session_timeout_hours

# User presence
presence:{user_id} → {status, last_seen}
TTL: 300 seconds (5 minutes, refreshed by heartbeat)

# Typing indicators
typing:{user_id}:{conversation_id} → timestamp
TTL: 5 seconds

# Rate limiting
ratelimit:{ip}:{endpoint} → request_count
TTL: 60 seconds

# WebSocket connections
ws:connections:{user_id} → Set of connection_ids

# Cached public keys (federation)
pubkey:{user_handle} → {public_key, fingerprint}
TTL: 3600 seconds (1 hour)

# Message delivery queue (temporary)
delivery:{recipient_id} → List of pending message_ids

🔐 Encryption Protocol
Overview
MyChat uses hybrid encryption combining RSA (asymmetric) and AES (symmetric) for optimal security and performance.
Key Generation (Client-Side)
javascript// Executed in user's browser on first registration
async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096, // Strong key
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  
  // Export public key (send to server)
  const publicKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );
  
  // Export private key (store locally, encrypted)
  const privateKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );
  
  return {
    publicKey: publicKeyJWK,
    privateKey: privateKeyJWK
  };
}
Private Key Storage
javascript// Encrypt private key with user's password before storing
async function encryptPrivateKey(privateKeyJWK, password) {
  // Derive key from password (PBKDF2)
  const passwordKey = await deriveKeyFromPassword(password);
  
  // Encrypt private key
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    passwordKey,
    new TextEncoder().encode(JSON.stringify(privateKeyJWK))
  );
  
  // Store in IndexedDB
  await storeInIndexedDB('encrypted_private_key', {
    encrypted: arrayBufferToBase64(encryptedKey),
    iv: arrayBufferToBase64(iv)
  });
}

async function deriveKeyFromPassword(password) {
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
      salt: enc.encode("mychat-salt-v1"), // In production, use random salt
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

### Mandatory Key Backup System (CRITICAL SECURITY FEATURE)

**Problem:** Private keys stored only in IndexedDB are lost when users clear browser data, making all encrypted messages permanently inaccessible.

**Solution:** During registration, users MUST download a password-protected ZIP file containing their encrypted keys before completing account creation.

#### Implementation:

```javascript
// 1. After key generation, create encrypted backup
import JSZip from 'jszip';

async function createKeyBackup(publicKey, privateKey, password, username) {
  const zip = new JSZip();

  // Encrypt keys with AES-256-GCM (defense in depth)
  const encryptedPrivateKey = await encryptKeyForBackup(privateKey, password);
  const encryptedPublicKey = await encryptKeyForBackup(publicKey, password);

  // Add encrypted keys to ZIP with metadata
  zip.file("private_key.json", JSON.stringify({
    type: "mychat_encrypted_private_key",
    version: "1.0",
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256-100000",
    encrypted: encryptedPrivateKey.encrypted,
    iv: encryptedPrivateKey.iv,
    salt: encryptedPrivateKey.salt,
    created: new Date().toISOString()
  }, null, 2));

  zip.file("public_key.json", JSON.stringify({
    type: "mychat_encrypted_public_key",
    version: "1.0",
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256-100000",
    encrypted: encryptedPublicKey.encrypted,
    iv: encryptedPublicKey.iv,
    salt: encryptedPublicKey.salt,
    created: new Date().toISOString()
  }, null, 2));

  // Add README with instructions
  zip.file("README.txt", generateKeyBackupReadme(username));

  // Generate password-protected ZIP
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
    encryptStrength: 3, // AES-256 ZIP encryption
    password: password
  });

  return zipBlob;
}

// 2. Trigger download
function downloadKeyBackup(zipBlob, username) {
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mychat-keys-${username}-${Date.now()}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
```

#### Registration Flow (Updated):

1. User fills registration form (username, email, password)
2. Client generates RSA-4096 key pair
3. Client creates encrypted key backup ZIP
4. **Client triggers key download and waits for user confirmation**
5. **User MUST confirm they've saved the keys before proceeding**
6. Client stores encrypted keys in IndexedDB
7. Client sends public key to server
8. Server creates account and returns auth token

#### Key Restore Flow:

Users can restore their keys from the backup ZIP file:

```javascript
// Import keys from backup
async function restoreKeysFromBackup(zipFile, password) {
  const zip = await JSZip.loadAsync(zipFile, { password: password });

  // Read encrypted key files
  const privateKeyData = JSON.parse(await zip.file("private_key.json").async("string"));
  const publicKeyData = JSON.parse(await zip.file("public_key.json").async("string"));

  // Decrypt keys
  const privateKey = await decryptKeyFromBackup(privateKeyData, password);
  const publicKey = await decryptKeyFromBackup(publicKeyData, password);

  // Store in IndexedDB
  await storeEncryptedPrivateKey(privateKey, password);
  await storePublicKey(publicKey);

  return { publicKey, privateKey };
}
```

#### Security Layers:

1. **Layer 1:** Keys encrypted with AES-256-GCM using PBKDF2-derived password key
2. **Layer 2:** ZIP file password-protected (AES-256 ZIP encryption)
3. **Layer 3:** User must keep password secret (same as account password)

#### User Experience:

**During Registration:**
- Clear warning about importance of key backup
- Visual confirmation that download completed
- Checkbox: "I confirm I have saved my encryption keys securely"
- Cannot proceed without downloading and confirming

**During Key Restore:**
- Simple file upload interface
- Password entry
- Automatic key restoration to browser
- Validation of backup file integrity

#### Files Created:

- `frontend/src/lib/crypto/keyExport.js` - Key backup creation
- `frontend/src/lib/crypto/keyImport.js` - Key restoration
- `frontend/src/components/auth/RegisterForm.jsx` - Registration with mandatory download
- `frontend/src/components/auth/KeyRestoreForm.jsx` - Key restoration UI

Message Encryption (1-on-1)
javascript// Encrypt message for recipient
async function encryptMessage(messageText, recipientPublicKey) {
  // 1. Generate random AES key for this message
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  // 2. Encrypt message with AES key
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    new TextEncoder().encode(messageText)
  );
  
  // 3. Encrypt AES key with recipient's RSA public key
  const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedAESKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    exportedAESKey
  );
  
  // 4. Package everything together
  return {
    encrypted_content: arrayBufferToBase64(encryptedContent),
    encrypted_key: arrayBufferToBase64(encryptedAESKey),
    iv: arrayBufferToBase64(iv),
    algorithm: "AES-256-GCM+RSA-4096-OAEP"
  };
}
Message Decryption
javascriptasync function decryptMessage(encryptedMessage, privateKey) {
  // 1. Decrypt AES key with private RSA key
  const encryptedAESKey = base64ToArrayBuffer(encryptedMessage.encrypted_key);
  const aesKeyData = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedAESKey
  );
  
  // 2. Import decrypted AES key
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    aesKeyData,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  
  // 3. Decrypt message content
  const iv = base64ToArrayBuffer(encryptedMessage.iv);
  const encryptedContent = base64ToArrayBuffer(encryptedMessage.encrypted_content);
  
  const decryptedContent = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    encryptedContent
  );
  
  // 4. Convert to text
  return new TextDecoder().decode(decryptedContent);
}
Group Chat Encryption
javascript// Group admin generates shared key
async function createGroupKey() {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt group key for each member
async function encryptGroupKeyForMember(groupKey, memberPublicKey) {
  const exportedKey = await window.crypto.subtle.exportKey("raw", groupKey);
  
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    memberPublicKey,
    exportedKey
  );
  
  return arrayBufferToBase64(encryptedKey);
}

// Encrypt message for group
async function encryptGroupMessage(messageText, groupKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    groupKey,
    new TextEncoder().encode(messageText)
  );
  
  return {
    encrypted_content: arrayBufferToBase64(encryptedContent),
    iv: arrayBufferToBase64(iv),
    algorithm: "AES-256-GCM"
  };
}
File/Image Encryption
javascriptasync function encryptFile(fileArrayBuffer, recipientPublicKey) {
  // Same hybrid approach as messages
  // 1. Generate random AES key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  // 2. Encrypt file with AES
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedFile = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    fileArrayBuffer
  );
  
  // 3. Encrypt AES key with recipient's public key
  const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedAESKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    exportedAESKey
  );
  
  return {
    encrypted_file: encryptedFile,
    encrypted_key: arrayBufferToBase64(encryptedAESKey),
    iv: arrayBufferToBase64(iv)
  };
}
Key Fingerprint Verification
javascript// Generate human-readable fingerprint for public key
async function generateFingerprint(publicKeyJWK) {
  const keyString = JSON.stringify(publicKeyJWK);
  const hashBuffer = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(keyString)
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format as groups of 4 for readability
  return hashHex.match(/.{1,4}/g).join('-').toUpperCase();
  // Example: A3F2-8B4C-9D1E-7F6A-...
}

// Users can verify fingerprints out-of-band (phone call, in person)

🌐 API Specifications
REST API Endpoints
Authentication
httpPOST /api/auth/register
Content-Type: application/json

Request:
{
  "username": "alice",
  "password": "secure_password_here",
  "email": "alice@example.com",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "public_key_fingerprint": "A3F2-8B4C-9D1E-7F6A-..."
}

Response: 201 Created
{
  "user_id": "uuid",
  "full_handle": "alice@mychat.pcowens.com",
  "token": "jwt_token_here"
}
httpPOST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "alice",
  "password": "secure_password_here"
}

Response: 200 OK
{
  "user_id": "uuid",
  "full_handle": "alice@mychat.pcowens.com",
  "token": "jwt_token_here",
  "public_key_fingerprint": "A3F2-8B4C-9D1E-7F6A-..."
}
httpPOST /api/auth/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Logged out successfully"
}
User Management
httpGET /api/users/me
Authorization: Bearer {token}

Response: 200 OK
{
  "user_id": "uuid",
  "username": "alice",
  "full_handle": "alice@mychat.pcowens.com",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "public_key_fingerprint": "A3F2-8B4C-9D1E-7F6A-...",
  "avatar_url": "https://...",
  "status_message": "Hello world!",
  "created_at": "2025-01-15T10:30:00Z",
  "last_seen": "2025-11-15T14:22:00Z"
}
httpGET /api/users/{handle}
Authorization: Bearer {token}

Example: GET /api/users/bob@othernode.com

Response: 200 OK
{
  "user_id": "uuid",
  "full_handle": "bob@othernode.com",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "public_key_fingerprint": "B4E3-7C5D-8A2F-6E9B-...",
  "avatar_url": "https://...",
  "is_local": false,
  "last_seen": "2025-11-15T14:20:00Z"
}
httpPUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "avatar_url": "https://...",
  "status_message": "Working from home today"
}

Response: 200 OK
{
  "message": "Profile updated"
}
Contacts
httpGET /api/contacts
Authorization: Bearer {token}

Response: 200 OK
{
  "contacts": [
    {
      "contact_id": "uuid",
      "full_handle": "bob@othernode.com",
      "nickname": "Bobby",
      "public_key_fingerprint": "B4E3-7C5D-...",
      "avatar_url": "https://...",
      "last_message_at": "2025-11-15T14:20:00Z",
      "unread_count": 3
    }
  ]
}
httpPOST /api/contacts
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "contact_handle": "bob@othernode.com",
  "nickname": "Bobby"
}

Response: 201 Created
{
  "contact_id": "uuid",
  "full_handle": "bob@othernode.com",
  "public_key": "...",
  "public_key_fingerprint": "..."
}
Messages
httpPOST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "recipient_handle": "bob@othernode.com",
  "encrypted_content": "base64_encrypted_data",
  "encrypted_key": "base64_encrypted_aes_key",
  "iv": "base64_initialization_vector",
  "content_type": "text",
  "algorithm": "AES-256-GCM+RSA-4096-OAEP"
}

Response: 201 Created
{
  "message_id": "uuid",
  "created_at": "2025-11-15T14:22:00Z",
  "status": "pending"
}
httpGET /api/messages/conversation/{handle}
Authorization: Bearer {token}

Query params:
  - limit: int (default 50, max 100)
  - before: timestamp (for pagination)

Example: GET /api/messages/conversation/bob@othernode.com?limit=50

Response: 200 OK
{
  "messages": [
    {
      "message_id": "uuid",
      "sender_handle": "alice@mychat.pcowens.com",
      "recipient_handle": "bob@othernode.com",
      "encrypted_content": "...",
      "encrypted_key": "...",
      "iv": "...",
      "content_type": "text",
      "created_at": "2025-11-15T14:22:00Z",
      "delivered_at": "2025-11-15T14:22:01Z",
      "read_at": null,
      "status": "delivered"
    }
  ],
  "has_more": true,
  "next_cursor": "2025-11-15T14:20:00Z"
}
httpPUT /api/messages/{message_id}/read
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Message marked as read"
}
Groups
httpPOST /api/groups
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "name": "Weekend Plans",
  "description": "Planning our hiking trip",
  "member_handles": [
    "bob@othernode.com",
    "charlie@mychat.pcowens.com"
  ],
  "encrypted_group_keys": {
    "bob@othernode.com": "base64_encrypted_key_for_bob",
    "charlie@mychat.pcowens.com": "base64_encrypted_key_for_charlie"
  }
}

Response: 201 Created
{
  "group_id": "uuid",
  "name": "Weekend Plans",
  "creator_handle": "alice@mychat.pcowens.com",
  "created_at": "2025-11-15T14:30:00Z"
}
httpGET /api/groups/{group_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "group_id": "uuid",
  "name": "Weekend Plans",
  "description": "Planning our hiking trip",
  "creator_handle": "alice@mychat.pcowens.com",
  "members": [
    {
      "user_handle": "alice@mychat.pcowens.com",
      "role": "admin",
      "joined_at": "2025-11-15T14:30:00Z"
    },
    {
      "user_handle": "bob@othernode.com",
      "role": "member",
      "joined_at": "2025-11-15T14:31:00Z"
    }
  ],
  "encrypted_group_key": "base64_encrypted_key_for_me",
  "created_at": "2025-11-15T14:30:00Z"
}
httpPOST /api/groups/{group_id}/messages
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "encrypted_content": "base64_encrypted_data",
  "iv": "base64_iv",
  "content_type": "text"
}

Response: 201 Created
{
  "message_id": "uuid",
  "created_at": "2025-11-15T14:35:00Z"
}
File Attachments
httpPOST /api/attachments
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
- encrypted_file: binary data
- encrypted_key: string (base64)
- iv: string (base64)
- filename: string
- mime_type: string
- recipient_handle: string

Response: 201 Created
{
  "attachment_id": "uuid",
  "filename": "photo.jpg.encrypted",
  "file_size": 524288,
  "download_url": "/api/attachments/{uuid}/download"
}
httpGET /api/attachments/{attachment_id}/download
Authorization: Bearer {token}

Response: 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="encrypted_file"

[Binary encrypted file data]
Public Key Discovery
httpGET /api/keys/{handle}

Example: GET /api/keys/bob@othernode.com

Response: 200 OK
{
  "full_handle": "bob@othernode.com",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "public_key_fingerprint": "B4E3-7C5D-8A2F-6E9B-...",
  "verified": false
}
Node Information
httpGET /api/node/info

Response: 200 OK
{
  "domain": "mychat.pcowens.com",
  "version": "1.0.0",
  "federation_enabled": true,
  "registration_open": true,
  "max_users": 500,
  "current_users": 127,
  "federated_nodes": 12,
  "uptime_seconds": 4075200
}
Donations (Public)
httpGET /api/node/donations

Response: 200 OK
{
  "enabled": true,
  "message": "Help keep mychat.pcowens.com running! Server costs: ~$15/month",
  "wallets": [
    {
      "type": "bitcoin",
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "label": "Bitcoin",
      "qr_code": "data:image/png;base64,..."
    },
    {
      "type": "ethereum",
      "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      "label": "Ethereum",
      "qr_code": "data:image/png;base64,..."
    }
  ],
  "links": [
    {
      "platform": "patreon",
      "url": "https://patreon.com/mychatnode"
    }
  ],
  "monthly_goal": 15.00
}
Admin API Endpoints
httpGET /api/admin/health
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "status": "healthy",
  "uptime_seconds": 4075200,
  "services": {
    "api": "running",
    "websocket": "running",
    "federation": "running",
    "database": "running",
    "redis": "running"
  },
  "resources": {
    "cpu_percent": 42,
    "memory_percent": 35,
    "disk_percent": 18
  }
}
httpGET /api/admin/users
Authorization: Bearer {admin_token}

Query params:
  - page: int
  - limit: int
  - search: string

Response: 200 OK
{
  "users": [...],
  "total": 127,
  "page": 1,
  "pages": 3
}
httpGET /api/admin/legal/requests
Authorization: Bearer {admin_token}

Response: 200 OK
{
  "requests": [
    {
      "request_id": "uuid",
      "request_number": "2025-0342",
      "authority_name": "City Police Department",
      "status": "pending",
      "target_users": ["suspect@mychat.pcowens.com"],
      "created_at": "2025-11-10T09:00:00Z"
    }
  ]
}
httpPOST /api/admin/legal/requests/{request_id}/fulfill
Authorization: Bearer {admin_token}
Content-Type: application/json

Request:
{
  "include_metadata": true,
  "include_contacts": true,
  "include_login_history": true
}

Response: 200 OK
{
  "report_url": "/api/admin/legal/requests/{uuid}/report.pdf",
  "fulfilled_at": "2025-11-15T14:45:00Z"
}
WebSocket API
javascript// Connect to WebSocket
const ws = new WebSocket('wss://mychat.pcowens.com/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token_here'
}));

// Server confirms auth
{
  type: 'auth_success',
  user_id: 'uuid'
}

// Subscribe to events
ws.send(JSON.stringify({
  type: 'subscribe',
  events: ['message', 'typing', 'presence']
}));

// Incoming message
{
  type: 'message',
  data: {
    message_id: 'uuid',
    sender_handle: 'bob@othernode.com',
    encrypted_content: '...',
    encrypted_key: '...',
    iv: '...',
    content_type: 'text',
    created_at: '2025-11-15T14:50:00Z'
  }
}

// Typing indicator
ws.send(JSON.stringify({
  type: 'typing',
  conversation_handle: 'bob@othernode.com',
  is_typing: true
}));

// Receive typing event
{
  type: 'typing',
  user_handle: 'bob@othernode.com',
  is_typing: true
}

// Presence update
{
  type: 'presence',
  user_handle: 'bob@othernode.com',
  status: 'online', // 'online', 'away', 'offline'
  last_seen: '2025-11-15T14:52:00Z'
}

// Heartbeat (keep connection alive)
ws.send(JSON.stringify({ type: 'ping' }));
// Server responds
{ type: 'pong' }

🔗 Federation Protocol
Node Discovery
Each node publishes a discovery endpoint:
httpGET https://mychat.pcowens.com/.well-known/mychat-node

Response: 200 OK
{
  "version": "1.0",
  "domain": "mychat.pcowens.com",
  "federation_api": "https://mychat.pcowens.com/api/federation",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "capabilities": [
    "text_messages",
    "image_sharing",
    "group_chat"
  ],
  "max_message_size": 10485760,
  "statistics": {
    "user_count": 127,
    "uptime_days": 47
  }
}
Federation API Endpoints
Public Key Exchange
httpGET https://mychat.pcowens.com/api/federation/keys/{username}

Example: GET /api/federation/keys/alice

Response: 200 OK
{
  "full_handle": "alice@mychat.pcowens.com",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...",
  "public_key_fingerprint": "A3F2-8B4C-9D1E-7F6A-...",
  "last_updated": "2025-01-15T10:30:00Z"
}

Response: 404 Not Found (user doesn't exist)
Message Delivery
httpPOST https://chat.alicesdomain.com/api/federation/messages
Content-Type: application/json
X-Origin-Node: mychat.pcowens.com
X-Signature: base64_signature

Request:
{
  "message_id": "uuid",
  "sender_handle": "alice@mychat.pcowens.com",
  "recipient_handle": "bob@chat.alicesdomain.com",
  "encrypted_content": "...",
  "encrypted_key": "...",
  "iv": "...",
  "content_type": "text",
  "created_at": "2025-11-15T14:55:00Z"
}

Response: 202 Accepted
{
  "status": "accepted",
  "message_id": "uuid"
}

Response: 404 Not Found
{
  "error": "user_not_found",
  "message": "bob@chat.alicesdomain.com does not exist"
}
Delivery Confirmation
httpPOST https://mychat.pcowens.com/api/federation/delivery-receipt
Content-Type: application/json
X-Origin-Node: chat.alicesdomain.com

Request:
{
  "message_id": "uuid",
  "recipient_handle": "bob@chat.alicesdomain.com",
  "status": "delivered",
  "timestamp": "2025-11-15T14:55:01Z"
}

Response: 200 OK
{
  "acknowledged": true
}
```

### Federation Message Flow
```
Alice@mychat.pcowens.com → Bob@chat.alicesdomain.com

1. Alice's client encrypts message with Bob's public key
   ↓
2. Alice's client → POST /api/messages (local node)
   ↓
3. mychat.pcowens.com recognizes Bob is on different node
   ↓
4. mychat.pcowens.com → Discovers chat.alicesdomain.com
   (GET /.well-known/mychat-node)
   ↓
5. mychat.pcowens.com → POST /api/federation/messages
   (to chat.alicesdomain.com)
   ↓
6. chat.alicesdomain.com validates request
   ↓
7. chat.alicesdomain.com stores message for Bob
   ↓
8. chat.alicesdomain.com → 202 Accepted
   ↓
9. chat.alicesdomain.com → WebSocket push to Bob (if online)
   ↓
10. Bob's client decrypts message with private key
    ↓
11. chat.alicesdomain.com → POST /api/federation/delivery-receipt
    (back to mychat.pcowens.com)
Security & Validation
Node Signature Verification:
python# Each federation request is signed by origin node
import hmac
import hashlib

def sign_federation_request(payload, node_private_key):
    message = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        node_private_key.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature

def verify_federation_request(payload, signature, origin_node_domain):
    # Fetch origin node's public key
    origin_public_key = fetch_node_public_key(origin_node_domain)
    
    # Verify signature
    expected_signature = sign_federation_request(payload, origin_public_key)
    return hmac.compare_digest(signature, expected_signature)
Rate Limiting:
python# Prevent federation abuse
@rate_limit(max_requests=100, window_seconds=60, by='origin_node')
async def receive_federated_message(request):
    # ... handle message
    pass
```

---

## 💎 Frontend Architecture

### Technology Stack
```
React 18+ (Component-based UI)
├── Vite (Build tool)
├── React Router (Navigation)
├── Zustand (State management - optional)
├── Tailwind CSS (Styling)
├── shadcn/ui (UI components)
├── Web Crypto API (Encryption)
├── IndexedDB (Local storage)
└── WebSocket API (Real-time)
```

### Directory Structure
```
frontend/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── chat/
│   │   │   ├── ConversationList.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── contacts/
│   │   │   ├── ContactList.jsx
│   │   │   ├── ContactCard.jsx
│   │   │   └── AddContact.jsx
│   │   ├── groups/
│   │   │   ├── GroupList.jsx
│   │   │   ├── CreateGroup.jsx
│   │   │   └── GroupSettings.jsx
│   │   ├── settings/
│   │   │   ├── ProfileSettings.jsx
│   │   │   ├── SecuritySettings.jsx
│   │   │   └── KeyManagement.jsx
│   │   ├── common/
│   │   │   ├── QRCodeDisplay.jsx
│   │   │   ├── QRCodeScanner.jsx
│   │   │   └── Avatar.jsx
│   │   └── donations/
│   │       └── SupportNodeModal.jsx
│   ├── lib/
│   │   ├── crypto/
│   │   │   ├── keys.js
│   │   │   ├── encryption.js
│   │   │   └── storage.js
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── auth.js
│   │   │   ├── messages.js
│   │   │   └── federation.js
│   │   ├── websocket/
│   │   │   └── client.js
│   │   └── utils/
│   │       ├── formatters.js
│   │       └── validators.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useMessages.js
│   │   ├── useWebSocket.js
│   │   └── useEncryption.js
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── messageStore.js
│   │   └── contactStore.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Chat.jsx
│   │   ├── Contacts.jsx
│   │   ├── Groups.jsx
│   │   └── Settings.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
Key Components
Encryption Hook
javascript// src/hooks/useEncryption.js
import { useState, useCallback } from 'react';
import { encryptMessage, decryptMessage } from '../lib/crypto/encryption';
import { getPrivateKey } from '../lib/crypto/storage';

export function useEncryption() {
  const [isDecrypting, setIsDecrypting] = useState(false);

  const encrypt = useCallback(async (plaintext, recipientPublicKey) => {
    return await encryptMessage(plaintext, recipientPublicKey);
  }, []);

  const decrypt = useCallback(async (encryptedMessage) => {
    setIsDecrypting(true);
    try {
      const privateKey = await getPrivateKey();
      const plaintext = await decryptMessage(encryptedMessage, privateKey);
      return plaintext;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return { encrypt, decrypt, isDecrypting };
}
WebSocket Hook
javascript// src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useWebSocket(onMessage) {
  const wsRef = useRef(null);
  const { token } = useAuthStore();

  const connect = useCallback(() => {
    const ws = new WebSocket('wss://mychat.pcowens.com/ws');
    
    ws.onopen = () => {
      // Authenticate
      ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
      
      // Subscribe to events
      ws.send(JSON.stringify({
        type: 'subscribe',
        events: ['message', 'typing', 'presence']
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    ws.onclose = () => {
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };
    
    wsRef.current = ws;
  }, [token, onMessage]);

  useEffect(() => {
    if (token) {
      connect();
    }
    
    return () => {
      wsRef.current?.close();
    };
  }, [token, connect]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
Message Component
jsx// src/components/chat/MessageList.jsx
import { useEffect, useState } from 'react';
import { useEncryption } from '../../hooks/useEncryption';

export function MessageList({ conversationHandle }) {
  const [messages, setMessages] = useState([]);
  const { decrypt } = useEncryption();

  useEffect(() => {
    async function loadMessages() {
      const response = await fetch(
        `/api/messages/conversation/${conversationHandle}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      // Decrypt all messages
      const decrypted = await Promise.all(
        data.messages.map(async (msg) => ({
          ...msg,
          plaintext: await decrypt(msg)
        }))
      );
      
      setMessages(decrypted);
    }
    
    loadMessages();
  }, [conversationHandle, decrypt]);

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.message_id}
          className={`p-3 rounded-lg ${
            msg.sender_handle === currentUserHandle
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-200 text-black'
          }`}
        >
          <p>{msg.plaintext}</p>
          <span className="text-xs opacity-70">
            {formatTime(msg.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
QR Code Components
jsx// src/components/common/QRCodeDisplay.jsx
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export function QRCodeDisplay({ data, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, JSON.stringify(data), {
        width: size,
        margin: 2
      });
    }
  }, [data, size]);

  return <canvas ref={canvasRef} />;
}
jsx// src/components/common/QRCodeScanner.jsx
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

export function QRCodeScanner({ onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          onScan(data);
          scanner.stop();
        } catch (err) {
          console.error('Invalid QR code data');
        }
      }
    );
    
    scannerRef.current = scanner;
    
    return () => {
      scanner.stop();
    };
  }, [onScan]);

  return <div id="qr-reader" style={{ width: '100%' }}></div>;
}
```

---

## 🛠️ Admin Dashboard

### Dashboard Structure
```
admin-dashboard/
├── src/
│   ├── pages/
│   │   ├── Overview.jsx
│   │   ├── Users.jsx
│   │   ├── Services.jsx
│   │   ├── Federation.jsx
│   │   ├── LegalCompliance.jsx
│   │   ├── Donations.jsx
│   │   └── Settings.jsx
│   ├── components/
│   │   ├── ServiceCard.jsx
│   │   ├── MetricsChart.jsx
│   │   ├── LogViewer.jsx
│   │   └── LegalRequestCard.jsx
│   └── lib/
│       └── api.js
└── ...
Key Features
1. System Health Dashboard
jsx// Overview.jsx
export function Overview() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function fetchHealth() {
      const response = await fetch('/api/admin/health', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      setHealth(await response.json());
    }
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Update every 5s
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <h3>System Status</h3>
        <StatusBadge status={health?.status} />
        <p>Uptime: {formatUptime(health?.uptime_seconds)}</p>
      </Card>
      
      <Card>
        <h3>Active Users</h3>
        <p className="text-4xl">{health?.active_users}</p>
      </Card>
      
      <Card>
        <h3>CPU Usage</h3>
        <ProgressBar value={health?.resources.cpu_percent} />
      </Card>
      
      <Card>
        <h3>Memory Usage</h3>
        <ProgressBar value={health?.resources.memory_percent} />
      </Card>
    </div>
  );
}
2. Service Management
jsx// Services.jsx
export function Services() {
  const services = ['mychat-api', 'mychat-federation', 'mychat-websocket'];

  async function restartService(serviceName) {
    await fetch(`/api/admin/services/${serviceName}/restart`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
  }

  return (
    <div className="space-y-4">
      {services.map(service => (
        <ServiceCard
          key={service}
          name={service}
          onRestart={() => restartService(service)}
        />
      ))}
    </div>
  );
}
3. Legal Compliance Interface
jsx// LegalCompliance.jsx
export function LegalCompliance() {
  const [requests, setRequests] = useState([]);

  async function fulfillRequest(requestId) {
    const response = await fetch(
      `/api/admin/legal/requests/${requestId}/fulfill`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
          include_metadata: true,
          include_contacts: true,
          include_login_history: true
        })
      }
    );
    
    const data = await response.json();
    // Download report
    window.open(data.report_url);
  }

  return (
    <div>
      <h2>Legal Requests</h2>
      {requests.map(req => (
        <LegalRequestCard
          key={req.request_id}
          request={req}
          onFulfill={() => fulfillRequest(req.request_id)}
        />
      ))}
    </div>
  );
}
4. Donation Settings
jsx// Donations.jsx
export function DonationSettings() {
  const [settings, setSettings] = useState({
    enabled: false,
    message: '',
    wallets: []
  });

  async function saveSettings() {
    await fetch('/api/admin/donations/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
  }

  return (
    <div>
      <h2>Donation Settings</h2>
      
      <label>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => setSettings({
            ...settings,
            enabled: e.target.checked
          })}
        />
        Enable Donations
      </label>
      
      <textarea
        value={settings.message}
        onChange={(e) => setSettings({
          ...settings,
          message: e.target.value
        })}
        placeholder="Custom message..."
      />
      
      <h3>Crypto Wallets</h3>
      {settings.wallets.map((wallet, i) => (
        <div key={i}>
          <select
            value={wallet.type}
            onChange={(e) => updateWallet(i, 'type', e.target.value)}
          >
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="monero">Monero</option>
          </select>
          
          <input
            type="text"
            value={wallet.address}
            onChange={(e) => updateWallet(i, 'address', e.target.value)}
            placeholder="Wallet address"
          />
        </div>
      ))}
      
      <button onClick={saveSettings}>Save Settings</button>
    </div>
  );
}

💰 Donation System
Implementation Details
QR Code Generation
python# backend/app/donations/qr.py
import qrcode
import io
import base64

def generate_wallet_qr(wallet_address):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=2,
    )
    qr.add_data(wallet_address)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"
Frontend Display
jsx// components/donations/SupportNodeModal.jsx
export function SupportNodeModal({ isOpen, onClose }) {
  const [donations, setDonations] = useState(null);

  useEffect(() => {
    async function fetchDonations() {
      const response = await fetch('/api/node/donations');
      setDonations(await response.json());
    }
    fetchDonations();
  }, []);

  function copyAddress(address, type) {
    navigator.clipboard.writeText(address);
    
    // Track engagement
    fetch('/api/analytics/donation-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'wallet_copied',
        wallet_type: type
      })
    });
    
    toast.success('Address copied!');
  }

  if (!donations?.enabled) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>☕ Support This Node</h2>
      <p>{donations.message}</p>
      
      <div className="space-y-4">
        {donations.wallets.map(wallet => (
          <div key={wallet.type} className="border p-4 rounded">
            <h3>{wallet.label}</h3>
            <img src={wallet.qr_code} alt="QR Code" className="w-48 h-48" />
            <code className="block mt-2 text-sm">{wallet.address}</code>
            <button onClick={() => copyAddress(wallet.address, wallet.type)}>
              Copy Address
            </button>
          </div>
        ))}
      </div>
      
      <div>
        <h3>Other Ways to Support</h3>
        {donations.links.map(link => (
          
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            {link.platform}
          </a>
        ))}
      </div>
    </Modal>
  );
}

🚀 Deployment Guide
Prerequisites
bash# Server requirements
- Ubuntu 22.04 or 24.04 LTS
- 2GB RAM minimum (1GB possible with SQLite)
- 2 vCPU recommended
- 20GB disk space minimum
- Domain name with DNS configured
- Ports 80, 443 open
One-Command Installation
bashcurl -sSL https://install.mychat.org/setup.sh | sudo bash
Manual Installation Steps
1. System Update
bashsudo apt-get update
sudo apt-get upgrade -y
2. Install Dependencies
bash# Python
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# Database
sudo apt-get install -y postgresql postgresql-contrib

# Cache
sudo apt-get install -y redis-server

# Web server
sudo apt-get install -y nginx

# SSL
sudo apt-get install -y certbot python3-certbot-nginx

# Other
sudo apt-get install -y git curl
3. Create User
bashsudo useradd -r -s /bin/bash -d /opt/mychat -m mychat
4. Clone Repository
bashcd /opt/mychat
sudo -u mychat git clone https://github.com/yourrepo/mychat.git .
5. Setup Python Environment
bashcd /opt/mychat/backend
sudo -u mychat python3.11 -m venv /opt/mychat/venv
sudo -u mychat /opt/mychat/venv/bin/pip install -r requirements.txt
6. Configure PostgreSQL
bash# Create database and user
sudo -u postgres psql <<EOF
CREATE USER mychat WITH PASSWORD 'SECURE_PASSWORD_HERE';
CREATE DATABASE mychat OWNER mychat;
GRANT ALL PRIVILEGES ON DATABASE mychat TO mychat;
EOF

# Optimize for small instance
sudo tee /etc/postgresql/15/main/conf.d/mychat.conf <<EOF
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 100
EOF

sudo systemctl restart postgresql
7. Configure Redis
bashsudo sed -i 's/^# maxmemory .*/maxmemory 100mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
sudo systemctl restart redis
8. Create Configuration
bashsudo -u mychat tee /opt/mychat/config/mychat.conf <<EOF
DOMAIN=mychat.pcowens.com
MAX_USERS=500
DB_HOST=localhost
DB_NAME=mychat
DB_USER=mychat
DB_PASS=SECURE_PASSWORD_HERE
REDIS_HOST=localhost
REDIS_PORT=6379
SECRET_KEY=$(openssl rand -hex 32)
ADMIN_EMAIL=admin@example.com
EOF

sudo chmod 600 /opt/mychat/config/mychat.conf
9. Initialize Database
bashcd /opt/mychat/backend
sudo -u mychat /opt/mychat/venv/bin/python -m app.db.migrate
10. Build Frontend
bash# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build user frontend
cd /opt/mychat/frontend
sudo -u mychat npm install
sudo -u mychat npm run build

# Build admin dashboard
cd /opt/mychat/admin-dashboard
sudo -u mychat npm install
sudo -u mychat npm run build
11. Install Systemd Services
bash# Copy service files
sudo cp /opt/mychat/config/systemd/*.service /etc/systemd/system/

# Reload and enable
sudo systemctl daemon-reload
sudo systemctl enable mychat-api mychat-federation mychat-websocket
sudo systemctl start mychat-api mychat-federation mychat-websocket

# Check status
sudo systemctl status mychat-api
12. Configure Nginx
bash# Copy nginx config
sudo cp /opt/mychat/config/nginx/mychat.conf /etc/nginx/sites-available/mychat.pcowens.com
sudo ln -s /etc/nginx/sites-available/mychat.pcowens.com /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
13. Setup SSL
bashsudo certbot --nginx -d mychat.pcowens.com -d admin.mychat.pcowens.com \
  --non-interactive --agree-tos -m admin@example.com

# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
14. Setup Backups
bash# Daily backup script
sudo tee /etc/cron.daily/mychat-backup <<'EOF'
#!/bin/bash
BACKUP_DIR=/opt/mychat/data/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y-%m-%d)
sudo -u postgres pg_dump mychat | gzip > $BACKUP_DIR/mychat-$DATE.sql.gz
find $BACKUP_DIR -name "mychat-*.sql.gz" -mtime +30 -delete
EOF

sudo chmod +x /etc/cron.daily/mychat-backup
15. Create Admin User
bashcd /opt/mychat/backend
sudo -u mychat /opt/mychat/venv/bin/python -m app.cli create-admin \
  --username admin \
  --email admin@example.com \
  --password SECURE_ADMIN_PASSWORD
16. Configure Firewall
bashsudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
Verification
bash# Check services
sudo systemctl status mychat-api
sudo systemctl status mychat-federation
sudo systemctl status mychat-websocket

# Check logs
sudo journalctl -u mychat-api -f

# Test endpoints
curl https://mychat.pcowens.com/api/node/info
curl https://mychat.pcowens.com/.well-known/mychat-node

# Visit in browser
https://mychat.pcowens.com
https://admin.mychat.pcowens.com

🔒 Security Considerations
Threat Model
What We Protect Against:

✅ Message content eavesdropping (E2EE)
✅ Mass surveillance of conversations
✅ Unauthorized access to user accounts
✅ MITM attacks (TLS + key fingerprints)
✅ Database breaches exposing message content

What We Don't Protect Against:

❌ Traffic analysis (who talks to who, when)
❌ Endpoint compromise (malware on user device)
❌ Compelled key disclosure (legal pressure on user)
❌ Advanced persistent threats on server
❌ Timing attacks on message metadata

Security Best Practices
Password Security
python# Use Argon2 for password hashing (more secure than bcrypt)
from argon2 import PasswordHasher

ph = PasswordHasher()

# Hash password
password_hash = ph.hash(password)

# Verify
try:
    ph.verify(password_hash, password)
    # Password correct
except:
    # Password incorrect
    pass
Session Management
python# Short-lived JWT tokens
import jwt
from datetime import datetime, timedelta

def create_session_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=168),  # 7 days
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
Rate Limiting
python# Prevent brute force and DoS
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")  # 5 attempts per minute
async def login(request: Request):
    # ... login logic
    pass
Input Validation
python# Validate all inputs
from pydantic import BaseModel, validator

class MessageCreate(BaseModel):
    recipient_handle: str
    encrypted_content: str
    
    @validator('recipient_handle')
    def validate_handle(cls, v):
        if '@' not in v:
            raise ValueError('Invalid handle format')
        username, domain = v.split('@')
        if not username or not domain:
            raise ValueError('Invalid handle')
        return v
    
    @validator('encrypted_content')
    def validate_content(cls, v):
        if len(v) > 10_000_000:  # 10MB
            raise ValueError('Content too large')
        return v
SQL Injection Prevention
python# Always use parameterized queries
# SQLAlchemy handles this automatically
from sqlalchemy import select

# GOOD ✅
stmt = select(User).where(User.username == username)
result = await session.execute(stmt)

# BAD ❌ (never do this)
# query = f"SELECT * FROM users WHERE username = '{username}'"
Security Headers
nginx# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

📈 Performance & Scalability
Resource Optimization
Database Indexing
sql-- Critical indexes for performance
CREATE INDEX CONCURRENTLY idx_messages_recipient_created 
  ON messages(recipient_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_sender_created 
  ON messages(sender_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_users_full_handle 
  ON users(full_handle);

CREATE INDEX CONCURRENTLY idx_sessions_token 
  ON sessions(token);
Caching Strategy
python# Cache frequently accessed data
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_user_by_handle(handle):
    # Try cache first
    cached = redis_client.get(f"user:{handle}")
    if cached:
        return json.loads(cached)
    
    # Fetch from DB
    user = db.query(User).filter(User.full_handle == handle).first()
    
    # Cache for 1 hour
    redis_client.setex(
        f"user:{handle}",
        3600,
        json.dumps(user.dict())
    )
    
    return user
Connection Pooling
python# PostgreSQL connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # Max 20 connections
    max_overflow=10,  # Allow 10 overflow
    pool_pre_ping=True  # Verify connections
)
```

### Horizontal Scaling

For larger deployments (1000+ users):
```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
┌─────▼─────┐ ┌──▼──────┐ ┌─▼─────────┐
│  API      │ │  API    │ │  API      │
│  Server 1 │ │ Server 2│ │ Server 3  │
└─────┬─────┘ └──┬──────┘ └─┬─────────┘
      │           │           │
      └───────────┼───────────┘
                  │
      ┌───────────▼───────────┐
      │  PostgreSQL (Primary) │
      │  + Read Replicas      │
      └───────────┬───────────┘
                  │
      ┌───────────▼───────────┐
      │    Redis Cluster      │
      └───────────────────────┘
Monitoring
python# Prometheus metrics endpoint
from prometheus_client import Counter, Histogram, generate_latest

message_counter = Counter('messages_sent_total', 'Total messages sent')
request_duration = Histogram('request_duration_seconds', 'Request duration')

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")

⚖️ Legal Compliance
Data Retention Policy
python# Auto-delete old messages (optional feature)
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour=2)  # Run daily at 2 AM
async def cleanup_old_messages():
    # Delete messages older than 90 days
    cutoff_date = datetime.now() - timedelta(days=90)
    
    deleted = await db.execute(
        delete(Message).where(Message.created_at < cutoff_date)
    )
    
    logger.info(f"Deleted {deleted.rowcount} old messages")
Transparency Report Generation
python# Generate annual transparency report
async def generate_transparency_report(year):
    legal_requests = await db.execute(
        select(LegalRequest)
        .where(extract('year', LegalRequest.created_at) == year)
    )
    
    report = {
        'year': year,
        'total_requests': len(legal_requests),
        'fulfilled': sum(1 for r in legal_requests if r.status == 'fulfilled'),
        'denied': sum(1 for r in legal_requests if r.status == 'denied'),
        'users_affected': len(set(r.target_users for r in legal_requests)),
        'avg_response_time_days': calculate_avg_response_time(legal_requests)
    }
    
    return report
```

---

## 🔮 Future Enhancements

### Phase 2 Features

- **Voice Messages**: Record and send encrypted voice notes
- **Video Chat**: 1-on-1 WebRTC video calls
- **Screen Sharing**: Share screen with E2EE
- **Mobile Apps**: Native iOS and Android apps
- **Desktop Apps**: Electron-based desktop clients

### Phase 3 Features

- **Disappearing Messages**: Auto-delete after time period
- **Message Reactions**: Emoji reactions to messages
- **Thread Replies**: Threaded conversations
- **Advanced Search**: Full-text search in encrypted messages (client-side)
- **Backup/Export**: Encrypted backup of chat history

### Phase 4 Features

- **Multi-Device Sync**: Sync keys across devices
- **Advanced Group Features**: Polls, file sharing in groups
- **Bot API**: Allow developers to create bots
- **Blockchain Integration**: Decentralized identity verification
- **Tor Support**: Run nodes as hidden services

---

## 📚 Additional Resources

### Documentation Structure
```
docs/
├── user-guide/
│   ├── getting-started.md
│   ├── creating-account.md
│   ├── sending-messages.md
│   ├── key-management.md
│   └── security-best-practices.md
├── operator-guide/
│   ├── installation.md
│   ├── configuration.md
│   ├── federation-setup.md
│   ├── legal-compliance.md
│   └── troubleshooting.md
├── developer-guide/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── contributing.md
│   └── plugin-development.md
└── security/
    ├── threat-model.md
    ├── encryption-details.md
    └── audit-reports.md
```

### API Documentation

Auto-generated with FastAPI:
- `/docs` - Swagger UI
- `/redoc` - ReDoc UI

### Community Resources

- **GitHub Discussions**: Q&A and feature requests
- **Matrix Chat**: Real-time community support (dogfooding!)
- **Blog**: Technical deep-dives and updates
- **Newsletter**: Monthly updates for node operators

---

## 🎉 Conclusion

**MyChat** represents a return to the decentralized, user-controlled internet. By combining modern cryptography with federated architecture, we create a system that:

- **Respects Privacy**: True end-to-end encryption
- **Empowers Users**: Own your data, choose your node
- **Enables Community**: Support the infrastructure you use
- **Maintains Transparency**: Honest about what we protect (and don't)
- **Stays Simple**: Easy for users, manageable for operators

### Quick Start Summary

**For Users:**
```
1. Visit a MyChat node (e.g., mychat.pcowens.com)
2. Create account (generates keys automatically)
3. Add contacts via QR code or handle
4. Start chatting privately!
```

**For Node Operators:**
```
1. Spin up a small cloud instance ($12-15/month)
2. Run: curl -sSL https://install.mychat.org/setup.sh | sudo bash
3. Configure your domain
4. Open registration and federate!
```

**For Developers:**
```
1. Clone repository
2. Follow deployment guide
3. Read API docs
4. Contribute improvements!
```

---

## 📝 License
```
MyChat - Federated Privacy-First Chat System
Copyright (C) 2025

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

🙏 Acknowledgments
This specification is dedicated to everyone fighting for digital privacy and freedom. Special thanks to:

The IRC and XMPP communities for pioneering federated chat
The Signal Protocol team for making E2EE accessible
The Matrix project for showing federation at scale
All the node operators who will make this network real

Together, we take back what we gave to big tech. 🚀

END OF SPECIFICATION
Version 1.0 - November 15, 2025
Ready for development with Claude Code
