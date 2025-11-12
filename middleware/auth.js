/**
 * API Key Authentication Middleware
 * Validates that requests include a valid API key in the Authorization header
 */

const validateApiKey = (req, res, next) => {
  const apiKey = (req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', ''))?.trim();

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required. Please provide it in the X-API-Key header or Authorization header.'
    });
  }

  const validApiKey = process.env.API_KEY?.trim();

  if (!validApiKey) {
    console.error('⚠️ WARNING: API_KEY environment variable is not set!');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    });
  }

  if (apiKey !== validApiKey) {
    // Log the mismatch for debugging (only show first/last few chars for security)
    const maskedReceived = apiKey.length > 8 
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : '****';
    const maskedExpected = validApiKey.length > 8
      ? `${validApiKey.substring(0, 4)}...${validApiKey.substring(validApiKey.length - 4)}`
      : '****';
    
    console.error(`❌ API key mismatch!`);
    console.error(`   Received: ${maskedReceived} (length: ${apiKey.length})`);
    console.error(`   Expected: ${maskedExpected} (length: ${validApiKey.length})`);
    
    return res.status(403).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

module.exports = validateApiKey;
