# Quick Start with Docker

Get your API running in production with Docker in minutes!

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- A `.env` file with your configuration (see below)

## Step 1: Create `.env` File

Create a `.env` file in the project root:

```env
PORT=3001
NODE_ENV=production
API_KEY=your-secret-api-key-here
ALLOWED_ORIGINS=https://your-frontend.com
YAHOO_EMAIL=your-email@yahoo.com
YAHOO_APP_PASSWORD=your-app-password
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_6ID=your-spreadsheet-id
```

## Step 2: Start the Container

### Option A: Using Docker Compose (Recommended)

**Windows (PowerShell):**
```powershell
.\docker-start.ps1
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**Or manually:**
```bash
docker-compose up -d
```

### Option B: Using Docker Commands

```bash
# Build the image
docker build -t news-scraper-api .

# Run the container
docker run -d \
  --name news-scraper-api \
  -p 3001:3001 \
  --env-file .env \
  -v ./data:/app/data \
  --restart unless-stopped \
  news-scraper-api
```

## Step 3: Find Your IP Address

The server will automatically display IP addresses when it starts. Check the logs:

```bash
docker-compose logs api
```

Or use the helper script:
```bash
npm run get-ip
```

You'll see output like:
```
💻 Connect from other devices using:
   http://192.168.1.100:3001
```

## Step 4: Test the API

```bash
# Health check
curl http://localhost:3001/health

# From another device
curl http://YOUR_IP_ADDRESS:3001/health
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Restart the container
docker-compose restart

# View container status
docker ps

# Get IP address
npm run get-ip
```

## Troubleshooting

**Container won't start?**
- Check if port 3001 is already in use
- Verify your `.env` file exists and is properly formatted
- Check logs: `docker-compose logs api`

**Can't connect from other devices?**
- Make sure your firewall allows port 3001
- Verify you're using the correct IP address
- Check that Docker is running

For more details, see [DOCKER.md](./DOCKER.md)

