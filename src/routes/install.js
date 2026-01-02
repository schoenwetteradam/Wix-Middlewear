import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const router = express.Router();

// In-memory storage for installed instances (in production, use a database)
const installedInstances = new Map();

/**
 * Wix app installation endpoint
 * Called when a user installs the app from Wix
 */
router.get('/', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Installation Error</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #e53e3e; margin-bottom: 1rem; }
              p { color: #4a5568; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Installation Error</h1>
              <p>No installation token provided. Please try installing the app again from your Wix dashboard.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Decode the token (Wix sends a signed JWT)
    let decodedToken;
    try {
      // First, decode without verification to see the structure
      decodedToken = jwt.decode(token);
      logger.info('Decoded installation token:', { decodedToken });

      // If we have a public key, verify the signature
      if (config.wix.publicKey) {
        decodedToken = jwt.verify(token, config.wix.publicKey, {
          algorithms: ['RS256'],
        });
        logger.info('Token signature verified');
      }
    } catch (error) {
      logger.error('Failed to decode installation token:', error);
      // Continue anyway - we'll still try to extract the instance ID
      decodedToken = jwt.decode(token);
    }

    // Extract instance information from the token
    const instanceId = decodedToken?.instanceId || decodedToken?.instance || decodedToken?.sub;

    if (!instanceId) {
      logger.error('No instance ID found in token:', { decodedToken });
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Installation Error</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #e53e3e; margin-bottom: 1rem; }
              p { color: #4a5568; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Invalid Token</h1>
              <p>The installation token is invalid. Please contact support or try installing the app again.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Store the instance information
    installedInstances.set(instanceId, {
      instanceId,
      installedAt: new Date(),
      tokenData: decodedToken,
    });

    logger.info('App installed successfully', {
      instanceId,
      totalInstances: installedInstances.size,
    });

    // Return success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Installation Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #48bb78;
              margin-bottom: 1rem;
              font-size: 2rem;
            }
            p {
              color: #4a5568;
              line-height: 1.6;
              margin-bottom: 1.5rem;
            }
            .checkmark {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .instance-id {
              background: #f7fafc;
              padding: 1rem;
              border-radius: 0.5rem;
              font-family: monospace;
              color: #2d3748;
              word-break: break-all;
              margin-top: 1.5rem;
            }
            .next-steps {
              margin-top: 2rem;
              padding-top: 2rem;
              border-top: 1px solid #e2e8f0;
              text-align: left;
            }
            .next-steps h2 {
              color: #2d3748;
              font-size: 1.2rem;
              margin-bottom: 1rem;
            }
            .next-steps ul {
              color: #4a5568;
              line-height: 1.8;
            }
            .next-steps li {
              margin-bottom: 0.5rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✅</div>
            <h1>Installation Successful!</h1>
            <p>Your Salon Events app has been successfully installed on your Wix site.</p>
            <p>The app is now connected and ready to manage your salon's events, appointments, and staff schedule.</p>

            <div class="instance-id">
              <strong>Instance ID:</strong><br/>
              ${instanceId}
            </div>

            <div class="next-steps">
              <h2>Next Steps:</h2>
              <ul>
                <li>Configure your app settings in the Wix dashboard</li>
                <li>Set up your staff schedules and availability</li>
                <li>Create your first event or appointment</li>
                <li>Customize notifications and reminders</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('Installation error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Installation Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 3rem;
              border-radius: 1rem;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            h1 { color: #e53e3e; margin-bottom: 1rem; }
            p { color: #4a5568; line-height: 1.6; }
            .error-details {
              background: #fff5f5;
              border: 1px solid #feb2b2;
              padding: 1rem;
              border-radius: 0.5rem;
              margin-top: 1rem;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Installation Failed</h1>
            <p>An error occurred during installation. Please try again or contact support.</p>
            <div class="error-details">
              <strong>Error:</strong> ${error.message}
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

/**
 * Get list of installed instances (for debugging/admin purposes)
 */
router.get('/instances', (req, res) => {
  const instances = Array.from(installedInstances.values()).map(instance => ({
    instanceId: instance.instanceId,
    installedAt: instance.installedAt,
  }));

  res.json({
    totalInstances: instances.length,
    instances,
  });
});

export default router;
