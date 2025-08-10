#!/bin/bash
set -e

echo "🚀 Starting Open Blog..."

# Validate required environment variables
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

# Start PostgreSQL
echo "🗄️  Starting PostgreSQL..."
service postgresql start

# Wait for PostgreSQL to be ready with more verbose output
echo "⏳ Waiting for PostgreSQL to be ready..."
RETRY_COUNT=0
MAX_RETRIES=30
until pg_isready -h localhost -p 5432 -U postgres; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -gt $MAX_RETRIES ]; then
    echo "❌ PostgreSQL failed to start after $MAX_RETRIES attempts"
    echo "Checking PostgreSQL logs..."
    tail -n 20 /var/log/postgresql/postgresql-14-main.log || echo "No PostgreSQL logs found"
    exit 1
  fi
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES: Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Update user password to runtime password (different from build password)
echo "� Updating database user password..."
sudo -u postgres psql -c "ALTER USER $POSTGRES_USER PASSWORD '$POSTGRES_PASSWORD';" 2>/dev/null || true

# Start nginx in the background
echo "🌐 Starting nginx..."
nginx

# Wait a moment for nginx to start
sleep 2

# Start the backend application in the background
echo "🚀 Starting backend application..."
echo "⏳ Waiting 3 seconds to ensure database is fully ready..."
sleep 3
cd /app/backend
export NODE_ENV=production
export PORT=3000
export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"
export CORS_ORIGINS=${CORS_ORIGINS:-"http://localhost"}
node main.js &
BACKEND_PID=$!

echo "✅ All services started!"
echo "📍 Backend PID: $BACKEND_PID"
echo "� Access your blog at: http://localhost"

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    nginx -s quit 2>/dev/null || true
    service postgresql stop 2>/dev/null || true
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
