/**
 * Script to check server configuration
 * Run with: node check-config.js
 */

require('dotenv').config();

console.log('🔍 Checking server configuration...\n');

// Check API Key
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error('❌ API_KEY is not set in .env file');
} else {
  const trimmed = apiKey.trim();
  if (apiKey !== trimmed) {
    console.warn('⚠️  API_KEY has leading/trailing whitespace');
  }
  console.log('✅ API_KEY is set');
  console.log(`   Length: ${trimmed.length} characters`);
  console.log(`   Preview: ${trimmed.substring(0, 8)}...${trimmed.substring(trimmed.length - 4)}`);
}

// Check Port
const port = process.env.PORT || '3001';
console.log(`\n✅ PORT: ${port}`);

// Check CORS
const origins = process.env.ALLOWED_ORIGINS;
if (!origins) {
  console.warn('⚠️  ALLOWED_ORIGINS is not set (will allow all origins)');
} else {
  console.log(`✅ ALLOWED_ORIGINS: ${origins}`);
  const originList = origins.split(',').map(o => o.trim());
  console.log(`   Parsed origins: ${originList.join(', ')}`);
}

// Check Email Config
const yahooEmail = process.env.YAHOO_EMAIL;
const yahooPassword = process.env.YAHOO_APP_PASSWORD;

if (!yahooEmail) {
  console.error('\n❌ YAHOO_EMAIL is not set');
} else {
  console.log(`\n✅ YAHOO_EMAIL: ${yahooEmail}`);
}

if (!yahooPassword) {
  console.error('❌ YAHOO_APP_PASSWORD is not set');
} else {
  console.log('✅ YAHOO_APP_PASSWORD is set');
  console.log(`   Length: ${yahooPassword.length} characters`);
}

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`\n✅ NODE_ENV: ${nodeEnv}`);

console.log('\n📋 Summary:');
console.log('   Make sure API_KEY in server/.env matches API_KEY in your Next.js .env.local');
console.log('   After updating .env files, restart the server with: npm run dev\n');

