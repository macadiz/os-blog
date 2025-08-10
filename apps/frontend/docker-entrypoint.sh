#!/bin/sh

# Frontend Docker entrypoint script
# This script allows for runtime configuration of the Angular app

set -e

# Default backend URL if not provided
BACKEND_URL=${BACKEND_URL:-"http://localhost:3000"}

echo "Configuring frontend for backend URL: $BACKEND_URL"

# Replace placeholder in environment files
if [ -f "/usr/share/nginx/html/assets/config.json" ]; then
    sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" /usr/share/nginx/html/assets/config.json
fi

# Execute the main command
exec "$@"
