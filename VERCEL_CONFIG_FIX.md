# Vercel Configuration Fix

## Error

```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

This occurred because the `runtime` field in `vercel.json` functions config used an invalid format.

## Fix Applied

Removed the invalid `runtime` specification from `vercel.json`. Vercel automatically detects the Node.js version from `package.json`'s `engines` field.

### Before (Invalid):
```json
{
  "functions": {
    "api/index.js": {
      "runtime": "nodejs18.x"  // ❌ Invalid format
    }
  }
}
```

### After (Correct):
```json
{
  "buildCommand": "npm run build:frontend",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

## How Node.js Version is Determined

Vercel automatically uses the Node.js version specified in `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

This ensures Node.js 18+ is used, which has full ES module support.

## Why This Works

1. **Auto-detection**: Vercel automatically detects serverless functions in the `api/` directory
2. **Node.js version**: Read from `package.json` `engines` field
3. **ES modules**: Supported when `"type": "module"` is in `package.json` and Node 18+ is used
4. **Simpler config**: No need for explicit runtime specification in functions config

## Next Steps

1. Deploy to Vercel
2. Vercel will use Node 18+ (from engines field)
3. ES modules will work correctly
4. Function should load without errors
