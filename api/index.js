// Vercel serverless function entry point
// This file ensures compatibility with Vercel's serverless architecture
import app from '../src/server.js';

// Export as default handler for Vercel serverless functions
// Vercel's @vercel/node automatically wraps Express apps
export default app;
