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

# Create .env file
echo "📝 Creating configuration file..."
cat > .env << EOF
PORT=$PORT
POSTGRES_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
POSTGRES_DB=open_blog
POSTGRES_USER=blog_user
CORS_ORIGINS=http://localhost:$PORT,http://localhost
NODE_ENV=production
EOF

echo "✅ Configuration saved to .env"
echo ""

# Ask user if they want to start
read -p "Start Open Blog now? (Y/n): " START_NOW
START_NOW=${START_NOW:-Y}

if [[ $START_NOW =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting Open Blog..."
    
    # Stop any existing container
    docker stop open-blog 2>/dev/null || true
    docker rm open-blog 2>/dev/null || true
    
    # Start the container
    docker run -d \
      --name open-blog \
      -p $PORT:80 \
      --env-file .env \
      --restart unless-stopped \
      open-blog:latest
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Open Blog is starting!"
        echo ""
        echo "📍 Access your blog: http://localhost:$PORT"
        echo "🔧 Admin setup: http://localhost:$PORT/setup"
        echo ""
        echo "💾 Database password: $DB_PASSWORD"
        echo "🔐 JWT secret: [saved in .env file]"
        echo ""
        echo "📊 Check status: docker-compose -f docker-compose.monolith.yml ps"
        echo "📝 View logs: docker-compose -f docker-compose.monolith.yml logs -f"
        echo "🛑 Stop: docker-compose -f docker-compose.monolith.yml down"
        echo ""
        echo "⏳ Note: First startup may take 1-2 minutes while the database initializes"
    else
        echo "❌ Failed to start Open Blog"
        exit 1
    fi
else
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To start later:"
    echo "  docker-compose -f docker-compose.monolith.yml up -d"
    echo ""
    echo "Your configuration is saved in .env"
fi

echo ""
echo "🙏 Thank you for using Open Blog!"
