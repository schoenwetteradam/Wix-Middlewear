import winston from 'winston';
import config from '../config/config.js';

// Create base transports array with console logging
const transports = [
  // Write all logs to console
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        ({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        }
      )
    ),
  }),
];

// Only add file transports when NOT running in serverless environment
// Vercel and other serverless platforms have read-only filesystems
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  transports.push(
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'salon-events-wix-app' },
  transports,
});

export default logger;
