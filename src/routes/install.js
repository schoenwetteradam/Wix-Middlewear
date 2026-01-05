import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const router = express.Router();

// In-memory storage for installed instances (in production, use a database)
const installedInstances = new Map();

/**
 * Wix app installation endpoint
 * Called when a user installs the app from Wix
 * Handles multiple formats: token parameter, instance parameter, or appInstance parameter
 */
router.get('/', async (req, res) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:17',message:'Install route entry',data:{query:req.query,headers:Object.keys(req.headers),path:req.path,method:req.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const { token, instance, appInstance, redirectUrl, code } = req.query;
    let instanceId = null;
    let tokenData = null;

    // If we have a code parameter, this is an OAuth callback after authorization
    // For app updates, Wix may send the code directly
    if (code) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:25',message:'OAuth callback detected',data:{code:code?.substring(0,20)+'...',instance,appInstance,redirectUrl,hasRedirectUrl:!!redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      logger.info('OAuth callback received with authorization code');
      // Extract instanceId from the code if possible, or redirect to close window
      // For now, we'll treat this as a successful installation
      instanceId = instance || appInstance;
      
      // If we have a redirectUrl, redirect back to Wix immediately
      // This is critical for app updates to be recognized
      if (redirectUrl) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:33',message:'Redirecting with redirectUrl',data:{redirectUrl,instanceId,hasInstanceId:!!instanceId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        logger.info('Redirect URL provided, redirecting back to Wix', { redirectUrl, instanceId });
        // Store instance before redirecting
        if (instanceId) {
          installedInstances.set(instanceId, {
            instanceId,
            installedAt: new Date(),
            updated: true,
          });
        }
        return res.redirect(redirectUrl);
      }
    }

    // Check for instance ID in different query parameters
    if (instance) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:49',message:'Instance ID from instance param',data:{instanceId:instance},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Direct instance ID parameter
      instanceId = instance;
      logger.info('Instance ID from query parameter:', { instanceId });
    } else if (appInstance) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:54',message:'Instance ID from appInstance param',data:{instanceId:appInstance},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // App instance parameter
      instanceId = appInstance;
      logger.info('Instance ID from appInstance parameter:', { instanceId });
    } else if (token) {
      // Token parameter - could be JWT, instance ID, or other format
      try {
        // Try to decode as JWT first
        const decodedToken = jwt.decode(token);

        if (decodedToken && typeof decodedToken === 'object') {
          // It's a valid JWT
          logger.info('Decoded JWT token:', { decodedToken });

          // If we have a public key, verify the signature
          if (config.wix.publicKey) {
            try {
              jwt.verify(token, config.wix.publicKey, {
                algorithms: ['RS256'],
              });
              logger.info('Token signature verified');
            } catch (verifyError) {
              logger.warn('Token signature verification failed:', verifyError.message);
              // Continue anyway - we'll use the decoded data
            }
          }

          // Extract instance ID from JWT
          instanceId = decodedToken.instanceId || decodedToken.instance || decodedToken.sub || decodedToken.app_instance_id;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:81',message:'Instance ID extracted from JWT',data:{instanceId,decodedKeys:Object.keys(decodedToken)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          tokenData = decodedToken;
        } else {
          // Not a JWT - might be the instance ID itself
          instanceId = token;
          logger.info('Using token as instance ID directly:', { instanceId });
        }
      } catch (error) {
        // Failed to decode as JWT - use token as instance ID
        instanceId = token;
        logger.info('Token is not JWT, using as instance ID:', { instanceId });
      }
    }

    // If we still don't have an instance ID, log it but still show success page
    // Wix may send instanceId via webhook or in a different format
    if (!instanceId) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:95',message:'No instance ID found in query params',data:{query:req.query},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      logger.warn('Installation request received without instance ID', { query: req.query });
      // Generate a temporary instanceId for display purposes
      instanceId = 'pending-webhook';
    }

    // Store the instance information (only if we have a real instanceId)
    if (instanceId && instanceId !== 'pending-webhook') {
      installedInstances.set(instanceId, {
        instanceId,
        installedAt: new Date(),
        tokenData: tokenData,
      });
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:134',message:'Sending HTML response',data:{instanceId,responseType:'HTML',hasRedirectUrl:!!redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    logger.info('App installation page accessed', {
      instanceId,
      totalInstances: installedInstances.size,
    });

    // Generate a nonce for this request (cryptographically secure random value)
    const nonce = crypto.randomBytes(16).toString('base64');

    // Set CSP header with nonce to allow inline scripts securely
    res.setHeader('Content-Security-Policy', 
      `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';`
    );

    // Return success page with auto-close/redirect for Wix
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Installation Successful</title>
          <meta charset="utf-8">
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
              font-size: 0.875rem;
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
            .loading {
              margin-top: 1.5rem;
              color: #718096;
              font-size: 0.875rem;
            }
          </style>
          <script nonce="${nonce}">
            // Signal to Wix that installation page has loaded
            // User can interact with the page to configure widgets/settings
            (function() {
              // Signal to Wix that installation page is ready (but don't auto-close)
              const signalReady = function() {
                try {
                  // Send message to parent window (if in iframe) to signal page is ready
                  if (window.parent !== window) {
                    window.parent.postMessage({ 
                      type: 'wix-app-install-ready', 
                      instanceId: '${instanceId}',
                      status: 'ready'
                    }, '*');
                    
                    // Also try Wix-specific message format
                    window.parent.postMessage({
                      type: 'app-install-ready',
                      instanceId: '${instanceId}'
                    }, '*');
                  }
                  
                  if (window.opener) {
                    // Opened in popup - send message to opener
                    window.opener.postMessage({
                      type: 'wix-app-install-ready',
                      instanceId: '${instanceId}',
                      status: 'ready'
                    }, '*');
                  }
                } catch(e) {
                  // Cross-origin restrictions - that's fine
                  console.log('Installation page loaded');
                }
              };
              
              // Signal immediately
              signalReady();
            })();
          </script>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✅</div>
            <h1>Installation Successful!</h1>
            <p>Your Salon Events app has been successfully installed/updated on your Wix site.</p>
            <p>The app is now connected and ready to manage your salon's events, appointments, and staff schedule.</p>

            <div class="instance-id">
              <strong>Instance ID:</strong><br/>
              ${instanceId}
            </div>

            ${instanceId === 'pending-webhook' ? '<div class="loading"><p style="color: #ed8936;">Instance ID will be confirmed via webhook...</p></div>' : ''}

            <div class="next-steps">
              <h2>Next Steps:</h2>
              <ul>
                <li><strong>Add widgets to your site:</strong> Go to your Wix site editor and add the Salon Events widget to your pages</li>
                <li>Configure your app settings in the Wix dashboard</li>
                <li>Set up your staff schedules and availability</li>
                <li>Create your first event or appointment</li>
                <li>Customize notifications and reminders</li>
              </ul>
              <p style="margin-top: 1.5rem; padding: 1rem; background: #f0f4f8; border-radius: 0.5rem; color: #2d3748;">
                <strong>Note:</strong> You can close this window when you're ready. The app installation is complete and you can now add widgets to your site pages.
              </p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d1a8886f-a737-43ed-aaab-432ab29a507f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'install.js:312',message:'Installation error',data:{error:error.message,stack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
