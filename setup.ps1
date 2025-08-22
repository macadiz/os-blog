# OS Blog Deployment Setup - PowerShell Version
Write-Host "OS Blog Deployment" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $null = Get-Command docker -ErrorAction Stop
    Write-Host "Docker is installed" -ForegroundColor Green
}
catch {
    Write-Host "Docker is not installed. Please install Docker first." -ForegroundColor Red
    Write-Host "Visit: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Building docker image" -ForegroundColor Yellow
Write-Host ""

# Build Docker image
docker build -t os-blog:latest .

# Ask user for basic configuration
Write-Host "Configuration" -ForegroundColor Cyan
Write-Host "-------------" -ForegroundColor Cyan

$PORT = Read-Host "Enter port for your blog (default: 80)"
if ([string]::IsNullOrEmpty($PORT)) {
    $PORT = "80"
}

# Ask if user wants to expose the database port
$EXPOSE_DB = Read-Host "Do you want to expose the database port to your host? (y/N)"
if ([string]::IsNullOrEmpty($EXPOSE_DB)) {
    $EXPOSE_DB = "N"
}

$POSTGRES_PORT = ""
if ($EXPOSE_DB -match "^[Yy]$") {
    Write-Host "WARNING: Exposing the database port could make your database accessible from the public internet." -ForegroundColor Yellow
    Write-Host "Only expose the port if you understand the security risks and have secured your environment." -ForegroundColor Yellow
    $POSTGRES_PORT = Read-Host "Enter host port to map to database (default: 5432)"
    if ([string]::IsNullOrEmpty($POSTGRES_PORT)) {
        $POSTGRES_PORT = "5432"
    }
    Write-Host "Database will be accessible on localhost:$POSTGRES_PORT" -ForegroundColor Green
}
else {
    $POSTGRES_PORT = ""
    Write-Host "Database port will not be exposed to host." -ForegroundColor Blue
}

$DB_PASSWORD = Read-Host "Enter database password (minimum 8 chars, leave empty for auto-generated)"
if ([string]::IsNullOrEmpty($DB_PASSWORD) -or $DB_PASSWORD.Length -lt 8) {
    if ($DB_PASSWORD.Length -gt 0 -and $DB_PASSWORD.Length -lt 8) {
        Write-Host "Password too short! Generating secure password..." -ForegroundColor Yellow
    }
    
    # Generate secure password
    try {
        $bytes = New-Object byte[] 20
        [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
        $DB_PASSWORD = [Convert]::ToBase64String($bytes)
    }
    catch {
        # Fallback method
        Add-Type -AssemblyName System.Web
        $DB_PASSWORD = [System.Web.Security.Membership]::GeneratePassword(20, 5)
    }
    Write-Host "Generated secure database password (20 chars)" -ForegroundColor Green
}

$JWT_SECRET = Read-Host "Enter JWT secret (minimum 32 chars, leave empty for auto-generated)"
if ([string]::IsNullOrEmpty($JWT_SECRET) -or $JWT_SECRET.Length -lt 32) {
    if ($JWT_SECRET.Length -gt 0 -and $JWT_SECRET.Length -lt 32) {
        Write-Host "JWT secret too short! Generating secure secret..." -ForegroundColor Yellow
    }
    
    # Generate secure JWT secret
    try {
        $bytes = New-Object byte[] 48
        [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
        $JWT_SECRET = [Convert]::ToBase64String($bytes)
    }
    catch {
        # Fallback method
        Add-Type -AssemblyName System.Web
        $JWT_SECRET = [System.Web.Security.Membership]::GeneratePassword(48, 8)
    }
    Write-Host "Generated secure JWT secret (48 chars)" -ForegroundColor Green
}

Write-Host ""

# Check if image exists
try {
    $null = docker image inspect os-blog:latest 2>$null
    Write-Host "Docker image already exists" -ForegroundColor Green
}
catch {
    Write-Host "Building application..." -ForegroundColor Yellow
    try {
        if (Test-Path "build.ps1") {
            & .\build.ps1
        }
        elseif (Test-Path "build.sh") {
            bash build.sh
        }
        else {
            throw "Build script not found"
        }
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Host "Build failed. Please check the build output above." -ForegroundColor Red
        exit 1
    }
}

$BASE_URL = "http://localhost:$PORT"
Write-Host "Configuration ready" -ForegroundColor Green
Write-Host ""

# Compose docker run environment variables
$DOCKER_ENV_VARS = @(
    "-e", "PORT=$PORT",
    "-e", "POSTGRES_PASSWORD=$DB_PASSWORD",
    "-e", "JWT_SECRET=$JWT_SECRET",
    "-e", "POSTGRES_DB=open_blog",
    "-e", "POSTGRES_USER=blog_user",
    "-e", "CORS_ORIGINS=http://localhost:$PORT,http://localhost",
    "-e", "NODE_ENV=production",
    "-e", "BASE_URL=$BASE_URL"
)

if ($EXPOSE_DB -match "^[Yy]$") {
    $DOCKER_ENV_VARS += @("-e", "POSTGRES_PORT=$POSTGRES_PORT")
}

Write-Host "Configuration ready for container runtime (no .env file will be created)" -ForegroundColor Green
Write-Host ""

# Ask user if they want to start
$START_NOW = Read-Host "Start OS Blog now? (Y/n)"
if ([string]::IsNullOrEmpty($START_NOW)) {
    $START_NOW = "Y"
}

if ($START_NOW -match "^[Yy]$") {
    Write-Host ""
    Write-Host "Starting OS Blog..." -ForegroundColor Cyan
    
    # Create named volumes for persistent data (reuse existing if they exist)
    Write-Host "Creating persistent volumes..." -ForegroundColor Yellow
    docker volume create os-blog-database-data 2>$null | Out-Null
    docker volume create os-blog-static-files 2>$null | Out-Null
    Write-Host "Volumes ready (will reuse existing data if present)" -ForegroundColor Green
    
    # Stop any existing container
    docker stop os-blog 2>$null | Out-Null
    docker rm os-blog 2>$null | Out-Null
    
    # Build docker run command
    $dockerArgs = @(
        "run", "-d",
        "--name", "os-blog",
        "-p", "$PORT`:80",
        "-v", "os-blog-database-data:/var/lib/postgresql/data",
        "-v", "os-blog-static-files:/app/static"
    )
    
    $dockerArgs += $DOCKER_ENV_VARS
    
    if ($EXPOSE_DB -match "^[Yy]$") {
        $dockerArgs += @("-p", "$POSTGRES_PORT`:5432")
    }
    
    $dockerArgs += @("--restart", "unless-stopped", "os-blog:latest")
    
    # Start the container with persistent volumes
    $result = & docker @dockerArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "OS Blog is starting!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access your blog: http://localhost:$PORT" -ForegroundColor Cyan
        Write-Host "Admin setup: http://localhost:$PORT/setup" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Database password: $DB_PASSWORD" -ForegroundColor Yellow
        Write-Host "JWT secret: [saved in environment]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Persistent data volumes:" -ForegroundColor Magenta
        Write-Host "   Database: os-blog-database-data" -ForegroundColor White
        Write-Host "   Files/uploads: os-blog-static-files" -ForegroundColor White
        Write-Host ""
        Write-Host "Check status: docker ps" -ForegroundColor Blue
        Write-Host "View logs: docker logs os-blog -f" -ForegroundColor Blue
        Write-Host "Stop: docker stop os-blog" -ForegroundColor Blue
        Write-Host "Remove (keeps data): docker rm os-blog" -ForegroundColor Blue
        Write-Host "Remove volumes: docker volume rm os-blog-database-data os-blog-static-files" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Note: First startup may take 1-2 minutes while the database initializes" -ForegroundColor Yellow
        Write-Host "Subsequent starts will reuse existing database and be much faster" -ForegroundColor Yellow
        Write-Host "Tip: Re-running this script will reuse existing data and settings" -ForegroundColor Yellow
        Write-Host "Your data persists across container rebuilds and updates" -ForegroundColor Yellow
    }
    else {
        Write-Host "Failed to start OS Blog" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host ""
    Write-Host "Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Persistent volumes created:" -ForegroundColor Magenta
    Write-Host "   Database: os-blog-database-data" -ForegroundColor White
    Write-Host "   Files/uploads: os-blog-static-files" -ForegroundColor White
    Write-Host ""
    Write-Host "To start later, run this script again or use:" -ForegroundColor Cyan
    Write-Host "  docker start os-blog" -ForegroundColor White
    Write-Host ""
    Write-Host "Your configuration is ready for deployment" -ForegroundColor Green
}

Write-Host ""
Write-Host "Thank you for using OS Blog!" -ForegroundColor Cyan