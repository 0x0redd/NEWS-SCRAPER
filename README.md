# FS-UMI News Scraper

A standalone Node.js script that scrapes news from the FS-UMI website and automatically updates a Google Sheet. This script can run on any server and keep your news data synchronized.

## Features

- 🔄 **Automated Scraping**: Fetches news from multiple pages of the FS-UMI website
- 📊 **Google Sheets Integration**: Automatically updates your Google Sheet with new news
- 💾 **Local Backup**: Saves data locally as JSON for backup
- ⏰ **Scheduled Updates**: Can run continuously or as a one-time job
- 🛡️ **Error Handling**: Robust error handling with detailed logging
- 🔍 **Duplicate Prevention**: Avoids adding duplicate news items

## Prerequisites

- Node.js 18+ installed on your server
- Google Service Account with Sheets API access
- Google Sheet with proper permissions

## Installation

1. **Clone or download the script files:**
   ```bash
   # Download the files to your server
   wget https://your-server.com/news-scraper.js
   wget https://your-server.com/package.json
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   **Option A: Using .env file (Recommended for local development):**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env file with your actual credentials
   # Replace the empty values with your Google Cloud credentials
   ```
   
   **Option B: Using system environment variables:**
   ```bash
   export GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
   export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
   export GOOGLE_SPREADSHEET_6ID="your-google-sheet-id"
   export SCRAPER_INTERVAL="30"  # Optional: minutes between runs (default: 30)
   ```

## Usage

### Run Once
```bash
npm run once
# or
node news-scraper.js --once
```

### Run Continuously (Scheduled)
```bash
npm start
# or
node news-scraper.js --schedule
```

### Test Run
```bash
npm test
```

## Configuration

Edit the `CONFIG` object in `news-scraper.js` to customize:

```javascript
const CONFIG = {
  // Google Sheets
  SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_6ID,
  SHEET_NAME: "Sheet1",
  
  // Scraping
  BASE_URL: "https://www.fs-umi.ac.ma/index.php/actualites/",
  PAGES_TO_FETCH: 3, // Number of pages to scrape
  REQUEST_DELAY: 1000, // Delay between requests (ms)
  
  // Scheduling
  INTERVAL_MINUTES: parseInt(process.env.SCRAPER_INTERVAL) || 30,
  
  // Local storage (backup)
  DATA_DIR: path.join(__dirname, "data"),
  NEWS_FILE: "news.json",
  LOG_FILE: "scraper.log"
};
```

## Google Sheets Setup

1. **Create a Google Sheet** with the following columns:
   - Column A: Title
   - Column B: Date
   - Column C: Link
   - Column D: Image URL
   - Column E: Categories

2. **Set up a Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create a Service Account
   - Download the JSON key file
   - Share your Google Sheet with the service account email

3. **Set environment variables** with your service account credentials:
   
   **For .env file setup:**
   - Copy `.env.example` to `.env`
   - Fill in your actual Google Cloud credentials
   - Make sure to include the `\n` characters in the private key
   
   **For system environment variables:**
   - Set the variables in your shell or system environment
   - Ensure the private key includes proper newline characters

## Deployment Options

### Option 1: VPS/Server
```bash
# Install PM2 for process management
npm install -g pm2

# Start the scraper
pm2 start news-scraper.js --name "news-scraper" -- --schedule

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "news-scraper.js", "--schedule"]
```

### Option 3: Cron Job
```bash
# Add to crontab (runs every 30 minutes)
*/30 * * * * cd /path/to/scraper && node news-scraper.js --once
```

## Monitoring

The script creates detailed logs in the `data/scraper.log` file:

```
[2024-01-15T10:30:00.000Z] [INFO] 🔄 Starting news scraping process...
[2024-01-15T10:30:01.000Z] [INFO] 📚 Loaded 15 existing news items
[2024-01-15T10:30:02.000Z] [INFO] ✅ Fetched 12 news items from 3 pages
[2024-01-15T10:30:03.000Z] [INFO] 🆕 Found 3 new news items
[2024-01-15T10:30:04.000Z] [INFO] ✅ Updated Google Sheets with 18 news items
```

## Troubleshooting

### Common Issues

1. **Google Sheets Access Denied**
   - Ensure the service account email has access to the sheet
   - Check that the Google Sheets API is enabled
   - Verify the spreadsheet ID is correct

2. **Scraping Fails**
   - Check your internet connection
   - Verify the FS-UMI website is accessible
   - The website structure might have changed

3. **Environment Variables Not Set**
   - Double-check all required environment variables
   - Ensure the private key includes `\n` characters

### Debug Mode

Run with verbose logging:
```bash
DEBUG=* node news-scraper.js --once
```

## File Structure

```
news-scraper/
├── news-scraper.js      # Main scraper script
├── package.json         # Dependencies and scripts
├── .env.example         # Environment variables template
├── .env                 # Your actual environment variables (create this)
├── README.md           # This file
└── data/               # Created automatically
    ├── news.json       # Local backup of news data
    └── scraper.log     # Detailed logs
```

## Security Notes

- Keep your service account credentials secure
- Don't commit environment variables to version control
- Use environment variables or secure secret management
- Regularly rotate your service account keys

## Support

For issues or questions:
1. Check the logs in `data/scraper.log`
2. Verify your Google Sheets setup
3. Test with `--once` flag first
4. Check the FS-UMI website structure

## License

MIT License - Feel free to modify and use as needed.