const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');
require('dotenv').config();

const emailRoutes = require('./routes/email');

// Import news scraper
let newsScraper = null;
try {
  newsScraper = require('./news-scraper');
} catch (error) {
  console.warn('⚠️ News scraper not available:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for Docker

// Function to get local IP addresses
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  
  return ips;
};

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'CSC API Server'
  });
});

// API routes
app.use('/api/email', emailRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, HOST, () => {
  const localIPs = getLocalIPs();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 CSC API Server is running!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n🌐 Access the API at:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://127.0.0.1:${PORT}`);
  
  if (localIPs.length > 0) {
    console.log(`\n💻 Connect from other devices using:`);
    localIPs.forEach(ip => {
      console.log(`   http://${ip}:${PORT}`);
    });
  } else {
    console.log(`\n⚠️  No network interfaces found. Using localhost only.`);
  }
  
  console.log(`\n📋 Available endpoints:`);
  console.log(`   Health:   http://localhost:${PORT}/health`);
  console.log(`   Email:    http://localhost:${PORT}/api/email`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Start news scraper if available and credentials are set
  if (newsScraper) {
    const requiredEnvVars = ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SPREADSHEET_6ID'];
    const hasAllVars = requiredEnvVars.every(varName => process.env[varName]);
    
    if (hasAllVars) {
      console.log(`📰 Starting news scraper (scheduled mode)...`);
      newsScraper.runScheduled();
    } else {
      console.log(`⚠️ News scraper credentials not fully configured. Scraper will not run.`);
      console.log(`   Required: ${requiredEnvVars.join(', ')}`);
    }
  }
});
