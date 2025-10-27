#!/usr/bin/env node

/**
 * News Scraper for FS-UMI Website
 * 
 * This script scrapes news from the FS-UMI website and updates a Google Sheet.
 * It can be run as a standalone script on any server with Node.js.
 * 
 * Usage:
 *   node news-scraper.js
 * 
 * Environment Variables Required:
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   - GOOGLE_PRIVATE_KEY
 *   - GOOGLE_SPREADSHEET_6ID
 *   - SCRAPER_INTERVAL (optional, in minutes, default: 30)
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
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

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
  }
};

// Logging utility
const log = (message, level = "INFO") => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logMessage);
  
  // Also write to log file
  ensureDataDir();
  fs.appendFileSync(
    path.join(CONFIG.DATA_DIR, CONFIG.LOG_FILE), 
    logMessage + "\n"
  );
};

// Google Sheets authentication
const googleAuth = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.");
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
};

// Get the actual sheet name from the spreadsheet
const getSheetName = async (auth) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
    });
    
    const sheetNames = response.data.sheets.map(sheet => sheet.properties.title);
    log(`📋 Available sheet names: ${sheetNames.join(", ")}`);
    
    return sheetNames[0] || CONFIG.SHEET_NAME;
  } catch (error) {
    log(`❌ Error getting sheet names: ${error.message}`, "ERROR");
    return CONFIG.SHEET_NAME;
  }
};

// Load existing news from Google Sheets
const loadExistingNewsFromSheets = async () => {
  try {
    log("🔍 Loading existing news from Google Sheets...");
    
    if (!CONFIG.SPREADSHEET_ID) {
      throw new Error("GOOGLE_SPREADSHEET_6ID environment variable not set");
    }
    
    const auth = await googleAuth();
    const actualSheetName = await getSheetName(auth);
    log(`📋 Using sheet name: ${actualSheetName}`);
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      range: `${actualSheetName}!A:E`, // A: title, B: date, C: link, D: image_url, E: categories
    });
    
    const rows = response.data.values || [];
    log(`📚 Found ${rows.length} rows in Google Sheets`);
    
    if (rows.length <= 1) {
      log("📋 No data or only headers found in Google Sheets");
      return [];
    }
    
    // Skip header row and convert to news objects
    const newsData = rows.slice(1).map(row => ({
      title: row[0] || '',
      date: row[1] || '',
      link: row[2] || '',
      image_url: row[3] || '',
      categories: row[4] ? row[4].split(',').map(cat => cat.trim()) : []
    }));
    
    log(`✅ Loaded ${newsData.length} news items from Google Sheets`);
    return newsData;
  } catch (error) {
    log(`❌ Error loading existing news from Google Sheets: ${error.message}`, "ERROR");
    return [];
  }
};

// Load existing news from local JSON file (backup)
const loadExistingNewsFromFile = () => {
  try {
    const filePath = path.join(CONFIG.DATA_DIR, CONFIG.NEWS_FILE);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const news = JSON.parse(data);
      log(`📚 Loaded ${news.length} news items from local file`);
      return news;
    }
  } catch (error) {
    log(`❌ Error loading existing news from file: ${error.message}`, "ERROR");
  }
  return [];
};

// Save news to local JSON file (backup)
const saveNewsToFile = (news) => {
  try {
    ensureDataDir();
    const filePath = path.join(CONFIG.DATA_DIR, CONFIG.NEWS_FILE);
    fs.writeFileSync(filePath, JSON.stringify(news, null, 2));
    log(`💾 Saved ${news.length} news items to local file`);
  } catch (error) {
    log(`❌ Error saving news to file: ${error.message}`, "ERROR");
  }
};

// Fetch news from a specific page
const fetchNewsFromPage = async (pageUrl) => {
  try {
    log(`📖 Fetching page: ${pageUrl}`);
    const { data } = await axios.get(pageUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const pageNews = [];

    $("article").each((_, el) => {
      const title = $(el).find("h2.blog-entry-title a").text().trim();
      const link = $(el).find("h2.blog-entry-title a").attr("href");
      const date = $(el).find("time.entry-date").text().trim();
      const image_url = $(el).find(".nv-post-thumbnail-wrap img").attr("src");
      const categories = [];

      $(el)
        .find(".meta.category a")
        .each((_, c) => categories.push($(c).text().trim()));

      if (title && link) {
        // Ensure link is absolute
        const absoluteLink = link.startsWith('http') ? link : `https://www.fs-umi.ac.ma${link}`;
        pageNews.push({ 
          title, 
          date, 
          link: absoluteLink, 
          image_url, 
          categories 
        });
      }
    });

    log(`✅ Found ${pageNews.length} news items on page`);
    return pageNews;
  } catch (error) {
    log(`❌ Error fetching page ${pageUrl}: ${error.message}`, "ERROR");
    return [];
  }
};

// Update Google Sheets with new news
const updateGoogleSheets = async (allNews) => {
  try {
    log("📊 Updating Google Sheets...");
    
    const auth = await googleAuth();
    const actualSheetName = await getSheetName(auth);
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Clear existing data (except header)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      range: `${actualSheetName}!A2:Z1000`, // Clear data rows, keep header
    });
    
    // Prepare data for insertion
    const values = allNews.map(news => [
      news.title,
      news.date,
      news.link,
      news.image_url || '',
      news.categories.join(', ')
    ]);
    
    // Insert new data
    await sheets.spreadsheets.values.append({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      range: `${actualSheetName}!A:E`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: values,
      },
    });
    
    log(`✅ Updated Google Sheets with ${values.length} news items`);
    return true;
  } catch (error) {
    log(`❌ Error updating Google Sheets: ${error.message}`, "ERROR");
    return false;
  }
};

// Main scraping function
const scrapeNews = async () => {
  try {
    log("🔄 Starting news scraping process...");
    
    // Load existing news from Google Sheets
    let existingNews = await loadExistingNewsFromSheets();
    
    // If Google Sheets fails, try local file
    if (existingNews.length === 0) {
      log("📁 Falling back to local file...");
      existingNews = loadExistingNewsFromFile();
    }
    
    log(`📚 Loaded ${existingNews.length} existing news items`);
    
    // Fetch news from all pages
    const allNews = [];
    for (let page = 1; page <= CONFIG.PAGES_TO_FETCH; page++) {
      const pageUrl = page === 1 
        ? CONFIG.BASE_URL
        : `${CONFIG.BASE_URL}page/${page}/`;
      
      const pageNews = await fetchNewsFromPage(pageUrl);
      allNews.push(...pageNews);
      
      // Add delay between requests
      if (page < CONFIG.PAGES_TO_FETCH) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.REQUEST_DELAY));
      }
    }
    
    log(`✅ Fetched ${allNews.length} news items from ${CONFIG.PAGES_TO_FETCH} pages`);
    
    // Merge with existing news, avoiding duplicates
    const existingTitles = new Set(existingNews.map(item => item.title));
    const newNews = allNews.filter(item => !existingTitles.has(item.title));
    
    log(`🆕 Found ${newNews.length} new news items`);
    
    // Combine new news at the top with existing news
    const updatedNews = [...newNews, ...existingNews];
    
    // Update Google Sheets
    const sheetsUpdated = await updateGoogleSheets(updatedNews);
    
    // Save to local file as backup
    saveNewsToFile(updatedNews);
    
    if (sheetsUpdated) {
      log(`🎉 Successfully updated ${updatedNews.length} news items (${newNews.length} new)`);
    } else {
      log(`⚠️ Updated local file only. Google Sheets update failed.`);
    }
    
    return {
      success: true,
      total: updatedNews.length,
      new: newNews.length,
      sheetsUpdated
    };
    
  } catch (error) {
    log(`❌ Error in scraping process: ${error.message}`, "ERROR");
    return {
      success: false,
      error: error.message
    };
  }
};

// Run scraper once
const runOnce = async () => {
  log("🚀 Running news scraper once...");
  const result = await scrapeNews();
  
  if (result.success) {
    log(`✅ Scraping completed successfully! Total: ${result.total}, New: ${result.new}`);
    process.exit(0);
  } else {
    log(`❌ Scraping failed: ${result.error}`, "ERROR");
    process.exit(1);
  }
};

// Run scraper on schedule
const runScheduled = () => {
  log(`⏰ Starting scheduled scraper (every ${CONFIG.INTERVAL_MINUTES} minutes)...`);
  
  // Run immediately
  scrapeNews();
  
  // Then run on schedule
  setInterval(async () => {
    log("⏰ Scheduled run starting...");
    await scrapeNews();
  }, CONFIG.INTERVAL_MINUTES * 60 * 1000);
};

// Main execution
const main = () => {
  // Check required environment variables
  const requiredEnvVars = ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SPREADSHEET_6ID'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Missing required environment variables: ${missingVars.join(', ')}`, "ERROR");
    log("Please set the following environment variables:");
    missingVars.forEach(varName => {
      log(`  - ${varName}`);
    });
    process.exit(1);
  }
  
  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--once') || args.includes('-o')) {
    runOnce();
  } else if (args.includes('--schedule') || args.includes('-s')) {
    runScheduled();
  } else {
    // Default: run once
    log("💡 Use --schedule or -s for continuous running, --once or -o for single run");
    runOnce();
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  log("🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on('SIGTERM', () => {
  log("🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

// Start the application
main();
