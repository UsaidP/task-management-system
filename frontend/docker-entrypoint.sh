#!/bin/sh
# Generate nginx config from template, substituting environment variables
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
echo "✅ Backend proxy configured: $BACKEND_HOST:$BACKEND_PORT"
exec "$@"
