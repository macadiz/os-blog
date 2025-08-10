#!/bin/bash

# Build script for Open Blog Monolith
# This script builds the frontend and backend, then creates a single Docker image

set -e

echo "🏗️  Building Open Blog Monolith..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
mkdir -p dist/frontend dist/backend

# Build frontend
echo "⚛️  Building frontend..."
cd apps/frontend
npm run build
cp -r dist/frontend/* ../../dist/frontend/
cd ../..

# Build backend
echo "🚀 Building backend..."
cd apps/backend
npm run build
cp -r dist/* ../../dist/backend/
cp package*.json ../../dist/backend/
cp -r prisma ../../dist/backend/
cd ../..

# Copy shared types
echo "📦 Copying shared types..."
cp -r libs dist/ || true

# Install production dependencies
echo "📥 Installing production dependencies..."
cd dist/backend
npm ci --only=production
cd ../..

echo "🐳 Building Docker image..."
docker build -f Dockerfile.monolith -t open-blog:monolith .

echo "✅ Build complete!"
echo ""
echo "🚀 To run the monolith:"
echo "   docker run -p 80:80 -e POSTGRES_PASSWORD=your_password open-blog:monolith"
echo ""
echo "🌐 Access your blog at: http://localhost"
