# Use Node.js 20 Alpine for smaller image size and better security
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY libs/shared-types/package*.json ./libs/shared-types/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY apps/backend ./apps/backend
COPY libs/shared-types ./libs/shared-types

# Build the application
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=base --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=base --chown=nestjs:nodejs /app/apps/backend/package*.json ./
COPY --from=base --chown=nestjs:nodejs /app/node_modules ./node_modules

# Create static files directory
RUN mkdir -p ./static && chown nestjs:nodejs ./static

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Start the application
CMD ["dumb-init", "node", "dist/main"]
