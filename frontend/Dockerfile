# Frontend Dockerfile - Production
FROM node:20-alpine AS builder

# Accept build-time API URL from Railway environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application (Vite will use VITE_API_URL from ENV)
RUN npm run build

# Production stage - nginx
FROM nginx:alpine

# Install dumb-init and gettext (for envsubst)
RUN apk add --no-cache dumb-init gettext

# Env vars (set at runtime via Railway)
ENV PORT=80
ENV BACKEND_HOST=localhost
ENV BACKEND_PORT=4000

# Copy custom nginx config as template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script for env var substitution
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set proper permissions for nginx user (nginx group already exists in Alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /docker-entrypoint.sh

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start with entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["dumb-init", "nginx", "-g", "daemon off;"]
