import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Wix App Credentials
  wix: {
    appId: process.env.WIX_APP_ID,
    appSecret: process.env.WIX_APP_SECRET,
    publicKey: process.env.WIX_PUBLIC_KEY || '', // Retrieved from Wix dashboard
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
