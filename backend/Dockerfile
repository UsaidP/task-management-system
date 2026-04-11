# Backend Dockerfile - Production
FROM node:20-alpine

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Create non-root user for security (Do this early so we can use it for COPY)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and change ownership in one step
COPY --chown=nodejs:nodejs package*.json ./

# Install production dependencies only and clear cache to save space
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code and change ownership in one step
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Set Environment Variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "const port = process.env.PORT || 4000; require('http').get('http://localhost:' + port + '/api/v1/healthcheck/ping', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]