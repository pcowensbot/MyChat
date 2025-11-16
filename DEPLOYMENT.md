# MyChat Deployment Guide

## Quick Deploy (for code updates from GitHub)

### 1. Pull Latest Code
```bash
cd /home/fphillips/MyChat
git fetch origin
git pull origin <branch-name>
```

### 2. Backend Updates
```bash
cd /home/fphillips/MyChat/backend

# If requirements.txt changed:
source venv/bin/activate
pip install -r requirements.txt

# If models changed (database migrations):
# Review changes first, then recreate DB if needed:
# sudo -u postgres psql -c "DROP DATABASE mychat;"
# sudo -u postgres psql -c "CREATE DATABASE mychat OWNER mychat;"

# Restart backend
pm2 restart mychat
pm2 logs mychat --lines 50
```

### 3. Frontend Updates
```bash
cd /home/fphillips/MyChat/frontend

# If package.json changed:
npm install

# Rebuild frontend
npm run build

# No restart needed - Nginx serves static files
```

### 4. Configuration Updates
If `.env` file needs updates:
```bash
# Edit .env
nano /home/fphillips/MyChat/backend/.env

# Restart to apply changes
pm2 restart mychat
```

### 5. Verify Deployment
```bash
# Check PM2 status
pm2 list

# Check logs for errors
pm2 logs mychat --lines 100

# Test backend API
curl http://localhost:8000/health

# Test frontend (from local network)
curl -I http://192.168.0.175 -H "Host: mychat.pcowens.com"
```

---

## Rollback Procedure

### Quick Rollback
```bash
cd /home/fphillips/MyChat

# Find previous commit
git log --oneline -10

# Rollback to specific commit
git reset --hard <commit-hash>

# Rebuild frontend if needed
cd frontend
npm run build

# Restart backend
pm2 restart mychat
```

### Database Rollback
```bash
# Restore from backup
sudo -u postgres psql -d mychat < /path/to/backup.sql

# Or recreate from scratch
sudo -u postgres psql -c "DROP DATABASE mychat;"
sudo -u postgres psql -c "CREATE DATABASE mychat OWNER mychat;"
```

---

## Database Migrations

### Current Setup
The app uses SQLAlchemy's `create_all()` which creates tables if they don't exist. This is simple but has limitations:

**For schema changes:**
1. **Minor changes** (adding nullable columns): Should work automatically
2. **Breaking changes** (removing columns, changing types): Requires database recreation

### Safe Migration Process
```bash
# 1. Backup current database
sudo -u postgres pg_dump mychat > ~/backups/mychat_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on local copy first
sudo -u postgres createdb mychat_test
sudo -u postgres psql -d mychat_test < ~/backups/mychat_*.sql

# 3. Stop app
pm2 stop mychat

# 4. Apply migration
cd /home/fphillips/MyChat/backend
source venv/bin/activate
# Run migration script or recreate DB

# 5. Restart and verify
pm2 start mychat
pm2 logs mychat
```

---

## SSL Certificate Renewal

### Automatic Renewal
Certbot auto-renewal is configured. Check status:
```bash
sudo certbot renew --dry-run
```

### Manual Renewal
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### If Certificate Fails
```bash
# Check certbot logs
sudo tail -100 /var/log/letsencrypt/letsencrypt.log

# Verify DNS is pointing correctly
dig +short mychat.pcowens.com

# Verify ports 80 and 443 are accessible
curl -I http://mychat.pcowens.com
```

---

## Nginx Configuration Updates

### Edit Nginx Config
```bash
sudo nano /etc/nginx/sites-available/mychat
```

### Test and Reload
```bash
# Test configuration
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

---

## PM2 Management

### Common Commands
```bash
pm2 list                    # List all processes
pm2 logs mychat             # View logs (live)
pm2 logs mychat --lines 100 # View last 100 lines
pm2 logs mychat --err       # View only errors
pm2 restart mychat          # Restart application
pm2 stop mychat             # Stop application
pm2 start mychat            # Start application
pm2 delete mychat           # Remove from PM2
pm2 save                    # Save current process list
pm2 resurrect               # Restore saved processes
```

### Start MyChat from Config
```bash
cd /home/fphillips/MyChat
pm2 start ecosystem.config.js
pm2 save
```

### View Resource Usage
```bash
pm2 monit                   # Interactive monitor
pm2 show mychat             # Detailed info
```

---

## File Permissions Issues

If Nginx can't serve files (500 errors):
```bash
# Fix permissions
chmod +x /home/fphillips
chmod +x /home/fphillips/MyChat
chmod +x /home/fphillips/MyChat/frontend
chmod -R +r /home/fphillips/MyChat/frontend/dist
find /home/fphillips/MyChat/frontend/dist -type d -exec chmod +x {} \;
```

---

## Environment Variables Reference

### Critical .env Variables
Located at: `/home/fphillips/MyChat/backend/.env`

```env
DOMAIN=mychat.pcowens.com
SECRET_KEY=<generated-key>
DB_NAME=mychat
DB_USER=mychat
DB_PASS=<generated-password>
REDIS_DB=1  # Important: Different from Hal (uses 0)
CORS_ORIGINS=["https://mychat.pcowens.com"]
```

### After .env Changes
Always restart the backend:
```bash
pm2 restart mychat
```

---

## Port Reference
- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (handled by Nginx)
- **3000**: Hal backend
- **8000**: MyChat backend (proxied by Nginx)
- **5432**: PostgreSQL
- **6379**: Redis

---

## Quick Health Check
```bash
# One-liner to check everything
echo "=== PM2 Status ===" && pm2 list && \
echo "=== MyChat Logs (last 10) ===" && pm2 logs mychat --lines 10 --nostream && \
echo "=== Nginx Status ===" && sudo systemctl status nginx --no-pager -l && \
echo "=== Backend Health ===" && curl -s http://localhost:8000/health | head -5
```
