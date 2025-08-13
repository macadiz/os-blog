# OS Blog - Multi-Stage Build

# Frontend Build Stage
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY apps/frontend/package*.json ./

RUN npm install
COPY apps/frontend/ ./

RUN sed -i 's#../../node_modules#./node_modules#g' ./angular.json

RUN npm run build

# Backend Build Stage
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY apps/backend/package*.json ./
RUN npm install

COPY apps/backend/ ./
COPY libs/ ../libs/

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

# Final Stage
FROM alpine:3.21

# Install system dependencies
RUN apk add --no-cache \
    curl \
    wget \
    gnupg \
    postgresql \
    postgresql-client \
    nginx \
    sudo \
    nodejs \
    npm \
    openssl

# Add www-data user and group for compatibility with Nginx (if not already present)
RUN getent group www-data || addgroup -S www-data && \
    getent passwd www-data || adduser -S www-data -G www-data

# Set working directory
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy built backend
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/package*.json /app/backend/
COPY --from=backend-builder /app/backend/prisma /app/backend/prisma

# Install backend production dependencies
WORKDIR /app/backend
RUN npm install --only=production

# Configure nginx
COPY deployment/nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY deployment/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port
EXPOSE 80

# Volumes for data persistence
VOLUME /app/static
VOLUME /var/lib/postgresql/data

# Run the startup script
CMD ["/app/start.sh"]
