# Docker Deployment Guide

This guide explains how to deploy the News Scraper API using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Quick Start

### 1. Create Environment File

Create a `.env` file in the project root with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# API Security
API_KEY=your-secret-api-key-here

# CORS - Your frontend URL(s)
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Email Configuration
YAHOO_EMAIL=your-email@yahoo.com
YAHOO_APP_PASSWORD=your-yahoo-app-password

# Google Sheets (for news scraper)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_6ID=your-spreadsheet-id

# Scraper Configuration (optional)
SCRAPER_INTERVAL=30
```

### 2. Build and Run with Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### 3. Build and Run with Docker

```bash
# Build the image
docker build -t news-scraper-api .

# Run the container
docker run -d \
  --name news-scraper-api \
  -p 3001:3001 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  news-scraper-api

# View logs
docker logs -f news-scraper-api

# Stop the container
docker stop news-scraper-api
docker rm news-scraper-api
```

## Finding Your IP Address

When the container starts, it will automatically display the IP addresses you can use to connect to the API.

### From the Container Logs

```bash
docker-compose logs api
# or
docker logs news-scraper-api
```

Look for the section that shows:
```
💻 Connect from other devices using:
   http://192.168.1.100:3001
```

### Using the Helper Script

You can also run the helper script to get your IP:

```bash
node get-ip.js
```

### Manual Method

**On Linux/Mac:**
```bash
hostname -I | awk '{print $1}'
# or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```powershell
ipconfig | findstr IPv4
```

## Accessing the API

Once the container is running, you can access the API at:

- **Local:** `http://localhost:3001`
- **Network:** `http://YOUR_IP_ADDRESS:3001`

### Test the API

```bash
# Health check
curl http://localhost:3001/health

# From another device on the network
curl http://YOUR_IP_ADDRESS:3001/health
```

## Production Considerations

### 1. Use a Reverse Proxy

For production, use Nginx or Caddy as a reverse proxy with SSL:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Environment Variables

Never commit your `.env` file. Use Docker secrets or environment variable injection:

```bash
docker run -d \
  -p 3001:3001 \
  -e PORT=3001 \
  -e API_KEY=your-key \
  -e YAHOO_EMAIL=your-email \
  # ... other variables
  news-scraper-api
```

### 3. Data Persistence

The `data` directory is mounted as a volume to persist news data and logs:

```yaml
volumes:
  - ./data:/app/data
```

### 4. Health Checks

The container includes a health check. Monitor it with:

```bash
docker ps  # Check STATUS column
docker inspect news-scraper-api | grep -A 10 Health
```

### 5. Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  api:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Check if port is already in use
netstat -tulpn | grep 3001
# or on Windows
netstat -ano | findstr :3001
```

### Can't connect from other devices

1. **Check firewall:** Ensure port 3001 is open
2. **Check IP address:** Make sure you're using the correct network IP
3. **Check Docker network:** Ensure the container is on the correct network

### Environment variables not working

```bash
# Verify environment variables are loaded
docker exec news-scraper-api env | grep PORT

# Check .env file format (no spaces around =)
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or with plain Docker
docker stop news-scraper-api
docker rm news-scraper-api
docker build -t news-scraper-api .
docker run -d --name news-scraper-api -p 3001:3001 --env-file .env -v $(pwd)/data:/app/data --restart unless-stopped news-scraper-api
```

## Monitoring

### View Logs

```bash
# Follow logs
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Container Stats

```bash
docker stats news-scraper-api
```

## Backup

The `data` directory contains your news data and logs. Back it up regularly:

```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Restore
tar -xzf backup-YYYYMMDD.tar.gz
```

