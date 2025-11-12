# CSC API Server

Backend API server for the CSC landing page. Handles email sending and other backend services.

## Features

- ✅ RESTful API with Express.js
- ✅ API key authentication
- ✅ Email sending via Nodemailer (Yahoo SMTP)
- ✅ Rate limiting for security
- ✅ CORS configuration
- ✅ Health check endpoint
- ✅ Easy to extend for future features

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# API Security - Generate a strong random key
API_KEY=your-secret-api-key-here

# CORS - Your frontend URL(s)
ALLOWED_ORIGINS=https://csc-fsm.vercel.app

# Email Configuration
YAHOO_EMAIL=your-email@yahoo.com
YAHOO_APP_PASSWORD=your-yahoo-app-password
```

### Generate API Key

You can generate a secure API key using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Email Service Status
```
GET /api/email/status
Headers: X-API-Key: your-api-key
```
Returns email service configuration status.

### Send Welcome Email
```
POST /api/email/welcome
Headers: 
  X-API-Key: your-api-key
  Content-Type: application/json

Body:
{
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "recipientDateNaissance": "2000-01-01",
  "recipientFiliere": "Computer Science",
  "recipientCodeMassar": "MASSAR123",
  "recipientUserCode": "CSC-ABC12345-6789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id-from-smtp"
}
```

## Deployment

### Option 1: PM2 (Recommended for Linux/VPS)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start index.js --name csc-api

# Save PM2 configuration
pm2 save

# Setup auto-restart on system reboot
pm2 startup
```

### Option 2: Systemd Service (Linux)

Create `/etc/systemd/system/csc-api.service`:

```ini
[Unit]
Description=CSC API Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/server
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable csc-api
sudo systemctl start csc-api
```

### Option 3: Docker (Recommended for Production)

**Prerequisites:** Docker Desktop must be installed. See [INSTALL-DOCKER.md](./INSTALL-DOCKER.md) for installation instructions.

**Quick Start:**
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or using npm scripts
npm run docker:up

# View logs to see IP addresses
docker-compose logs api
```

**Detailed Guide:** See [QUICKSTART-DOCKER.md](./QUICKSTART-DOCKER.md) and [DOCKER.md](./DOCKER.md)

**Note:** If Docker is not installed, you can run the server directly with Node.js. See [RUN-WITHOUT-DOCKER.md](./RUN-WITHOUT-DOCKER.md)

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong API keys** - Generate random 32+ character keys
3. **Enable HTTPS** - Use a reverse proxy (Nginx/Caddy) with SSL
4. **Firewall rules** - Only expose the necessary port (3001)
5. **Rate limiting** - Already configured (100 requests per 15 minutes per IP)
6. **CORS** - Restrict `ALLOWED_ORIGINS` to your frontend domains only

## Monitoring

### Logs

Check PM2 logs:
```bash
pm2 logs csc-api
```

Or systemd logs:
```bash
journalctl -u csc-api -f
```

### Health Monitoring

You can set up monitoring to check the `/health` endpoint periodically:

```bash
curl http://localhost:3001/health
```

## Extending the Server

To add new endpoints:

1. Create a new route file in `routes/` (e.g., `routes/notifications.js`)
2. Add the route to `index.js`:
   ```javascript
   const notificationsRoutes = require('./routes/notifications');
   app.use('/api/notifications', notificationsRoutes);
   ```
3. Add authentication middleware if needed:
   ```javascript
   router.use(validateApiKey);
   ```

## Troubleshooting

### Email not sending

1. Check Yahoo credentials are correct
2. Verify Yahoo App Password is set (not regular password)
3. Check firewall isn't blocking port 465
4. Review server logs for error messages

### API key not working

1. Verify API key matches in both server `.env` and client code
2. Check header name: should be `X-API-Key` or `Authorization: Bearer <key>`
3. Ensure no extra spaces in the API key

### CORS errors

1. Verify `ALLOWED_ORIGINS` includes your frontend URL
2. Check for trailing slashes in URLs
3. Ensure protocol (http/https) matches

## Support

For issues or questions, check the server logs first:
```bash
# PM2
pm2 logs csc-api

# Systemd
journalctl -u csc-api -n 100
```
