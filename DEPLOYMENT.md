# Open Blog - Docker Deployment Guide

This guide will help you deploy Open Blog using Docker Compose with minimal technical knowledge required.

## Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed on your system
- At least 2GB of available RAM
- 5GB of free disk space

### 2. Setup Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit the configuration file with your preferences
nano .env  # or use any text editor
```

### 3. Launch the Application
```bash
# For production deployment
docker-compose up -d

# To view logs
docker-compose logs -f

# To stop the application
docker-compose down
```

### 4. Access Your Blog
- **Blog Website**: http://localhost (or your server IP)
- **Admin Setup**: http://localhost/setup (first-time setup)

## Configuration Options

### Basic Settings

Edit the `.env` file to customize these settings:

#### Ports
- `FRONTEND_PORT=80` - Web server port (default: 80)
- `BACKEND_PORT=3000` - API server port (default: 3000, usually not needed to change)
- `POSTGRES_PORT=5432` - Database port (default: 5432, only exposed if needed)

#### Database
- `POSTGRES_DB=open_blog` - Database name
- `POSTGRES_USER=blog_user` - Database username
- `POSTGRES_PASSWORD=secure_blog_password_change_this` - **IMPORTANT: Change this!**

#### Security
- `JWT_SECRET=your_super_secret_jwt_key...` - **IMPORTANT: Change this to a random string!**
- `CORS_ORIGIN=http://localhost` - Update to your domain in production

### Advanced Settings

#### Database Access
By default, the database is only accessible from within the Docker network for security. If you need direct database access:

```bash
# Uncomment this line in .env
EXPOSE_DATABASE=true
```

#### Resource Limits
The Docker Compose file includes sensible resource limits. For servers with limited resources, you can create a custom override.

#### Custom Domain
To use a custom domain:

1. Update `CORS_ORIGIN` in `.env`
2. Configure your reverse proxy (nginx, Apache, etc.) to point to port 80
3. Set up SSL certificates if needed

## Deployment Scenarios

### Production Deployment
```bash
# Use production overrides for better security and performance
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Development Deployment
```bash
# Use development overrides for easier debugging
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Custom Port Example
If you need to run on a different port (e.g., port 8080):

```bash
# In .env file
FRONTEND_PORT=8080

# Then access via
# http://localhost:8080
```

## Maintenance

### Backup Database
```bash
# Create a database backup
docker exec open-blog_database pg_dump -U blog_user open_blog > backup.sql

# Restore from backup
cat backup.sql | docker exec -i open-blog_database psql -U blog_user -d open_blog
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database

# Follow logs in real-time
docker-compose logs -f
```

### Reset Everything
```bash
# WARNING: This will delete all data!
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change `FRONTEND_PORT` in `.env` to an available port
   - Make sure no other services are using ports 80, 3000, or 5432

2. **Database Connection Failed**
   - Wait a few minutes for database to fully initialize
   - Check logs: `docker-compose logs database`

3. **Frontend Can't Connect to Backend**
   - Ensure all services are running: `docker-compose ps`
   - Check backend logs: `docker-compose logs backend`

4. **Permission Denied Errors**
   - Ensure Docker has proper permissions
   - Check file ownership in mounted volumes

### Health Checks
All services include health checks. Check status with:
```bash
docker-compose ps
```

Healthy services will show "Up (healthy)".

## Security Recommendations

### For Production Use

1. **Change Default Passwords**
   - Update `POSTGRES_PASSWORD` to a strong password
   - Update `JWT_SECRET` to a long, random string

2. **Network Security**
   - Don't expose database port (`EXPOSE_DATABASE=false`)
   - Use a reverse proxy with SSL (nginx, Cloudflare, etc.)
   - Consider using Docker secrets for sensitive data

3. **Resource Monitoring**
   - Monitor disk space (logs and database can grow)
   - Set up log rotation
   - Monitor memory usage

4. **Backups**
   - Set up automated database backups
   - Store backups in a secure location
   - Test backup restoration regularly

### Example Nginx Reverse Proxy Config

If using nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Support

For issues and questions:
1. Check the logs first: `docker-compose logs`
2. Review this documentation
3. Check the GitHub repository for issues and updates
