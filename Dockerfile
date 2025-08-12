# OS Blog - Single Container Deployment
# Production-ready Docker container with all services

FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    lsb-release \
    nginx \
    sudo \
    && rm -rf /var/lib/apt/lists/*


# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install PostgreSQL 14 explicitly
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get update && apt-get install -y postgresql-14 postgresql-client-14 && \
    rm -rf /var/lib/apt/lists/*

# Configure PostgreSQL 14 explicitly
RUN echo "Configuring PostgreSQL version: 14" && \
    echo "listen_addresses='*'" >> /etc/postgresql/14/main/postgresql.conf && \
    echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/14/main/pg_hba.conf

# Dynamically detect PostgreSQL version and set the correct data directory for persistence
RUN PG_VERSION=$(ls /etc/postgresql/ | head -1) && \
    echo "Using PostgreSQL version: $PG_VERSION" && \
    mkdir -p /var/lib/postgresql/$PG_VERSION/main && \
    chown -R postgres:postgres /var/lib/postgresql/$PG_VERSION/main

# Create app user
RUN useradd -r -s /bin/bash -m -d /app app

# Set working directory
WORKDIR /app

# Copy built application (we'll build this externally)
COPY --chown=app:app dist/ ./

# Create required directories and set proper permissions for nginx
RUN mkdir -p /app/static && \
    chown -R app:app /app/static && \
    chmod 755 /app && \
    chmod -R 755 /app/frontend && \
    chmod -R 755 /app/static

# Install Node.js dependencies
USER app
WORKDIR /app/backend
RUN npm i --only=production && npm cache clean --force

# Switch back to root for system configuration
USER root

# Configure nginx
COPY deployment/nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY deployment/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Just configure PostgreSQL for build, but don't create databases yet
# Database initialization will happen at runtime to work with volumes
# Container must run as root to manage PostgreSQL and other services
RUN echo "Database initialization will happen at runtime"

VOLUME /app/static
VOLUME /var/lib/postgresql/14/main

# Expose port
EXPOSE 80

# Run as root to allow service management
# The startup script will handle switching to appropriate users for specific tasks
CMD ["/app/start.sh"]
