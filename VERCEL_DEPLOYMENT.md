# Deploying to Vercel

This guide explains how to deploy your Salon Events Wix App to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. Your Wix App credentials (App ID, App Secret, Site ID)

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Set Environment Variables

You need to configure the following environment variables in Vercel:

**Required Variables:**
- `WIX_APP_ID` - Your Wix App ID
- `WIX_APP_SECRET` - Your Wix App Secret
- `WIX_SITE_ID` - Your Wix Site ID (optional, can be per-instance)
- `JWT_SECRET` - Secret key for JWT tokens (generate a random string)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (your Wix site URLs)

**Optional Variables:**
- `PORT` - Port number (default: 3000, but Vercel will override this)
- `LOG_LEVEL` - Logging level (default: info)

Set these in Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development environments

Or use the Vercel CLI:

```bash
vercel env add WIX_APP_ID
vercel env add WIX_APP_SECRET
vercel env add WIX_SITE_ID
vercel env add JWT_SECRET
vercel env add ALLOWED_ORIGINS
```

### 4. Deploy to Vercel

#### First Deployment:

```bash
vercel
```

Follow the prompts:
- Link to existing project? No
- What's your project's name? `salon-events-wix-app`
- In which directory is your code located? `./`

#### Subsequent Deployments:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 5. Configure Wix App Settings

After deployment, update your Wix App settings with the Vercel URL:

1. Go to Wix Developers: https://dev.wix.com/
2. Open your app
3. Update the following URLs:
   - **App URL**: `https://your-app.vercel.app`
   - **Redirect URL**: `https://your-app.vercel.app/auth/callback`
   - **Webhook URL**: `https://your-app.vercel.app/plugins-and-webhooks`

### 6. Set Up Wix Data Collections

In your Wix site dashboard, create the following Data Collections:

1. **SalonAppointments** - Store appointment data
2. **SalonEvents** - Store event data
3. **SalonEventRegistrations** - Store event registrations
4. **SalonStaff** - Store staff information
5. **SalonNotifications** - Store notification history

See `WIX_DATA_COLLECTIONS.md` for detailed schema.

**Important**: Set collection permissions to allow your app to read/write data.

## Vercel Configuration Files

### vercel.json

The `vercel.json` file configures how Vercel builds and serves your app:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

## Monitoring and Logs

### View Logs

```bash
vercel logs [deployment-url]
```

Or view in the Vercel Dashboard under "Deployments" → Select deployment → "Logs"

### Monitor Performance

- Go to Vercel Dashboard
- Select your project
- View "Analytics" for performance metrics

## Troubleshooting

### Build Failures

If the build fails:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node version compatibility (Vercel uses Node 18 by default)

### Runtime Errors

If you see runtime errors:
1. Check environment variables are set correctly
2. Verify Wix App credentials
3. Check that Data Collections exist in Wix
4. Review function logs in Vercel dashboard

### CORS Issues

If you encounter CORS errors:
1. Verify `ALLOWED_ORIGINS` includes your Wix site URL
2. Check CORS configuration in `src/server.js`

## Scaling and Performance

### Automatic Scaling

Vercel automatically scales your app based on traffic. No configuration needed.

### Edge Caching

For better performance, consider:
- Caching API responses with appropriate headers
- Using Vercel Edge Functions for frequently accessed data

### Database Performance

Since we're using Wix Data Collections:
- Wix handles scaling automatically
- Optimize queries with proper filters
- Use pagination for large datasets

## CI/CD Integration

### GitHub Integration

1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push to main
3. Preview deployments for pull requests

### Custom Domains

To use a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate JWT secrets** regularly
3. **Validate Wix webhooks** - Verify signatures
4. **Use HTTPS** - Vercel provides SSL automatically
5. **Rate limiting** - Consider adding rate limiting middleware

## Cost Optimization

Vercel Free Tier includes:
- 100 GB bandwidth
- Unlimited deployments
- Automatic HTTPS

For production apps, consider Vercel Pro for:
- More bandwidth
- Advanced analytics
- Team collaboration

## Support

- Vercel Documentation: https://vercel.com/docs
- Wix Developers: https://dev.wix.com/docs
- This Project's Issues: [Your GitHub repo]
