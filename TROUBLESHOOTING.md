# MyChat Troubleshooting Guide

## Quick Diagnostics

### Run This First
```bash
# Check all services
pm2 list
sudo systemctl status nginx --no-pager
sudo systemctl status postgresql --no-pager
sudo systemctl status redis --no-pager

# Check logs
pm2 logs mychat --lines 50
sudo tail -50 /var/log/nginx/mychat_error.log
```

---

## Common Issues

### 1. Application Won't Start (PM2 Restarts Loop)

**Symptoms:**
- High restart count in `pm2 list`
- App shows "online" but immediately crashes

**Check:**
```bash
pm2 logs mychat --lines 100
```

**Common Causes:**

#### A. Database Connection Error
```
Error: Connection refused (postgresql)
```
**Fix:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in .env match database
cat /home/fphillips/MyChat/backend/.env | grep DB_
sudo -u postgres psql -c "\du" | grep mychat
```

#### B. Redis Connection Error
```
Error: Connection refused (redis)
```
**Fix:**
```bash
# Check Redis status
sudo systemctl status redis

# Verify REDIS_DB in .env (should be 1, not 0)
cat /home/fphillips/MyChat/backend/.env | grep REDIS
```

#### C. Duplicate Index Error
```
DuplicateTableError: relation "idx_xxx" already exists
```
**Fix:**
```bash
# Recreate database
pm2 stop mychat
sudo -u postgres psql -c "DROP DATABASE mychat;"
sudo -u postgres psql -c "CREATE DATABASE mychat OWNER mychat;"
pm2 start mychat
```

#### D. Module Import Error
```
ModuleNotFoundError: No module named 'xxx'
```
**Fix:**
```bash
cd /home/fphillips/MyChat/backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart mychat
```

---

### 2. 502 Bad Gateway (Nginx Error)

**Symptoms:**
- Browser shows "502 Bad Gateway"
- Nginx is running but can't reach backend

**Check:**
```bash
# Is backend running?
pm2 list
curl http://localhost:8000/health

# Check Nginx error log
sudo tail -50 /var/log/nginx/mychat_error.log
```

**Common Causes:**

#### A. Backend Not Running
```bash
pm2 start mychat
```

#### B. Wrong Port in Nginx Config
```bash
# Verify backend port
sudo grep "proxy_pass" /etc/nginx/sites-available/mychat
# Should be: proxy_pass http://localhost:8000;

# If wrong, fix and reload:
sudo nano /etc/nginx/sites-available/mychat
sudo nginx -t
sudo systemctl reload nginx
```

---

### 3. 500 Internal Server Error

**Symptoms:**
- Browser shows "500 Internal Server Error"
- Nginx serves page but shows error

**Check:**
```bash
# Check Nginx error log
sudo tail -100 /var/log/nginx/mychat_error.log
```

**Common Causes:**

#### A. Permission Denied
```
stat() "/home/fphillips/MyChat/frontend/dist/index.html" failed (13: Permission denied)
```
**Fix:**
```bash
chmod +x /home/fphillips
chmod +x /home/fphillips/MyChat
chmod +x /home/fphillips/MyChat/frontend
chmod -R +r /home/fphillips/MyChat/frontend/dist
find /home/fphillips/MyChat/frontend/dist -type d -exec chmod +x {} \;

# Test
curl -I http://192.168.0.175 -H "Host: mychat.pcowens.com"
```

#### B. File Not Found
```bash
# Rebuild frontend
cd /home/fphillips/MyChat/frontend
npm run build

# Verify files exist
ls -la /home/fphillips/MyChat/frontend/dist/
```

---

### 4. SSL Certificate Issues

**Symptoms:**
- "Your connection is not private" error
- Certificate expired warning

**Check:**
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

**Fixes:**

#### A. Certificate Expired
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

#### B. Certbot Can't Validate Domain
```
Error: Connection refused (port 80)
```
- Verify ports 80 and 443 are forwarded to this server
- Check DNS: `dig +short mychat.pcowens.com` should show server's public IP

---

### 5. Database Migration Errors

**Symptoms:**
- App starts but data is missing
- Foreign key constraint errors
- "Table does not exist" errors

**Safe Reset:**
```bash
# 1. Backup current data (if any is worth saving)
sudo -u postgres pg_dump mychat > ~/mychat_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Stop app
pm2 stop mychat

# 3. Recreate database
sudo -u postgres psql -c "DROP DATABASE mychat;"
sudo -u postgres psql -c "CREATE DATABASE mychat OWNER mychat;"

# 4. Restart app (will create tables automatically)
pm2 start mychat

# 5. Check logs
pm2 logs mychat --lines 50
```

---

### 6. Out of Memory Errors

**Symptoms:**
- PM2 shows high memory usage
- App crashes randomly
- `max_memory_restart` triggered

**Check:**
```bash
# View memory usage
pm2 monit

