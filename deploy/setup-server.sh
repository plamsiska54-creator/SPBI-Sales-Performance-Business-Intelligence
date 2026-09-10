#!/bin/bash
# =============================================
# SPBI - DigitalOcean Droplet Setup Script
# Run as root on a fresh Ubuntu 24.04 Droplet
# Creates 2 environments: PROD + DEV
# =============================================

set -e

echo "=== 1. Update system ==="
apt update && apt upgrade -y

echo "=== 2. Install Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "=== 3. Install PM2 + Git ==="
npm install -g pm2
apt install -y git

echo "=== 4. Install Nginx ==="
apt install -y nginx
systemctl enable nginx

echo "=== 5. Install Chromium for Puppeteer ==="
apt install -y chromium-browser
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

echo "=== 6. Create app user ==="
useradd -m -s /bin/bash spbi || true

echo "=== 7. Create app directories (PROD + DEV) ==="
mkdir -p /var/www/spbi-prod
mkdir -p /var/www/spbi-dev
mkdir -p /var/www/spbi-prod/img/products
mkdir -p /var/www/spbi-dev/img/products
chown -R spbi:spbi /var/www/spbi-prod
chown -R spbi:spbi /var/www/spbi-dev

echo "=== 8. Setup firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "============================================"
echo "  Server ready! 2 environments prepared:"
echo ""
echo "  PROD: /var/www/spbi-prod  (port 8080)"
echo "  DEV:  /var/www/spbi-dev   (port 8081)"
echo ""
echo "  Next steps:"
echo "  1. Clone repo into both directories"
echo "  2. Create .env in each"
echo "  3. Run deploy.sh"
echo "============================================"
