# PowerShell script to start the Docker container and display connection info

Write-Host "🐳 Starting News Scraper API with Docker..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your configuration." -ForegroundColor Yellow
    exit 1
}

# Start Docker Compose
Write-Host "`n📦 Building and starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Container started successfully!" -ForegroundColor Green
    
    # Wait a moment for the container to start
    Start-Sleep -Seconds 2
    
    # Get container logs to show IP info
    Write-Host "`n📋 Container logs (showing IP addresses):" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Gray
    docker-compose logs --tail=30 api
    
    Write-Host "`n💡 Useful commands:" -ForegroundColor Yellow
    Write-Host "   View logs:     docker-compose logs -f" -ForegroundColor White
    Write-Host "   Stop:          docker-compose down" -ForegroundColor White
    Write-Host "   Restart:       docker-compose restart" -ForegroundColor White
    Write-Host "   Get IP:        npm run get-ip" -ForegroundColor White
    
} else {
    Write-Host "`n❌ Failed to start container. Check the error above." -ForegroundColor Red
    exit 1
}

