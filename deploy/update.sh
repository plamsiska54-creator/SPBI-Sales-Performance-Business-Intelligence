#!/bin/bash
# =============================================
# SPBI - Quick Update Script
# Usage: bash update.sh [prod|dev|both]
# =============================================

ENV="${1:-both}"

update_prod() {
  echo "=== Updating PROD (main) ==="
  cd /var/www/spbi-prod
  git pull origin main
  npm install --production
  pm2 restart spbi-prod
  echo "[PROD] Updated and restarted"
}

update_dev() {
  echo "=== Updating DEV (refactor/phase-ab) ==="
  cd /var/www/spbi-dev
  git pull origin refactor/phase-ab
  npm install --production
  pm2 restart spbi-dev
  echo "[DEV] Updated and restarted"
}

case "$ENV" in
  prod) update_prod ;;
  dev)  update_dev ;;
  both) update_prod; update_dev ;;
  *)    echo "Usage: bash update.sh [prod|dev|both]"; exit 1 ;;
esac

echo ""
pm2 status
