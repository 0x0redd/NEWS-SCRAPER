module.exports = {
  apps: [
    {
      name: 'fs-umi-news-scraper',
      script: 'news-scraper.js',
      args: '--schedule',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
        GOOGLE_SPREADSHEET_6ID: process.env.GOOGLE_SPREADSHEET_6ID,
        SCRAPER_INTERVAL: process.env.SCRAPER_INTERVAL || '30'
      },
      error_file: './data/error.log',
      out_file: './data/out.log',
      log_file: './data/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
