# MyChat Quick Reference

## File Locations

```
/home/fphillips/MyChat/
├── backend/
│   ├── .env                    # Backend configuration
│   ├── venv/                   # Python virtual environment
│   ├── app/                    # Application code
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── dist/                   # Built frontend (served by Nginx)
│   ├── src/                    # Frontend source code
│   └── package.json            # NPM dependencies
├── logs/                       # Application logs
├── ecosystem.config.js         # PM2 configuration
├── start.sh                    # Backend startup script
├── WorkLOG.log                 # Deployment history
├── DEPLOYMENT.md               # Deployment procedures
├── TROUBLESHOOTING.md          # Troubleshooting guide
└── QUICKREF.md                 # This file

/etc/nginx/sites-available/mychat    # Nginx configuration
/etc/letsencrypt/live/mychat.pcowens.com/  # SSL certificates
```

## One-Liner Commands

### Deploy New Code
```bash
cd /home/fphillips/MyChat && git pull && cd frontend && npm run build && cd .. && pm2 restart mychat
```

### Check Health
```bash
pm2 list && curl -s http://localhost:8000/health | head -5
```

### View Recent Errors
```bash
pm2 logs mychat --err --lines 50
```

### Recreate Database
```bash
pm2 stop mychat && sudo -u postgres psql -c "DROP DATABASE mychat; CREATE DATABASE mychat OWNER mychat;" && pm2 start mychat
```

### Fix Permissions
```bash
chmod +x /home/fphillips /home/fphillips/MyChat /home/fphillips/MyChat/frontend && chmod -R +r /home/fphillips/MyChat/frontend/dist && find /home/fphillips/MyChat/frontend/dist -type d -exec chmod +x {} \;
```

## Critical Commands

```bash
# PM2
pm2 list                  # Status of all processes
pm2 restart mychat        # Restart MyChat
pm2 logs mychat           # View logs (live)
pm2 save                  # Save process list

# Nginx
sudo nginx -t             # Test config
sudo systemctl reload nginx   # Reload Nginx
sudo tail /var/log/nginx/mychat_error.log  # View errors

# Database
sudo -u postgres psql -d mychat              # Connect to DB
sudo -u postgres pg_dump mychat > backup.sql # Backup

# Testing
curl http://localhost:8000/health            # Backend health
curl -I http://192.168.0.175 -H "Host: mychat.pcowens.com"  # Via Nginx
```

## Service Ports

```
80    → HTTP (Nginx) → Redirects to 443
443   → HTTPS (Nginx) → Proxies to 8000
3000  → Hal backend
8000  → MyChat backend (FastAPI)
5432  → PostgreSQL
6379  → Redis
```

## Important Config Values

### .env (Backend)
```env
DOMAIN=mychat.pcowens.com
REDIS_DB=1                                    # Must be 1 (Hal uses 0)
CORS_ORIGINS=["https://mychat.pcowens.com"]  # Must be JSON array
```

### Database
```
Database: mychat
User: mychat
Password: (in .env as DB_PASS)
```

## Emergency Contacts

```
GitHub Repo: https://github.com/pcowensbot/MyChat
Server: Ubuntu 22.04 LTS
Domain: mychat.pcowens.com
SSL Expires: 2026-02-14 (auto-renews)
```

## Common Error Patterns

```
"Permission denied" → Fix permissions (see one-liner above)
"Connection refused" → Check service is running (pm2 list / systemctl status)
"Duplicate table/index" → Recreate database (see one-liner above)
"Module not found" → pip install -r requirements.txt
"502 Bad Gateway" → Backend not running (pm2 start mychat)
"CORS error" → Check CORS_ORIGINS in .env
```

## Update Checklist

- [ ] Pull latest code
- [ ] Check for dependency changes (requirements.txt, package.json)
- [ ] Check for database model changes
- [ ] Rebuild frontend (if frontend changed)
- [ ] Restart backend (pm2 restart mychat)
- [ ] Check logs for errors
- [ ] Test critical functionality

## Backup Checklist

- [ ] Database: `sudo -u postgres pg_dump mychat > backup.sql`
- [ ] .env file: `cp backend/.env backend/.env.backup`
- [ ] Nginx config: `sudo cp /etc/nginx/sites-available/mychat ~/nginx_mychat.backup`
- [ ] WorkLOG: Already in /home/fphillips/MyChat/
