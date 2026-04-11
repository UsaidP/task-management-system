#!/bin/sh
set -e

# Generate nginx config from template, substituting environment variables
if [ -f /etc/nginx/conf.d/default.conf.template ]; then
    envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
    echo "✅ Backend proxy configured: $BACKEND_HOST:$BACKEND_PORT"
else
    echo "⚠️  No template found, using default nginx config"
fi

# Test nginx configuration
nginx -t || { echo "❌ nginx config test failed"; exit 1; }

exec "$@"