# Check system memory
free -h

# Check PM2 config
cat /home/fphillips/MyChat/ecosystem.config.js | grep memory
```

**Fix:**
```bash
# Adjust max_memory_restart in ecosystem.config.js
nano /home/fphillips/MyChat/ecosystem.config.js
# Change: max_memory_restart: '1G' to '2G' or higher

# Reload config
pm2 delete mychat
pm2 start ecosystem.config.js
pm2 save
```

---

### 7. Frontend Not Updating

**Symptoms:**
- Code changes don't appear in browser
- Old version still showing

**Fixes:**

#### A. Rebuild Frontend
```bash
cd /home/fphillips/MyChat/frontend
npm run build
```

#### B. Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Or open in incognito mode

#### C. Check Build Output
```bash
ls -lah /home/fphillips/MyChat/frontend/dist/
# Should show recent timestamps
```

---

### 8. API Requests Failing

**Symptoms:**
- Frontend loads but API calls fail
- CORS errors in browser console

**Check:**
```bash
# Test API directly
curl http://localhost:8000/api/health

# Check CORS settings
cat /home/fphillips/MyChat/backend/.env | grep CORS

# Check backend logs
pm2 logs mychat
```

**Fix CORS:**
```bash
# Edit .env
nano /home/fphillips/MyChat/backend/.env

# Ensure CORS_ORIGINS includes your domain:
# CORS_ORIGINS=["https://mychat.pcowens.com"]

# Restart
pm2 restart mychat
```

---

### 9. Redis Connection Issues

**Symptoms:**
```
Error: Redis connection refused
```

**Check:**
```bash
# Test Redis
redis-cli ping
# Should return: PONG

# Check if Redis is running
sudo systemctl status redis

# Test connection with database 1
redis-cli -n 1 ping
```

**Fix:**
```bash
# Start Redis if stopped
sudo systemctl start redis

# Verify REDIS_DB in .env
cat /home/fphillips/MyChat/backend/.env | grep REDIS_DB
# Should be: REDIS_DB=1
```

---

## Emergency Procedures

### Complete Service Restart
```bash
# Stop everything
pm2 stop mychat
sudo systemctl stop nginx

# Start everything
sudo systemctl start nginx
pm2 start mychat

# Verify
pm2 list
sudo systemctl status nginx
```

### Nuclear Option (Fresh Start)
```bash
# 1. Backup logs
cp -r /home/fphillips/MyChat/logs ~/mychat_logs_backup_$(date +%Y%m%d)

# 2. Stop and remove from PM2
pm2 stop mychat
pm2 delete mychat

# 3. Recreate database
sudo -u postgres psql -c "DROP DATABASE mychat;"
sudo -u postgres psql -c "CREATE DATABASE mychat OWNER mychat;"

# 4. Rebuild frontend
cd /home/fphillips/MyChat/frontend
rm -rf node_modules dist
npm install
npm run build

# 5. Restart backend
cd /home/fphillips/MyChat
pm2 start ecosystem.config.js
pm2 save

# 6. Check everything
pm2 logs mychat
```

---

## Logs and Debugging

### Log Locations
```
Application Logs:  /home/fphillips/MyChat/logs/
Nginx Access:      /var/log/nginx/mychat_access.log
Nginx Error:       /var/log/nginx/mychat_error.log
PostgreSQL:        /var/log/postgresql/
Redis:             /var/log/redis/
Certbot:           /var/log/letsencrypt/
```

### Useful Log Commands
```bash
# Follow application logs
pm2 logs mychat

# Search for errors in last hour
pm2 logs mychat --lines 1000 | grep -i error

# Check Nginx errors
sudo tail -100 /var/log/nginx/mychat_error.log

# Check what's using port 8000
sudo lsof -i :8000

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname='mychat';"
```

---

## Performance Issues

### Slow Response Times

**Check:**
```bash
# Database performance
sudo -u postgres psql -d mychat -c "SELECT * FROM pg_stat_user_tables;"

# Check for long-running queries
sudo -u postgres psql -d mychat -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active';"
```

### High CPU Usage
```bash
# Check what's using CPU
pm2 monit
top

# Check for infinite loops in code
pm2 logs mychat | grep -i "error\|warning"
```

---

## Getting Help

### Information to Gather
When reporting issues, collect:
```bash
# System info
uname -a
pm2 -v
nginx -v
psql --version

# Service status
pm2 list
sudo systemctl status nginx postgresql redis --no-pager

# Recent logs
pm2 logs mychat --lines 100 --nostream
sudo tail -100 /var/log/nginx/mychat_error.log

# Configuration
cat /home/fphillips/MyChat/backend/.env (hide sensitive values!)
cat /home/fphillips/MyChat/ecosystem.config.js
```
