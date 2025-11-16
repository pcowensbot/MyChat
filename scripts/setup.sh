#!/bin/bash

# MyChat Installation Script
# This script sets up MyChat on Ubuntu 22.04+

set -e

echo "========================================="
echo "MyChat Installation Script"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Configuration
read -p "Enter your domain (e.g., mychat.pcowens.com): " DOMAIN
read -p "Enter admin email: " ADMIN_EMAIL
read -sp "Enter database password: " DB_PASS
echo ""

# Update system
echo "Updating system..."
apt-get update
apt-get upgrade -y

# Install Python 3.11+
echo "Installing Python..."
apt-get install -y python3.11 python3.11-venv python3-pip

# Install PostgreSQL
echo "Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Install Redis
echo "Installing Redis..."
apt-get install -y redis-server

# Install Nginx
echo "Installing Nginx..."
apt-get install -y nginx

# Install Certbot for SSL
echo "Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Git
apt-get install -y git curl

# Create mychat user (if not exists)
if ! id "mychat" &>/dev/null; then
    echo "Creating mychat user..."
    useradd -r -s /bin/bash -d /opt/mychat -m mychat
fi

# Create directories
echo "Creating directories..."
mkdir -p /opt/mychat/{config,data/backups,data/uploads}
chown -R mychat:mychat /opt/mychat

# Setup PostgreSQL
echo "Setting up PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE USER mychat WITH PASSWORD '$DB_PASS';
CREATE DATABASE mychat OWNER mychat;
GRANT ALL PRIVILEGES ON DATABASE mychat TO mychat;
EOF

# Configure Redis
echo "Configuring Redis..."
sed -i 's/^# maxmemory .*/maxmemory 100mb/' /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
systemctl restart redis

# Install Python dependencies
echo "Installing Python dependencies..."
cd /opt/mychat/backend
sudo -u mychat python3.11 -m venv /opt/mychat/venv
sudo -u mychat /opt/mychat/venv/bin/pip install -r requirements.txt

# Create .env file
echo "Creating configuration file..."
sudo -u mychat tee /opt/mychat/backend/.env <<EOF
DOMAIN=$DOMAIN
MAX_USERS=500
SECRET_KEY=$(openssl rand -hex 32)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mychat
DB_USER=mychat
DB_PASS=$DB_PASS
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
ADMIN_EMAIL=$ADMIN_EMAIL
SESSION_TIMEOUT_HOURS=168
MAX_MESSAGE_SIZE=10485760
MAX_FILE_SIZE=52428800
FEDERATION_ENABLED=true
REGISTRATION_OPEN=true
CORS_ORIGINS=https://$DOMAIN
EOF

# Initialize database
echo "Initializing database..."
cd /opt/mychat/backend
sudo -u mychat /opt/mychat/venv/bin/python -c "
from app.db.database import init_db
import asyncio
asyncio.run(init_db())
"

# Build frontend
echo "Building frontend..."
cd /opt/mychat/frontend
sudo -u mychat npm install
sudo -u mychat npm run build

# Configure Nginx
echo "Configuring Nginx..."
tee /etc/nginx/sites-available/$DOMAIN <<'NGINXCONF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    # Static files
    location / {
        root /opt/mychat/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
NGINXCONF

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

# Setup SSL with Certbot
echo "Setting up SSL certificate..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $ADMIN_EMAIL

# Install systemd service
echo "Installing systemd service..."
tee /etc/systemd/system/mychat-api.service <<EOF
[Unit]
Description=MyChat API Server
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=mychat
WorkingDirectory=/opt/mychat/backend
Environment="PATH=/opt/mychat/venv/bin"
ExecStart=/opt/mychat/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mychat-api
systemctl start mychat-api

# Setup daily backup
tee /etc/cron.daily/mychat-backup <<'EOF'
#!/bin/bash
BACKUP_DIR=/opt/mychat/data/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y-%m-%d)
sudo -u postgres pg_dump mychat | gzip > $BACKUP_DIR/mychat-$DATE.sql.gz
find $BACKUP_DIR -name "mychat-*.sql.gz" -mtime +30 -delete
EOF

chmod +x /etc/cron.daily/mychat-backup

# Configure firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "Your MyChat instance is now running at:"
echo "https://$DOMAIN"
echo ""
echo "Service status:"
systemctl status mychat-api --no-pager
echo ""
echo "To create an admin user, run:"
echo "cd /opt/mychat/backend && /opt/mychat/venv/bin/python create_admin.py"
echo ""
