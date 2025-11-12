# Running Without Docker

If you don't want to install Docker, you can run the API directly with Node.js.

## Prerequisites

- Node.js 18 or higher installed
- npm (comes with Node.js)

## Step 1: Install Dependencies

```powershell
npm install
```

## Step 2: Create `.env` File

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

## Step 3: Start the Server

```powershell
npm start
```

The server will start and display your IP addresses automatically!

## Step 4: Find Your IP Address

The server will automatically show your IP addresses when it starts. You'll see output like:

```
💻 Connect from other devices using:
   http://192.168.1.100:3001
```

Or use the helper script:

```powershell
npm run get-ip
```

## Running in Production

For production, you might want to use PM2 to keep the server running:

```powershell
# Install PM2 globally
npm install -g pm2

# Start the server with PM2
npm run pm2:start

# View logs
npm run pm2:logs

# Stop the server
npm run pm2:stop
```

## Windows Firewall

If other devices can't connect, you may need to allow the port through Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `3001`
6. Select "Allow the connection"
7. Apply to all profiles
8. Name it "News Scraper API"

## Testing

```powershell
# Test locally
curl http://localhost:3001/health

# Test from another device (replace with your IP)
curl http://192.168.1.100:3001/health
```

