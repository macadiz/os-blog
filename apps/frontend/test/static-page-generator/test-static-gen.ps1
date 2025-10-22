# Test script for static page generation (Windows PowerShell)
# This script helps verify that OpenGraph tags are generated correctly

Write-Host "🧪 Testing Static Page Generation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to static-generator directory
$staticGenDir = Join-Path $PSScriptRoot "..\..\static-generator"
Set-Location $staticGenDir

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env and set BASE_URL to your production domain!" -ForegroundColor Yellow
    Write-Host ""
}

# Show current configuration
Write-Host "📍 Current Configuration:" -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "   (from .env file)" -ForegroundColor Gray
    Get-Content ".env" | Select-String -Pattern "^(API_URL|BASE_URL|DIST_DIR)" | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "   Using defaults from generate-static-pages.js" -ForegroundColor Gray
}
Write-Host ""

# Run the generator
Write-Host "🔨 Running static page generator..." -ForegroundColor Cyan
node generate-static-pages.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Generation completed successfully!" -ForegroundColor Green
    Write-Host ""

    # Find and display a sample generated file
    $sampleFile = Get-ChildItem -Path "..\..\dist\frontend\blog" -Filter "index.html" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($sampleFile) {
        Write-Host "📄 Sample OpenGraph tags from: $($sampleFile.FullName)" -ForegroundColor Cyan
        Write-Host "---" -ForegroundColor Gray

        $content = Get-Content $sampleFile.FullName -Raw
        if ($content -match "<!-- OpenGraph tags -->[\s\S]*?<!-- Twitter Card tags -->") {
            $matches[0] | Select-String -Pattern "(og:|twitter:)" | ForEach-Object { Write-Host $_.Line.Trim() -ForegroundColor White }
        } else {
            Write-Host "⚠️  No OpenGraph tags found!" -ForegroundColor Yellow
        }

        Write-Host "---" -ForegroundColor Gray
        Write-Host ""
        Write-Host "💡 To test OpenGraph tags:" -ForegroundColor Cyan
        Write-Host "   1. Deploy your site or serve the dist folder" -ForegroundColor White
        Write-Host "   2. Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/" -ForegroundColor White
        Write-Host "   3. Use Twitter Card Validator: https://cards-dev.twitter.com/validator" -ForegroundColor White
        Write-Host "   4. Use LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/" -ForegroundColor White
    } else {
        Write-Host "⚠️  No generated files found in dist/frontend/blog/" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Generation failed!" -ForegroundColor Red
    exit 1
}
