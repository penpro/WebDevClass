#!/usr/bin/env bash
set -euo pipefail

# Adds an `include` line for security-headers.conf to the nginx HTTPS
# server block if it is not already present, then tests and reloads nginx.
#
# Despite the name, the include file now carries more than just headers:
# it also defines compression, immutable-cache rules for /assets/,
# no-cache for the SPA shell, and a /toc/ location block for the
# statically-hosted Theory of Computation tool. Re-run after pulling
# changes to security-headers.conf so the new rules take effect.
#
# Safe to re-run: the grep guard means the include line is only added once.
#
# Usage (on the EC2 server, after git pull):
#   ./hello-world/nginx/apply-security-headers.sh

NGINX_CONF="/etc/nginx/sites-available/hello-app"
HEADERS_CONF="$HOME/WebDevClass/hello-world/nginx/security-headers.conf"
INCLUDE_LINE="    include ${HEADERS_CONF};"

if [ ! -f "$NGINX_CONF" ]; then
  echo "Nginx config not found: $NGINX_CONF" >&2
  exit 1
fi

if [ ! -f "$HEADERS_CONF" ]; then
  echo "Security headers file not found: $HEADERS_CONF" >&2
  exit 1
fi

if sudo grep -qF "security-headers.conf" "$NGINX_CONF"; then
  echo "Security headers include already present in $NGINX_CONF — nothing to do."
else
  # Insert the include line right after the first 'server_name' directive
  # inside the HTTPS server block. This is a safe insertion point that
  # exists in every certbot-managed config.
  # Match any server_name line containing 'penumbra' so this still works
  # if the cert is ever re-issued under a different primary domain.
  sudo sed -i "/server_name .*penumbra.*;/{
    a\\
${INCLUDE_LINE}
  }" "$NGINX_CONF"
  echo "Added security headers include to $NGINX_CONF"
fi

echo "Testing nginx config..."
sudo nginx -t

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Done. Verify with:"
echo "  curl -sI https://penumbra-tech.com | grep -iE 'strict|x-content|x-frame|content-security|referrer'"
