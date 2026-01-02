import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load public key from environment variable or public.pem file
 */
function loadPublicKey() {
  // First, try environment variable
  if (process.env.WIX_PUBLIC_KEY) {
    return process.env.WIX_PUBLIC_KEY;
  }

  // If not in env, try to read from public.pem file (note: filename has typo "pubic.pem")
  try {
    const publicKeyPath = path.join(__dirname, '../../pubic.pem');
    if (fs.existsSync(publicKeyPath)) {
      const publicKey = fs.readFileSync(publicKeyPath, 'utf8').trim();
      return publicKey;
    }
  } catch (error) {
    console.warn('Could not load public key from pubic.pem file:', error.message);
  }

  return '';
}

export const config = {
  // Wix App Credentials
  wix: {
    appId: process.env.WIX_APP_ID,
    appSecret: process.env.WIX_APP_SECRET,
    publicKey: loadPublicKey(), // Loaded from env variable or pubic.pem file
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: '24h',
  },

  // Notification Settings
  notifications: {
    email: {
      enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
      provider: process.env.EMAIL_PROVIDER || 'sendgrid',
      apiKey: process.env.EMAIL_API_KEY || '',
    },
    sms: {
      enabled: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Wix OAuth endpoint
  wixOAuth: {
    tokenEndpoint: 'https://www.wixapis.com/oauth/access',
    tokenInfoEndpoint: 'https://www.wixapis.com/oauth2/token-info',
  },
};

export default config;
