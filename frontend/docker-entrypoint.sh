#!/bin/sh
set -e

# Handle Railway PORT variable (default to 80)
NGINX_PORT="${PORT:-80}"

# Generate nginx config from template, substituting environment variables
if [ -f /etc/nginx/conf.d/default.conf.template ]; then
    BACKEND_HOST="${BACKEND_HOST:-localhost}"
    BACKEND_PORT="${BACKEND_PORT:-4000}"
    export BACKEND_HOST BACKEND_PORT NGINX_PORT
    envsubst '${BACKEND_HOST} ${BACKEND_PORT} ${NGINX_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
    echo "✅ Backend proxy configured: $BACKEND_HOST:$BACKEND_PORT"
    echo "✅ Nginx listening on port: $NGINX_PORT"
else
    echo "⚠️  No template found, using default nginx config"
fi

# Test nginx configuration
nginx -t || { echo "❌ nginx config test failed"; exit 1; }

exec "$@"
