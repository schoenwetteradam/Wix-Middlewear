# Setting Up Your Wix App Credentials

This guide will help you configure your Wix app credentials in your project.

## ✅ Your Current Credentials

You've provided:
- **App ID:** `a88e57a2-8663-43a0-954a-1d669869b8bb`
- **App Secret:** `641a5b63-f3b1-40c6-8b45-d7e14d54f8f0`
- **Public Key:** (Not provided - see instructions below)

---

## 📝 Step 1: Create .env File

1. Copy the `.env.example` file to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Or create a new `.env` file in the project root with the following content:

```bash
# Wix App Credentials
WIX_APP_ID=a88e57a2-8663-43a0-954a-1d669869b8bb
WIX_APP_SECRET=641a5b63-f3b1-40c6-8b45-d7e14d54f8f0

# Wix Public Key (see Step 2)
WIX_PUBLIC_KEY=""

# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=change-this-secret-in-production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://*.wix.com,https://*.wixsite.com
```

---

## 🔑 Step 2: Get Your Public Key

The public key is **required** for JWT token verification. Here's how to get it:

### Option A: From Wix App Dashboard (Recommended)

1. Go to [Wix App Dashboard](https://dev.wix.com/)
2. Log in and select your app
3. Navigate to **Build** → **Webhooks**
4. Scroll down to **Public Key** section
5. Click **Generate Public Key** (if not already generated)
6. Click **Copy** to copy the entire public key

The public key will look like this:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
[long string of characters]
...
-----END PUBLIC KEY-----
```

### Option B: From OAuth Settings

1. Go to **Build** → **OAuth**
2. Scroll down to find the **Public Key** section
3. Copy the entire key

---

## 📄 Step 3: Add Public Key to Your Project

You have **two options** for storing the public key:

### Option 1: Environment Variable (Recommended for Production)

Add the public key to your `.env` file:

```bash
WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
[your full public key here]
...
-----END PUBLIC KEY-----"
```

**Important:** 
- Keep the quotes around the entire key
- Include the `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----` lines
- For multi-line values, you may need to use a different format depending on your deployment platform

### Option 2: Save to File (Alternative)

1. Create a file named `pubic.pem` in your project root (note: the filename has a typo "pubic" not "public" - this matches the code)
2. Paste the entire public key into this file
3. Save the file

The file should look like:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
[your full public key here]
...
-----END PUBLIC KEY-----
```

**Note:** The code will automatically look for this file if `WIX_PUBLIC_KEY` environment variable is not set.

---

## ✅ Step 4: Verify Your Configuration

After setting up your credentials, verify they're loaded correctly:

### Test Locally:

1. Start your server:
   ```bash
   npm start
   ```

2. Check the server logs - you should see:
   - No warnings about missing `WIX_APP_ID`
   - No warnings about missing `WIX_APP_SECRET`
   - No errors about missing `WIX_PUBLIC_KEY`

3. Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

### Check Configuration:

You can create a simple test script to verify your credentials are loaded:

```javascript
// test-config.js
import config from './src/config/config.js';

console.log('App ID:', config.wix.appId ? '✅ Set' : '❌ Missing');
console.log('App Secret:', config.wix.appSecret ? '✅ Set' : '❌ Missing');
console.log('Public Key:', config.wix.publicKey ? '✅ Set (' + config.wix.publicKey.length + ' chars)' : '❌ Missing');
```

Run it with:
```bash
node test-config.js
```

---

## 🚀 Step 5: Set Up for Production (Vercel/Deployment)

When deploying to Vercel or another platform, set these as **Environment Variables**:

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable:

| Variable | Value |
|----------|-------|
| `WIX_APP_ID` | `a88e57a2-8663-43a0-954a-1d669869b8bb` |
| `WIX_APP_SECRET` | `641a5b63-f3b1-40c6-8b45-d7e14d54f8f0` |
| `WIX_PUBLIC_KEY` | `[Your full public key]` |
| `BASE_URL` | `https://your-app.vercel.app` |
| `JWT_SECRET` | `[Generate a random secret]` |
| `NODE_ENV` | `production` |

**Important for Public Key in Vercel:**
- When adding `WIX_PUBLIC_KEY` in Vercel, you may need to:
  - Remove the line breaks and put it all on one line, OR
  - Use Vercel's multi-line environment variable support
  - Some platforms require escaping newlines with `\n`

Example for single-line format:
```
WIX_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"
```

---

## 🔒 Security Notes

1. **Never commit `.env` file to Git**
   - The `.env` file should be in `.gitignore`
   - Only commit `.env.example` (without real credentials)

2. **Keep credentials secret**
   - Don't share your App Secret publicly
   - Don't commit credentials to version control
   - Use environment variables in production

3. **Rotate credentials if compromised**
   - If you suspect your credentials are exposed, regenerate them in Wix App Dashboard
   - Update all your deployments immediately

---

## ❓ Troubleshooting

### Issue: "WIX_PUBLIC_KEY not configured"

**Solution:**
- Verify the public key is in your `.env` file or `pubic.pem` file
- Check that the key includes the BEGIN/END markers
- Ensure there are no extra spaces or line breaks

### Issue: "Invalid authorization token"

**Solution:**
- Verify the public key matches the one in your Wix App Dashboard
- Check that the key is correctly formatted
- Ensure the key hasn't been regenerated (if regenerated, update your config)

### Issue: Public key not loading from file

**Solution:**
- Check the file is named `pubic.pem` (not `public.pem`)
- Verify the file is in the project root directory
- Check file permissions

---

## ✅ Checklist

- [ ] Created `.env` file with App ID and Secret
- [ ] Retrieved Public Key from Wix App Dashboard
- [ ] Added Public Key to `.env` or `pubic.pem` file
- [ ] Verified configuration loads correctly
- [ ] Set environment variables in production (Vercel/etc.)
- [ ] Tested locally
- [ ] Verified `.env` is in `.gitignore`

---

## 📚 Next Steps

After setting up your credentials:

1. **Test the installation endpoint:**
   - Visit: `http://localhost:3000/?token=test` (or your installation URL)

2. **Create Dashboard Extensions:**
   - See `POST_INSTALLATION_SETUP.md` for details

3. **Deploy to production:**
   - See `VERCEL_DEPLOYMENT.md` for deployment instructions

---

## 🆘 Need Help?

If you're having trouble:
1. Check server logs for specific error messages
2. Verify all credentials are set correctly
3. Ensure the public key format is correct
4. Review the troubleshooting section above

For more information, see:
- `WIX_APP_SETUP_GUIDE.md` - Complete Wix app setup
- `ERROR_FIXES_SUMMARY.md` - Recent fixes and improvements
- `POST_INSTALLATION_SETUP.md` - Post-installation steps
