# MyChat - Claude Context

> **Last Updated:** 2025-11-17
> **Version:** 1.0.0
> **Status:** Production - Active Development

## 🎯 Project Vision

**"Private conversations, transparent patterns. Community-owned infrastructure, individual privacy."**

MyChat is a federated, end-to-end encrypted chat system designed to reclaim digital privacy from centralized platforms. The system enables individuals and communities to run their own chat nodes while maintaining secure, private communication across the federated network.

## 📊 Current State

### Production Environment
- **Live URL:** https://mychat.pcowens.com
- **Server:** Ubuntu 22.04 LTS on Intel Xeon E5-2687W (10c/20t, 128GB RAM)
- **Backend:** Running on port 8000 via PM2 (uvicorn/FastAPI)
- **Frontend:** Served by Nginx from /home/fphillips/MyChat/frontend/dist
- **Database:** PostgreSQL (mychat database)
- **Cache:** Redis (db=1)
- **SSL:** Let's Encrypt (auto-renewing, expires 2026-02-14)

### What's Working ✅
- Backend deployment with PM2 process management
- Frontend React SPA built and served via Nginx
- SSL/HTTPS with automatic certificate renewal
- Database schema initialized and running
- User registration with client-side RSA-4096 key generation
- PGP key backup system during registration
- Multi-step registration workflow
- End-to-end encryption infrastructure (RSA-4096 + AES-256-GCM)
- Contact management
- Basic authentication

### Known Issues 🐛
- **CRITICAL:** Complete Registration button not sending backend POST request (frontend bug)
  - Button renders but onClick doesn't trigger API call
  - Root cause: State management issue in RegisterForm.jsx
  - Status: Attempted fixes with React state management, issue persists
  - Next: Requires browser console debugging

### In Progress 🔨
- Debugging registration completion flow
- Testing end-to-end user registration workflow

### Next Priorities 📋
1. **Fix registration button issue** - Critical blocker for user onboarding
2. Test complete registration → login → chat workflow
3. Implement WebSocket real-time messaging (currently requires manual refresh)
4. Complete basic federation support
5. Add group chat functionality
6. Build admin dashboard

## 🏗️ Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11)
- **ASGI Server:** Uvicorn
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **ORM:** SQLAlchemy with async support
- **Process Manager:** PM2
- **Authentication:** JWT tokens + password hashing

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Crypto:** Web Crypto API (browser native)
- **Storage:** IndexedDB (for private keys)
- **State:** React hooks + context
- **Key Backup:** JSZip for password-protected archives

### Infrastructure
- **Web Server:** Nginx (reverse proxy + static files)
- **SSL:** Let's Encrypt (Certbot)
- **OS:** Ubuntu 22.04 LTS
- **Deployment:** Git-based with npm build + PM2 restart

### Encryption Stack
- **Asymmetric:** RSA-4096 (client-side key generation)
- **Symmetric:** AES-256-GCM
- **Key Exchange:** Hybrid encryption (RSA for key exchange, AES for message content)
- **Storage:** IndexedDB with backward compatibility layer

## 💻 Code Patterns & Preferences

### Backend Patterns
- Async/await for all database and I/O operations
- Pydantic schemas for request/response validation
- SQLAlchemy models with proper relationships and indexes
- Dependency injection for database sessions
- Environment variables for all configuration
- Comprehensive error handling with proper HTTP status codes

### Frontend Patterns
- Functional components with hooks (no class components)
- Custom hooks for crypto operations (keys.js, storage.js)
- React Router for navigation (use `navigate()`, not `window.location`)
- Controlled components with React state (never direct DOM manipulation)
- IndexedDB for sensitive data (private keys)
- CSS modules for component styling

### Database Patterns
- Unique index names across all models (prefix with table name: `idx_user_last_seen`, not just `idx_last_seen`)
- Created/updated timestamps on all tables
- Foreign keys with proper CASCADE behavior
- Indexes on frequently queried columns

### Deployment Patterns
1. Pull code from git
2. Check for dependency changes (requirements.txt, package.json)
3. Rebuild frontend: `cd frontend && npm run build`
4. Restart backend: `pm2 restart mychat`
5. Check logs: `pm2 logs mychat --lines 50`
6. Verify health: `curl http://localhost:8000/health`

### Git Commit Patterns
- Clear, descriptive commit messages
- Reference issues/bugs when fixing
- Separate frontend and backend changes when possible
- Test before committing

## 📁 Project Structure

