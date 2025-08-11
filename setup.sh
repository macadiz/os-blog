#!/bin/bash

# Open Blog Deployment Setup
echo "🚀 Open Blog Deployment"
echo "======================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Ask user for basic configuration
echo "🔧 Configuration"
echo "----------------"

read -p "Enter port for your blog (default: 80): " PORT
PORT=${PORT:-80}

# Ask if user wants to expose the database port

read -p "Do you want to expose the database port to your host? (y/N): " EXPOSE_DB
EXPOSE_DB=${EXPOSE_DB:-N}
if [[ $EXPOSE_DB =~ ^[Yy]$ ]]; then
    echo "⚠️  WARNING: Exposing the database port could make your database accessible from the public internet."
    echo "   Only expose the port if you understand the security risks and have secured your environment (firewall, strong passwords, etc)."
    read -p "Enter host port to map to database (default: 5432): " POSTGRES_PORT
    POSTGRES_PORT=${POSTGRES_PORT:-5432}
    echo "✅ Database will be accessible on localhost:$POSTGRES_PORT"
else
    POSTGRES_PORT=""
    echo "ℹ️  Database port will not be exposed to host."
fi

read -p "Enter database password (minimum 8 chars, leave empty for auto-generated): " DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 20 2>/dev/null || date +%s | sha256sum | base64 | head -c 20)
    echo "🔐 Generated secure database password (20 chars)"
elif [ ${#DB_PASSWORD} -lt 8 ]; then
    echo "⚠️  Password too short! Generating secure password..."
    DB_PASSWORD=$(openssl rand -base64 20 2>/dev/null || date +%s | sha256sum | base64 | head -c 20)
    echo "🔐 Generated secure database password (20 chars)"
fi

read -p "Enter JWT secret (minimum 32 chars, leave empty for auto-generated): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 48 2>/dev/null || date +%s | sha256sum | base64 | head -c 48)
    echo "🔐 Generated secure JWT secret (48 chars)"
elif [ ${#JWT_SECRET} -lt 32 ]; then
    echo "⚠️  JWT secret too short! Generating secure secret..."
    JWT_SECRET=$(openssl rand -base64 48 2>/dev/null || date +%s | sha256sum | base64 | head -c 48)
    echo "🔐 Generated secure JWT secret (48 chars)"
fi

echo ""

# Check if image exists
if ! docker image inspect open-blog:latest >/dev/null 2>&1; then
    echo "🔨 Building application..."
    if ! bash build.sh; then
        echo "❌ Build failed. Please check the build output above."
        exit 1
    fi
else
    echo "✅ Docker image already exists"
fi

BASE_URL="http://localhost:$PORT"
echo "✅ Configuration saved to .env"
echo ""


# Compose docker run environment variables
BASE_URL="http://localhost:$PORT"
DOCKER_ENV_VARS="-e PORT=$PORT -e POSTGRES_PASSWORD=$DB_PASSWORD -e JWT_SECRET=$JWT_SECRET -e POSTGRES_DB=open_blog -e POSTGRES_USER=blog_user -e CORS_ORIGINS=http://localhost:$PORT,http://localhost -e NODE_ENV=production -e BASE_URL=$BASE_URL"
if [[ $EXPOSE_DB =~ ^[Yy]$ ]]; then
    DOCKER_ENV_VARS="$DOCKER_ENV_VARS -e POSTGRES_PORT=$POSTGRES_PORT"
fi

echo "✅ Configuration ready for container runtime (no .env file will be created)"
echo ""

# Ask user if they want to start
read -p "Start Open Blog now? (Y/n): " START_NOW
START_NOW=${START_NOW:-Y}

if [[ $START_NOW =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting Open Blog..."
    
    # Create named volumes for persistent data (reuse existing if they exist)
    echo "📦 Creating persistent volumes..."
    docker volume create openblog-database-data >/dev/null 2>&1 || true
    docker volume create openblog-static-files >/dev/null 2>&1 || true
    echo "✅ Volumes ready (will reuse existing data if present)"
    
    # Stop any existing container
    docker stop open-blog 2>/dev/null || true
    docker rm open-blog 2>/dev/null || true
    

        # Start the container with persistent volumes
        if [[ $EXPOSE_DB =~ ^[Yy]$ ]]; then
            docker run -d \
                --name open-blog \
                -p $PORT:80 \
                -p $POSTGRES_PORT:5432 \
                -v openblog-database-data:/var/lib/postgresql/14/main \
                -v openblog-static-files:/app/static \
                $DOCKER_ENV_VARS \
                --restart unless-stopped \
                open-blog:latest
        else
            docker run -d \
                --name open-blog \
                -p $PORT:80 \
                -v openblog-database-data:/var/lib/postgresql/14/main \
                -v openblog-static-files:/app/static \
                $DOCKER_ENV_VARS \
                --restart unless-stopped \
                open-blog:latest
        fi
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Open Blog is starting!"
        echo ""
        echo "📍 Access your blog: http://localhost:$PORT"
        echo "🔧 Admin setup: http://localhost:$PORT/setup"
        echo ""
        echo "💾 Database password: $DB_PASSWORD"
        echo "🔐 JWT secret: [saved in environment]"
        echo ""
        echo "� Persistent data volumes:"
        echo "   • Database: openblog-database-data"
        echo "   • Files/uploads: openblog-static-files"
        echo ""
        echo "📊 Check status: docker ps"
        echo "📝 View logs: docker logs open-blog -f"
        echo "🛑 Stop: docker stop open-blog"
        echo "�️  Remove (keeps data): docker rm open-blog"
        echo "🗑️  Remove volumes: docker volume rm openblog-database-data openblog-static-files"
        echo ""
        echo "⏳ Note: First startup may take 1-2 minutes while the database initializes"
        echo "� Subsequent starts will reuse existing database and be much faster"
        echo "�💡 Tip: Re-running this script will reuse existing data and settings"
        echo "🗃️  Your data persists across container rebuilds and updates"
    else
        echo "❌ Failed to start Open Blog"
        exit 1
    fi
else
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📦 Persistent volumes created:"
    echo "   • Database: openblog-database-data"
    echo "   • Files/uploads: openblog-static-files"
    echo ""
    echo "To start later, run this script again or use:"
    echo "  docker start open-blog"
    echo ""
    echo "Your configuration is ready for deployment"
fi

echo ""
echo "🙏 Thank you for using Open Blog!"
