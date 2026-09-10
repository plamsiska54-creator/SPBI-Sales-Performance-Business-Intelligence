#!/bin/bash
# =============================================
# SPBI - Deploy Script (PROD + DEV)
# Usage: bash deploy.sh PROD_DOMAIN DEV_DOMAIN
# Example: bash deploy.sh spbi.example.com dev-spbi.example.com
# =============================================

set -e

PROD_DOMAIN="${1:?Usage: deploy.sh PROD_DOMAIN DEV_DOMAIN}"
DEV_DOMAIN="${2:?Usage: deploy.sh PROD_DOMAIN DEV_DOMAIN}"
REPO="https://github.com/wwnerpapp/SPBI-Sales-Performance-Business-Intelligence.git"

echo "=== 1. Clone/Pull repositories ==="

# PRODUCTION — branch: main
if [ -d /var/www/spbi-prod/.git ]; then
  echo "[PROD] Pulling latest main..."
  cd /var/www/spbi-prod && git pull origin main
else
  echo "[PROD] Cloning main branch..."
  git clone -b main "$REPO" /var/www/spbi-prod
fi

# DEVELOPMENT — branch: refactor/phase-ab
if [ -d /var/www/spbi-dev/.git ]; then
  echo "[DEV] Pulling latest refactor/phase-ab..."
  cd /var/www/spbi-dev && git pull origin refactor/phase-ab
else
  echo "[DEV] Cloning refactor/phase-ab branch..."
  git clone -b refactor/phase-ab "$REPO" /var/www/spbi-dev
fi

echo "=== 2. Install dependencies ==="
cd /var/www/spbi-prod && npm install --production
cd /var/www/spbi-dev && npm install --production

echo "=== 3. Create img/products dirs ==="
mkdir -p /var/www/spbi-prod/img/products
mkdir -p /var/www/spbi-dev/img/products

echo "=== 4. Setup Nginx ==="
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
sed -e "s/PROD_DOMAIN/$PROD_DOMAIN/g" -e "s/DEV_DOMAIN/$DEV_DOMAIN/g" \
  "$SCRIPT_DIR/nginx-spbi.conf" > /etc/nginx/sites-available/spbi
ln -sf /etc/nginx/sites-available/spbi /etc/nginx/sites-enabled/spbi
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== 5. Set ownership ==="
chown -R spbi:spbi /var/www/spbi-prod
chown -R spbi:spbi /var/www/spbi-dev

echo "=== 6. Start/Restart apps with PM2 ==="
pm2 delete spbi-prod 2>/dev/null || true
pm2 delete spbi-dev 2>/dev/null || true
pm2 start /var/www/spbi-prod/ecosystem.config.js --only spbi-prod
pm2 start /var/www/spbi-dev/ecosystem.config.js --only spbi-dev
pm2 save

echo "=== 7. Setup PM2 startup ==="
pm2 startup systemd -u spbi --hp /home/spbi 2>/dev/null || true

echo ""
echo "============================================"
echo "  SPBI Deployed!"
echo ""
echo "  PROD: http://$PROD_DOMAIN"
echo "    Branch: main"
echo "    Path:   /var/www/spbi-prod"
echo "    Port:   8080"
echo ""
echo "  DEV:  http://$DEV_DOMAIN"
echo "    Branch: refactor/phase-ab"
echo "    Path:   /var/www/spbi-dev"
echo "    Port:   8081"
echo ""
echo "  For SSL:"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d $PROD_DOMAIN -d $DEV_DOMAIN"
echo "============================================"
