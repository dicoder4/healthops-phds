// config/config.js
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate and export configuration
const config = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  mongoUri: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'yourSecretKey',
  port: process.env.PORT || 4000
};

// Validation
const requiredFields = ['googleClientId', 'googleClientSecret', 'googleRedirectUri', 'mongoUri'];
const missingFields = requiredFields.filter(field => !config[field]);

if (missingFields.length > 0) {
  console.error('❌ Missing required configuration:', missingFields);
  console.error('Current values:');
  Object.entries(config).forEach(([key, value]) => {
    console.error(`- ${key}:`, value || 'MISSING');
  });
  process.exit(1);
}

console.log('✅ Configuration loaded successfully');
console.log('Google Client ID:', config.googleClientId ? 'PRESENT' : 'MISSING');
console.log('Google Redirect URI:', config.googleRedirectUri);

export default config;