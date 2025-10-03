#!/bin/sh
set -e

echo "🚀 Starting OS Blog..."

# Validate required environment variables FIRST
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ ERROR: POSTGRES_PASSWORD environment variable is required!"
    echo "   Set it when running the container:"
    echo "   docker run -e POSTGRES_PASSWORD=your_secure_password ..."
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET environment variable is required!"
    echo "   Set it when running the container:"
    echo "   docker run -e JWT_SECRET=your_secret_key ..."
    exit 1
fi

# Default environment variables (with validation)
export POSTGRES_DB=${POSTGRES_DB:-open_blog}
export POSTGRES_USER=${POSTGRES_USER:-blog_user}

# Validate password strength (basic check)
if [ ${#POSTGRES_PASSWORD} -lt 8 ]; then
    echo "⚠️  WARNING: Password is too short! Minimum 8 characters recommended."
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "⚠️  WARNING: JWT_SECRET is too short! Minimum 32 characters recommended."
fi

echo "📊 Configuration:"
echo "  Database: $POSTGRES_DB"
echo "  User: $POSTGRES_USER"
echo "  Password: [HIDDEN - Length: ${#POSTGRES_PASSWORD} chars]"
echo "  JWT Secret: [HIDDEN - Length: ${#JWT_SECRET} chars]"

# Initialize PostgreSQL database directory if empty
if [ -z "$(ls -A /var/lib/postgresql/data)" ]; then
  echo "Initializing PostgreSQL database directory..."
  mkdir -p /var/lib/postgresql/data
  chown -R postgres:postgres /var/lib/postgresql/data
  su postgres -c "initdb -D /var/lib/postgresql/data"
fi

# Ensure /run/postgresql directory exists before starting PostgreSQL
mkdir -p /run/postgresql
chown -R postgres:postgres /run/postgresql
chmod 775 /run/postgresql

# Start PostgreSQL
echo "🗄️  Starting PostgreSQL..."
echo "🔍 Checking PostgreSQL service status..."
su postgres -c "pg_ctl -D /var/lib/postgresql/data status" || echo "PostgreSQL service not running"

echo "🔍 Available PostgreSQL versions:"
ls -la /etc/postgresql/ || echo "No PostgreSQL config directories found"

echo "🔍 Starting PostgreSQL service..."
su postgres -c "pg_ctl -D /var/lib/postgresql/data start"

# Check PostgreSQL service status
echo "🔍 PostgreSQL service status after start:"
su postgres -c "pg_ctl -D /var/lib/postgresql/data status" || echo "Failed to get status"

echo "🔍 Checking if PostgreSQL is listening on port 5432..."
netstat -tlnp | grep :5432 || echo "PostgreSQL not listening on 5432"

# Verify PostgreSQL is listening on all interfaces
netstat -tlnp | grep :5432 || echo "PostgreSQL is not listening on 0.0.0.0:5432"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
RETRY_COUNT=0
MAX_RETRIES=30
until pg_isready -h localhost -p 5432 -U postgres; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -gt $MAX_RETRIES ]; then
    echo "❌ PostgreSQL failed to start after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - PostgreSQL not ready yet..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Configure PostgreSQL to listen on all network interfaces
PG_CONF="/var/lib/postgresql/data/postgresql.conf"
PG_HBA="/var/lib/postgresql/data/pg_hba.conf"

if [ -f "$PG_CONF" ]; then
  echo "Configuring PostgreSQL to listen on all interfaces..."
  sed -i "s|^#*listen_addresses =.*|listen_addresses = '*'|" "$PG_CONF"
fi

if [ -f "$PG_HBA" ]; then
  echo "Allowing external connections to PostgreSQL..."
  echo "host all all 0.0.0.0/0 md5" >> "$PG_HBA"
fi

# Initialize database if it doesn't exist (first run or empty volume)
echo "🔧 Checking database setup..."
DB_EXISTS=$(su -l postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'" 2>/dev/null || echo "")

# Check if the database user exists before creating it
USER_EXISTS=$(su -l postgres -c "psql -tAc \"SELECT 1 FROM pg_user WHERE usename='$POSTGRES_USER'\"" 2>/dev/null || echo "")

if [ -z "$USER_EXISTS" ]; then
    echo "👤 Creating database user: $POSTGRES_USER"
    su -l postgres -c "createuser $POSTGRES_USER -d"
    su -l postgres -c "psql -c \"ALTER USER $POSTGRES_USER PASSWORD '$POSTGRES_PASSWORD';\""
else
    echo "👤 Database user exists, updating password..."
    su -l postgres -c "psql -c \"ALTER USER $POSTGRES_USER PASSWORD '$POSTGRES_PASSWORD';\"" 2>/dev/null || true
fi

# Check if the database exists before creating it
DB_EXISTS=$(su -l postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'\"" 2>/dev/null || echo "")

if [ -z "$DB_EXISTS" ]; then
    echo "🗄️  Creating database: $POSTGRES_DB"
    su -l postgres -c "createdb $POSTGRES_DB -O $POSTGRES_USER"
    
    # Run database migrations for new database
    echo "📋 Running database migrations..."
    cd /app/backend
    export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
    npx prisma migrate deploy
    echo "✅ Database migrations completed!"
else
    echo "🗄️  Database exists, checking for pending migrations..."
    cd /app/backend
    export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
    npx prisma migrate deploy
    echo "✅ Database migration check completed!"
fi

# Move files from /app/frontend/dist/frontend to /app/frontend/dist
if [ -d "/app/frontend/dist/frontend" ]; then
    mv /app/frontend/dist/frontend/* /app/frontend/dist/
    rmdir /app/frontend/dist/frontend
fi

# Start nginx in the background
echo "🌐 Starting nginx..."

# Ensure static directories exist with proper permissions
echo "📁 Setting up static file directories..."
mkdir -p /var/www/static/settings /var/www/static/profile_pictures /var/www/static/blog_images
chown -R www-data:www-data /var/www/static
chmod -R 755 /var/www/static
chown -R www-data:www-data /app/frontend/dist
chmod -R 755 /app/frontend/dist

# Ensure Nginx required directories exist with proper permissions
mkdir -p /var/lib/nginx/logs /var/lib/nginx/tmp/client_body
chown -R www-data:www-data /var/lib/nginx
chmod -R 755 /var/lib/nginx

# Ensure Nginx log directory exists with proper permissions
mkdir -p /var/log/nginx
chown -R www-data:www-data /var/log/nginx
chmod -R 755 /var/log/nginx

nginx

# Wait a moment for nginx to start
sleep 2

# Generate initial static pages for existing posts
echo "📄 Generating initial static pages..."
export API_URL="http://localhost:3000"
export BASE_URL=${BASE_URL:-"http://localhost"}
export WEBHOOK_PORT=3002
export DIST_DIR="./dist"

# Wait for backend to be ready before generating static pages
echo "⏳ Backend will start first, static pages will be generated after..."

# Start the backend application
echo "🚀 Starting backend application..."
sleep 3
cd /app/backend
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
export CORS_ORIGINS=${CORS_ORIGINS:-"http://localhost"}
export BASE_URL=${BASE_URL:-"http://localhost:$PORT"}
node dist/main.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 5
until curl -f http://localhost:3000/health > /dev/null 2>&1; do
    echo "   Backend not ready yet..."
    sleep 2
done
echo "✅ Backend is ready!"

# Generate initial static pages
echo "📄 Generating initial static pages..."
cd /app/frontend
node static-generator/generate-static-pages.js || echo "⚠️  Static page generation failed (normal if no posts exist yet)"

# Start webhook server for automatic regeneration
echo "🔗 Starting static page webhook server..."
cd /app/frontend
node static-generator/auto-generate-webhook.js &
WEBHOOK_PID=$!

echo "✅ All services started!"
echo "📍 Backend PID: $BACKEND_PID"
echo "📍 Webhook PID: $WEBHOOK_PID"
echo "🌐 Access your blog at: http://localhost"

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $WEBHOOK_PID 2>/dev/null || true
    nginx -s quit 2>/dev/null || true
    su postgres -c "pg_ctl -D /var/lib/postgresql/data stop" 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Keep the container running and monitor the backend
while kill -0 $BACKEND_PID 2>/dev/null; do
    sleep 10
done

echo "❌ Backend process died"
cleanup