```
/home/fphillips/MyChat/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core utilities (config, security)
│   │   ├── db/               # Database setup
│   │   ├── models/           # SQLAlchemy models
│   │   └── schemas/          # Pydantic schemas
│   ├── venv/                 # Python virtual environment
│   ├── .env                  # Environment configuration
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── auth/         # Auth components (RegisterForm, KeyRestoreForm)
│   │   ├── lib/              # Utilities
│   │   │   ├── crypto/       # Crypto utilities (keys, storage, import/export)
│   │   │   └── api.js        # API client
│   │   ├── pages/            # Page components
│   │   └── stores/           # State management
│   ├── dist/                 # Built frontend (served by Nginx)
│   ├── package.json          # NPM dependencies
│   └── vite.config.js        # Vite configuration
├── logs/                     # Application logs
├── ecosystem.config.js       # PM2 configuration
├── start.sh                  # Backend startup script
├── WorkLOG.log               # Deployment history
├── DEPLOYMENT.md             # Deployment procedures
├── TROUBLESHOOTING.md        # Troubleshooting guide
├── QUICKREF.md               # Quick reference
└── serverEnv.md              # Server environment details
```

## 🔧 Critical Configuration

### Environment Variables (backend/.env)
```env
DOMAIN=mychat.pcowens.com
SECRET_KEY=<generated>
DB_NAME=mychat
DB_USER=mychat
DB_PASS=<generated>
DB_HOST=localhost
REDIS_DB=1                    # Must be 1 (Hal app uses 0)
CORS_ORIGINS=["https://mychat.pcowens.com"]  # JSON array format
MAX_USERS=500
FEDERATION_ENABLED=true
REGISTRATION_OPEN=true
```

### Nginx Configuration
- Location: `/etc/nginx/sites-available/mychat`
- HTTP → HTTPS redirect
- Static files: `/home/fphillips/MyChat/frontend/dist`
- API proxy: `localhost:8000`
- WebSocket proxy: `/ws` endpoint

### PM2 Configuration
- Process name: `mychat`
- Config: `/home/fphillips/MyChat/ecosystem.config.js`
- Script: `/home/fphillips/MyChat/start.sh`
- Logs: `/home/fphillips/MyChat/logs/`

### Database
- Database: `mychat`
- User: `mychat`
- Connection: localhost:5432
- Managed by: SQLAlchemy async

## 📝 Recent Sessions

### Session 1 (2025-11-16) - Initial Deployment
- Cloned repository from GitHub
- Set up backend Python environment
- Created PostgreSQL database and user
- Fixed duplicate database index names in models
- Installed frontend dependencies
- Built production frontend bundle
- Configured Nginx with SSL certificate
- Set up PM2 process management
- **Status:** Successfully deployed to https://mychat.pcowens.com

### Session 2 (2025-11-16) - Code Update & Registration Fix
- Pulled latest code from git
- Fixed user registration bug (public_key_fingerprint column size: 64 → 128)
- Recreated database with correct schema
- Tested user registration successfully
- First test user created: theweakshall@MyChat.pcowens.com
- **Commits:** 702e2a4 - Fix user registration by increasing public_key_fingerprint column size

### Session 3 (2025-11-16) - PGP Key Backup System Integration
- Merged PGP key backup feature branch into main
- Added mandatory key download during registration
- Implemented multi-step registration workflow
- Added JSZip dependency for key backup archives
- Created key export/import functionality (keyExport.js, keyImport.js)
- Enhanced IndexedDB storage with backward compatibility
- Consolidated repository onto main branch
- Added deployment documentation (DEPLOYMENT.md, QUICKREF.md, TROUBLESHOOTING.md)
- Cleared test data for fresh testing
- **Issue Identified:** Complete Registration button not triggering backend request
- Attempted fixes with React state management and Router integration
- **Commits:**
  - 90ee816 - Add PGP key backup system and deployment infrastructure
  - f009825 - Merge PGP key backup system and infrastructure
  - 8b10503 - Fix registration flow and cleanup
  - cfefcd6 - Fix registration flow and cleanup (latest)
- **Status:** Registration button issue persists, requires debugging

### Session 4 (2025-11-17) - Claude Context System Setup
- Created Claude Context System directory structure
- Populated CONTEXT.md from WorkLOG.log and all documentation
- Set up session logging framework
- **Status:** In progress

## 🐛 Known Issues & Solutions

### Issue 1: Registration Button Not Working (CRITICAL)
**Problem:** Complete Registration button renders but doesn't send POST /api/auth/register
**Attempted Fixes:**
- Changed window.location to React Router navigate()
- Added confirmationChecked state for checkbox
- Removed direct DOM manipulation
- Multiple frontend rebuilds
**Status:** Still broken - needs browser console debugging
**Next Steps:** Check browser console for JS errors, add debug logging to RegisterForm

