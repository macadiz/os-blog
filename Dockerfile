# Open Blog - Single Container Deployment
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
    postgresql \
    postgresql-contrib \
    postgresql-client \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

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
    chmod -R 755 /app/frontend

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

# Configure PostgreSQL and run migrations during build
USER postgres
RUN /etc/init.d/postgresql start && \
    sleep 5 && \
    createuser blog_user -d && \
    createdb open_blog -O blog_user && \
    psql -c "ALTER USER blog_user PASSWORD 'temp_build_password';" && \
    /etc/init.d/postgresql stop

# Run database migrations during build
USER root
RUN cd /app/backend && \
    sudo -u postgres /etc/init.d/postgresql start && \
    sleep 5 && \
    DATABASE_URL="postgresql://blog_user:temp_build_password@localhost:5432/open_blog" npx prisma migrate deploy && \
    sudo -u postgres /etc/init.d/postgresql stop

# Expose port
EXPOSE 80

# Start the application
CMD ["/app/start.sh"]
