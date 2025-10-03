const { execSync } = require('child_process');
const express = require('express');
const path = require('path');

// Load environment variables from static-generator/.env (fallback to process.env if dotenv not available)
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (error) {
  console.log('📄 dotenv not available, using system environment variables');
}

/**
 * Webhook server to automatically regenerate static pages
 * when blog posts are created, updated, or published
 */

const app = express();
app.use(express.json());

// Webhook endpoint that your backend can call
app.post('/regenerate-static', (req, res) => {
  try {
    console.log('🔄 Regenerating static pages...');

    // Change to frontend directory and run the static generation
    const frontendDir = path.resolve(__dirname, '..');
    process.chdir(frontendDir);

    // Run the static generation script
    execSync('node static-generator/generate-static-pages-no-dotenv.js', {
      stdio: 'inherit',
      cwd: frontendDir
    });

    console.log('✅ Static pages regenerated successfully!');
    res.json({
      success: true,
      message: 'Static pages regenerated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error regenerating static pages:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'static-generator' });
});

// Port configuration - defaults to 3002 for both dev and production
// Only change if you have port conflicts
const PORT = process.env.WEBHOOK_PORT || 3002;

app.listen(PORT, 'localhost', () => {
  console.log(`🎯 Static page generator webhook listening on port ${PORT}`);
  console.log(`💡 Backend will call: http://localhost:${PORT}/regenerate-static`);
  console.log(`📡 Ready for automatic static page regeneration!`);
});

module.exports = app;