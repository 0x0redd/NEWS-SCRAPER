# Server Setup Guide

## Overview

This server is a separate Node.js/Express API that handles email sending and can be extended for other backend services. It runs independently from your Next.js application on Vercel.

## Architecture Decision

**Why a separate server?**
- Vercel may block or limit email sending functionality
- More control over backend services
- Can scale independently
- Easier to add new features (notifications, webhooks, etc.)

## Quick Start

### 1. Initial Setup

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server/` directory:

```env
# Server runs on this port
PORT=3001

# Generate a secure API key
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
API_KEY=your-generated-api-key-here

# Your frontend URL (for CORS)
ALLOWED_ORIGINS=https://csc-fsm.vercel.app

# Yahoo email credentials
YAHOO_EMAIL=your-email@yahoo.com
YAHOO_APP_PASSWORD=your-app-password
```

### 3. Update Next.js Environment Variables

Add these to your Vercel environment variables (or `.env.local` for local development):

```env
# URL of your API server (e.g., http://localhost:3001 or https://api.yourdomain.com)
# Use API_URL (server-side only, recommended) or NEXT_PUBLIC_API_URL (client-side accessible)
API_URL=http://localhost:3001

# Same API key as in server/.env
# Use API_KEY (server-side only, recommended) or NEXT_PUBLIC_API_KEY (client-side accessible)
API_KEY=your-generated-api-key-here

# Google Sheets Configuration (for form submissions)
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

**Important:** 
- `API_URL` and `API_KEY` are server-side only (recommended for security)
- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_KEY` are exposed to the client (use only if needed client-side)
- The code will check `API_URL`/`API_KEY` first, then fall back to `NEXT_PUBLIC_*` versions for backwards compatibility

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Deployment Options

### Option A: VPS/Cloud Server (Recommended)

1. **Upload server files** to your VPS
2. **Install Node.js** (v18 or higher)
3. **Install dependencies:** `npm install --production`
4. **Setup PM2** (process manager):

   **Option 1: Install PM2 locally (Recommended - No sudo needed)**

   ```bash
   # Install PM2 as a local dependency (or dev dependency)
   npm install --save-dev pm2
   
   # Use PM2 via npx
   npx pm2 start index.js --name csc-api
   npx pm2 save
   npx pm2 startup  # Auto-start on reboot (may require sudo)
   ```

   Or add a script to package.json for easier use:

   ```bash
   # Add to package.json scripts section:
   # "pm2:start": "pm2 start index.js --name csc-api",
   # "pm2:stop": "pm2 stop csc-api",
   # "pm2:restart": "pm2 restart csc-api",
   # "pm2:logs": "pm2 logs csc-api"
   ```

   **Option 2: Install PM2 globally with npm prefix (No sudo needed)**

   ```bash
   # Configure npm to use a directory in your home folder
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   
   # Now install PM2 globally without sudo
   npm install -g pm2
   pm2 start index.js --name csc-api
   pm2 save
   pm2 startup  # Auto-start on reboot (may require sudo)
   ```

   **Option 3: Use sudo (if you have sudo access)**

   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name csc-api
   pm2 save
   sudo pm2 startup  # Auto-start on reboot (requires sudo)
   ```

   **Note:** For `pm2 startup`, you'll need to follow the command it outputs (it usually requires running a sudo command it generates).

