# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/ ./packages/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/api/ ./apps/api/
COPY apps/web/ ./apps/web/

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=nodejs:nodejs /app/apps/web ./apps/web
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages

# Switch to non-root user
USER nodejs

WORKDIR /app/apps/api

# Expose port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:8787/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
