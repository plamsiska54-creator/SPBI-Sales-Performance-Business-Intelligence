#!/bin/bash
# =============================================
# SPBI - DigitalOcean Droplet Setup Script
# Run as root on a fresh Ubuntu 24.04 Droplet
# =============================================

set -e

echo "=== 1. Update system ==="
apt update && apt upgrade -y

echo "=== 2. Install Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "=== 3. Install PM2 ==="
npm install -g pm2

echo "=== 4. Install Nginx ==="
apt install -y nginx
systemctl enable nginx

echo "=== 5. Install Chromium for Puppeteer ==="
apt install -y chromium-browser
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

echo "=== 6. Create app user ==="
useradd -m -s /bin/bash spbi || true

echo "=== 7. Create app directory ==="
mkdir -p /var/www/spbi
chown spbi:spbi /var/www/spbi

echo "=== 8. Setup firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "============================================"
echo "  Server ready! Next steps:"
echo "  1. Upload code to /var/www/spbi/"
echo "  2. Create /var/www/spbi/.env"
echo "  3. cd /var/www/spbi && npm install --production"
echo "  4. Copy nginx config and enable site"
echo "  5. Setup SSL with certbot"
echo "  6. Start app with PM2"
echo "============================================"
