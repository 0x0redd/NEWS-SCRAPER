#!/bin/bash

# Bash script to start the Docker container and display connection info

echo "🐳 Starting News Scraper API with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your configuration."
    exit 1
fi

# Start Docker Compose
echo ""
echo "📦 Building and starting containers..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container started successfully!"
    
    # Wait a moment for the container to start
    sleep 2
    
    # Get container logs to show IP info
    echo ""
    echo "📋 Container logs (showing IP addresses):"
    echo "============================================================"
    docker-compose logs --tail=30 api
    
    echo ""
    echo "💡 Useful commands:"
    echo "   View logs:     docker-compose logs -f"
    echo "   Stop:          docker-compose down"
    echo "   Restart:       docker-compose restart"
    echo "   Get IP:        npm run get-ip"
    
else
    echo ""
    echo "❌ Failed to start container. Check the error above."
    exit 1
fi

