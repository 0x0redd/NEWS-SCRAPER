const express = require('express');
const router = express.Router();
const validateApiKey = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');

// Apply authentication to all email routes
router.use(validateApiKey);

/**
 * POST /api/email/welcome
 * Send welcome email to a new subscriber
 * 
 * Body:
 * {
 *   recipientEmail: string,
 *   recipientName: string,
 *   recipientDateNaissance: string,
 *   recipientFiliere: string,
 *   recipientCodeMassar: string,
 *   recipientUserCode: string
 * }
 */
router.post('/welcome', async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientName,
      recipientDateNaissance,
      recipientFiliere,
      recipientCodeMassar,
      recipientUserCode
    } = req.body;

    // Validate required fields
    if (!recipientEmail || !recipientName || !recipientDateNaissance || 
        !recipientFiliere || !recipientCodeMassar || !recipientUserCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipientEmail, recipientName, recipientDateNaissance, recipientFiliere, recipientCodeMassar, recipientUserCode'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    console.log(`📧 [${new Date().toISOString()}] Sending welcome email to: ${recipientEmail}`);

    const result = await sendWelcomeEmail(
      recipientEmail,
      recipientName,
      recipientDateNaissance,
      recipientFiliere,
      recipientCodeMassar,
      recipientUserCode
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email',
        details: result.details
      });
    }
  } catch (error) {
    console.error('❌ Error in welcome email route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/email/status
 * Check email service status
 */
router.get('/status', (req, res) => {
  const hasConfig = !!(process.env.YAHOO_EMAIL && process.env.YAHOO_APP_PASSWORD);
  
  res.json({
    success: true,
    service: 'email',
    configured: hasConfig,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
