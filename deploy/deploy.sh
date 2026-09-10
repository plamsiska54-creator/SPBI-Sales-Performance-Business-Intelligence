#!/bin/bash
# =============================================
# SPBI - Deploy/Update Script
# Run on the Droplet after uploading code
# =============================================

set -e

APP_DIR="/var/www/spbi"
DOMAIN="${1:-YOUR_DOMAIN_OR_IP}"

cd "$APP_DIR"

echo "=== 1. Install dependencies ==="
npm install --production

echo "=== 2. Setup Nginx ==="
sed "s/YOUR_DOMAIN_OR_IP/$DOMAIN/g" deploy/nginx-spbi.conf > /etc/nginx/sites-available/spbi
ln -sf /etc/nginx/sites-available/spbi /etc/nginx/sites-enabled/spbi
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== 3. Start/Restart app with PM2 ==="
pm2 stop spbi 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u spbi --hp /home/spbi 2>/dev/null || true

echo "=== 4. Create img/products dir ==="
mkdir -p img/products

echo ""
echo "============================================"
echo "  SPBI deployed at http://$DOMAIN"
echo ""
echo "  For SSL (https):"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d $DOMAIN"
echo "============================================"
