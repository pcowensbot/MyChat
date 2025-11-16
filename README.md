# MyChat - Federated Privacy-First Chat System

A federated, end-to-end encrypted chat system designed to reclaim digital privacy from centralized platforms. MyChat enables individuals and communities to run their own chat nodes while maintaining secure, private communication across the federated network.

## 🔐 Core Philosophy

**"Private conversations, transparent patterns. Community-owned infrastructure, individual privacy."**

### Key Principles

- **Privacy by Design**: E2EE for content, transparent metadata for lawful oversight
- **Decentralization**: No single point of control or failure
- **Simplicity**: Easy for users, manageable for operators
- **Sustainability**: Community-funded, no ads, no data mining
- **Transparency**: Open source, auditable, honest about what we protect

## ✨ Features

- ✅ **End-to-End Encryption**: RSA-4096 + AES-256-GCM hybrid encryption
- ✅ **Federated**: Communicate across different MyChat nodes
- ✅ **Client-Side Key Generation**: Private keys never leave your browser
- ✅ **Contact Management**: Add contacts by handle (username@domain)
- ✅ **Real-time Messaging**: WebSocket-based instant messaging
- ✅ **Simple & Clean UI**: Modern, responsive React interface
- ⏳ **Group Chat**: Coming soon
- ⏳ **File Sharing**: Coming soon
- ⏳ **Admin Dashboard**: Coming soon

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         User Browser                │
│  ┌──────────────────────────────┐   │
│  │  React Frontend              │   │
│  │  • E2EE (Web Crypto API)     │   │
│  │  • IndexedDB Key Storage     │   │
│  └──────────────────────────────┘   │
└─────────────┬───────────────────────┘
              │ HTTPS/WSS
              ↓
┌─────────────────────────────────────┐
│      mychat.pcowens.com             │
├─────────────────────────────────────┤
│  Nginx (TLS Termination)            │
│  ↓                                   │
│  FastAPI Backend                    │
│  • REST API                         │
│  • WebSocket Server                 │
│  • Federation Service               │
│  ↓                                   │
│  PostgreSQL + Redis                 │
└─────────────────────────────────────┘
```

## 🚀 Quick Start (Development)

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from app.db.database import init_db; import asyncio; asyncio.run(init_db())"

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📦 Production Deployment

### Automated Installation (Ubuntu 22.04+)

```bash
# Clone repository to /opt/mychat
sudo git clone https://github.com/yourrepo/mychat.git /opt/mychat
cd /opt/mychat

# Run installation script
sudo bash scripts/setup.sh
```

The script will:
1. Install all dependencies (Python, Node.js, PostgreSQL, Redis, Nginx)
2. Configure the database and services
3. Build the frontend
4. Set up SSL certificates with Let's Encrypt
5. Create systemd services
6. Configure automatic backups

### Manual Installation

See `startHere.md` for detailed manual installation instructions.

## 🔧 Configuration

### Environment Variables

Key configuration options in `backend/.env`:

```env
DOMAIN=mychat.pcowens.com
MAX_USERS=500
SECRET_KEY=your-secret-key-here
DB_HOST=localhost
DB_NAME=mychat
DB_USER=mychat
DB_PASS=your-password
REDIS_HOST=localhost
FEDERATION_ENABLED=true
REGISTRATION_OPEN=true
```

## 🔒 Security

### What We Protect

✅ Message content (E2EE with RSA-4096 + AES-256-GCM)
✅ Unauthorized access to user accounts
✅ MITM attacks (TLS + key fingerprint verification)
✅ Database breaches exposing message content

### What We Don't Protect

❌ Traffic analysis (metadata like who talks to who, when)
❌ Endpoint compromise (malware on user device)
❌ Compelled key disclosure
❌ Advanced persistent threats on server

### Key Management

- **Private keys** are generated client-side and encrypted with user password
- **Private keys** are stored in browser IndexedDB and NEVER sent to server
- **Public keys** are stored on the server for key exchange
- **Fingerprint verification** available for manual key verification

## 📱 Usage

### Creating an Account

1. Navigate to your MyChat instance (e.g., https://mychat.pcowens.com)
2. Click "Create Account"
3. Choose a username and strong password
4. Keys are automatically generated in your browser
5. Start chatting!

### Adding Contacts

1. Click "Add Contact" in the chat interface
2. Enter the full handle: `username@domain.com`
3. Start sending encrypted messages

### Sending Messages

1. Select a contact from your list
2. Type your message
3. Messages are automatically encrypted before sending
4. Only the recipient can decrypt with their private key

## 🛠️ Development

### Project Structure

```
MyChat/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core utilities
│   │   ├── db/           # Database
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   └── requirements.txt
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── lib/          # Crypto & API libraries
│   │   ├── pages/        # Page components
│   │   └── stores/       # State management
│   └── package.json
├── config/               # Deployment configs
├── scripts/              # Installation scripts
└── README.md
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0.

## 🙏 Acknowledgments

- The IRC and XMPP communities for pioneering federated chat
- The Signal Protocol team for making E2EE accessible
- The Matrix project for showing federation at scale
- All the node operators who make this network real

## 📞 Support

- **Issues**: https://github.com/pcowensbot/MyChat/issues
- **Discussions**: https://github.com/pcowensbot/MyChat/discussions
- **Email**: admin@mychat.pcowens.com

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic authentication and user management
- [x] End-to-end encrypted messaging
- [x] Contact management
- [x] Web frontend with encryption
- [ ] WebSocket real-time messaging
- [ ] Basic federation support

### Phase 2
- [ ] Group chat
- [ ] File sharing with encryption
- [ ] Admin dashboard
- [ ] Node discovery
- [ ] Full federation protocol

### Phase 3
- [ ] Mobile apps (iOS/Android)
- [ ] Desktop apps (Electron)
- [ ] Voice messages
- [ ] Video chat
- [ ] Advanced federation features

## ⚠️ Current Status

**Alpha Release** - This is an early version suitable for testing and development. Not recommended for production use yet.

### Known Limitations

- WebSocket real-time updates not yet implemented (manual refresh needed)
- Federation protocol incomplete
- Group chat not implemented
- Admin dashboard not implemented
- No mobile apps yet

---

**Made with ❤️ for digital privacy**

*"Take back what we gave to big tech"*