### Issue 2: Duplicate Database Index Names (FIXED)
**Problem:** SQLAlchemy created duplicate index names across models
**Solution:** Renamed all indexes with table prefixes (idx_user_*, idx_wallet_*, etc.)
**Status:** Fixed in models, database recreated

### Issue 3: public_key_fingerprint Column Too Small (FIXED)
**Problem:** Fingerprints are 79 chars (16 groups × 4 hex + 15 dashes) but column was 64
**Solution:** Increased column to VARCHAR(128) in user.py:22
**Status:** Fixed, tested, working

## 📋 Development Workflows

### Deploy Code Updates
```bash
cd /home/fphillips/MyChat
git pull
cd frontend && npm run build && cd ..
pm2 restart mychat
pm2 logs mychat --lines 50
```

### Recreate Database (Breaking Schema Changes)
```bash
pm2 stop mychat
sudo -u postgres psql -c "DROP DATABASE mychat; CREATE DATABASE mychat OWNER mychat;"
pm2 start mychat
```

### Debug Backend Issues
```bash
pm2 logs mychat              # Live logs
pm2 logs mychat --err        # Errors only
curl http://localhost:8000/health  # Health check
```

### Debug Frontend Issues
```bash
cd /home/fphillips/MyChat/frontend
npm run build
# Check browser console at https://mychat.pcowens.com
```

## 🚀 Quick Commands

### Health Check
```bash
pm2 list && curl -s http://localhost:8000/health
```

### View Recent Errors
```bash
pm2 logs mychat --err --lines 50
```

### Full Restart
```bash
pm2 restart mychat && pm2 logs mychat
```

## 📚 Important Files to Know

### Critical Files
- `backend/.env` - All configuration secrets
- `backend/app/models/user.py` - User model (includes key storage)
- `frontend/src/components/auth/RegisterForm.jsx` - Registration workflow (CURRENTLY BROKEN)
- `frontend/src/lib/crypto/` - All encryption utilities
- `ecosystem.config.js` - PM2 process configuration

### Documentation Files
- `WorkLOG.log` - Complete deployment history
- `DEPLOYMENT.md` - Deployment procedures
- `QUICKREF.md` - Quick command reference
- `TROUBLESHOOTING.md` - Common issues and solutions
- `serverEnv.md` - Server hardware specs

## 🎓 Architecture Decisions

### Why Client-Side Key Generation?
Private keys never leave the user's browser, providing true E2EE. Server only stores public keys and encrypted messages.

### Why IndexedDB for Key Storage?
More secure than localStorage, supports encryption, larger storage capacity, better performance for crypto operations.

### Why Hybrid Encryption?
RSA-4096 for key exchange (secure but slow), AES-256-GCM for message content (fast and secure). Best of both worlds.

### Why PM2 Instead of Systemd?
Easier log management, built-in monitoring, automatic restarts, simpler deployment workflow. Can coexist with other apps (Hal).

### Why Nginx as Reverse Proxy?
SSL termination, static file serving, load balancing ready, WebSocket support, battle-tested reliability.

## 🔐 Security Considerations

### What's Protected
- Message content (E2EE with RSA-4096 + AES-256-GCM)
- Private keys (never leave browser, stored encrypted in IndexedDB)
- User passwords (hashed with bcrypt server-side)
- All traffic (TLS 1.2+)

### What's NOT Protected
- Metadata (who talks to who, when, message size)
- Traffic analysis
- Endpoint compromise (malware on user device)
- Server-side attacks (though messages remain encrypted)

### Privacy Trade-offs
This is an honest privacy system. We protect content but are transparent about metadata visibility for lawful oversight.

## 🗺️ Roadmap

### Phase 1 (Current - Alpha)
- [x] Basic authentication and user management
- [x] Client-side RSA-4096 key generation
- [x] PGP key backup system
- [ ] Fix registration completion bug
- [ ] WebSocket real-time messaging
- [ ] Basic federation support

### Phase 2 (Beta)
- [ ] Group chat with E2EE
- [ ] File sharing with encryption
- [ ] Admin dashboard
- [ ] Node discovery
- [ ] Full federation protocol

### Phase 3 (Production)
- [ ] Mobile apps (iOS/Android)
- [ ] Desktop apps (Electron)
- [ ] Voice messages
- [ ] Video chat
- [ ] Advanced federation features

## 📞 Support & Resources

- **GitHub:** https://github.com/pcowensbot/MyChat
- **Live Instance:** https://mychat.pcowens.com
- **Branch:** main (production baseline)
- **Server:** mychat.pcowens.com (192.168.0.175 on local network)

---

**Remember:** Update this file as significant changes occur! This is the project's memory across sessions.

*Last session: 2025-11-17 - Claude Context System setup*