5. **Configure Google Cloud Firewall** to allow port 3001:

   **Option 1: Using Google Cloud Console (Web UI)**
   
   When creating the firewall rule, fill in the form as follows:
   
   - **Name:** `allow-api-server-port-3001` (or any descriptive name)
   - **Description:** `Allow public HTTP access to API server on port 3001`
   - **Network:** Select your VPC network (usually "default")
   - **Priority:** `1000` (default is fine)
   - **Direction of traffic:** Select **Ingress** (incoming traffic)
   - **Action on match:** Select **Allow**
   - **Targets:** Choose one of:
     - **All instances in the network** (if you want this to apply to all instances)
     - **Specified target tags** (recommended - set a tag like `api-server` on your instance)
   - **Source IP ranges:** Enter `0.0.0.0/0` (allows access from anywhere)
   - **Protocols and ports:** 
     - Select **TCP**
     - In the ports field, enter `3001` (or `3001-3001` if range format is required)
   
   Click **Create** to save the rule.
   
   **Important Security Note:** 
   - Using `0.0.0.0/0` allows access from anywhere on the internet
   - For better security, consider restricting to specific IP ranges if possible
   - Alternatively, use a reverse proxy (Nginx) with SSL on port 443 (HTTPS) and only expose port 443 publicly
   
   **Option 2: Using gcloud CLI**
   
   ```bash
   # Allow port 3001 from anywhere (public access)
   gcloud compute firewall-rules create allow-api-server-port-3001 \
     --direction=INGRESS \
     --priority=1000 \
     --network=default \
     --action=ALLOW \
     --rules=tcp:3001 \
     --source-ranges=0.0.0.0/0 \
     --target-tags=api-server \
     --description="Allow public HTTP access to API server on port 3001"
   
   # Then tag your instance:
   gcloud compute instances add-tags INSTANCE_NAME --tags=api-server --zone=ZONE
   ```
   
   **Verify the firewall rule:**
   
   ```bash
   # Check if rule was created
   gcloud compute firewall-rules list --filter="name:allow-api-server-port-3001"
   
   # Test connectivity (replace EXTERNAL_IP with your instance's external IP)
   curl http://EXTERNAL_IP:3001/health
   ```

6. **Setup reverse proxy** (Nginx example) - Recommended for production:

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

7. **Add SSL** with Let's Encrypt:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Option B: Docker

```bash
docker build -t csc-api .
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  --name csc-api \
  --restart unless-stopped \
  csc-api
```

### Option C: Railway/Render/Fly.io

These platforms can deploy directly from your repo:
1. Connect your repository
2. Set environment variables
3. Deploy

## Testing

### 1. Health Check

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "service": "CSC API Server"
}
```

### 2. Email Service Status

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/email/status
```

### 3. Send Test Email

```bash
curl -X POST http://localhost:3001/api/email/welcome \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "recipientEmail": "test@example.com",
    "recipientName": "Test User",
    "recipientDateNaissance": "2000-01-01",
    "recipientFiliere": "Computer Science",
    "recipientCodeMassar": "TEST123",
    "recipientUserCode": "CSC-TEST-1234"
  }'
```

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs csc-api

# View status
pm2 status

# Restart
pm2 restart csc-api

# Stop
pm2 stop csc-api
```

### System Logs

```bash
# If using systemd
journalctl -u csc-api -f

# View recent logs
journalctl -u csc-api -n 100
```

## Security Checklist

- [ ] Strong API key generated (32+ characters)
- [ ] `.env` file not committed to git
- [ ] CORS configured with specific origins
- [ ] HTTPS enabled (via reverse proxy)
- [ ] Firewall configured (only necessary ports open)
- [ ] Rate limiting enabled (already configured)
- [ ] Server runs as non-root user
- [ ] Regular security updates

## Troubleshooting

### Email not sending

1. **Check Yahoo credentials:**
   - Use App Password, not regular password
   - Generate at: https://login.yahoo.com/account/security

2. **Check server logs:**
   ```bash
   pm2 logs csc-api
   ```

3. **Test SMTP connection:**
   ```bash
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     host: 'smtp.mail.yahoo.com',
     port: 465,
     secure: true,
     auth: { user: process.env.YAHOO_EMAIL, pass: process.env.YAHOO_APP_PASSWORD }
   });
   transporter.verify().then(() => console.log('OK')).catch(console.error);
   "
   ```

### API not responding

1. Check if server is running: `pm2 status`
2. Check port is open: `netstat -tulpn | grep 3001`
3. Check firewall rules
4. Verify CORS settings if getting CORS errors

### CORS errors

1. Verify `ALLOWED_ORIGINS` includes your frontend URL
2. No trailing slashes in URLs
3. Protocol matches (http vs https)

## Next Steps

Once the server is running:

1. **Update Vercel environment variables** with your API URL and key
2. **Test the integration** by submitting a form
3. **Monitor logs** to ensure emails are being sent
4. **Set up monitoring/alerts** for production

## Adding New Features

The server is designed to be extended. To add a new endpoint:

1. Create route file: `routes/your-feature.js`
2. Add to `index.js`:
   ```javascript
   const yourRoutes = require('./routes/your-feature');
   app.use('/api/your-feature', yourRoutes);
   ```
3. Add authentication if needed:
   ```javascript
   router.use(validateApiKey);
   ```

See `server/README.md` for more details.
