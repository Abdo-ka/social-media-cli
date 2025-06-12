import winston from 'winston';
import path from 'path';
import { config } from '../config/config.js';

// Create logs directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(config.app.logsDir)) {
  fs.mkdirSync(config.app.logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, platform, ...meta }) => {
    const platformInfo = platform ? `[${platform.toUpperCase()}] ` : '';
    const metaInfo = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${platformInfo}${message}${metaInfo}`;
  })
);

// File format
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create logger
export const logger = winston.createLogger({
  level: config.app.logLevel,
  format: fileFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(config.app.logsDir, 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(config.app.logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3
    })
  ]
});

// Platform-specific logger
export function createPlatformLogger(platform) {
  return {
    info: (message, meta = {}) => logger.info(message, { platform, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { platform, ...meta }),
    error: (message, meta = {}) => logger.error(message, { platform, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { platform, ...meta })
  };
}

// Request logger for API calls
export function logApiRequest(platform, method, url, data = null) {
  logger.debug('API Request', {
    platform,
    method,
    url,
    data: data ? 'present' : 'none'
  });
}

export function logApiResponse(platform, status, responseTime) {
  logger.debug('API Response', {
    platform,
    status,
    responseTime: `${responseTime}ms`
  });
}

export function logApiError(platform, error, url) {
  logger.error('API Error', {
    platform,
    url,
    error: error.message,
    code: error.code,
    status: error.response?.status
  });
}
