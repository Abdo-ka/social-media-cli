import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '../config/config.js';
import type { Logger } from '../types/index.js';

// Create logs directory if it doesn't exist
if (!fs.existsSync(config.storage.logsDir)) {
  fs.mkdirSync(config.storage.logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, platform, ...meta }) => {
    const platformInfo = platform ? `[${String(platform).toUpperCase()}] ` : '';
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
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(config.storage.logsDir, 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(config.storage.logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3
    })
  ]
});

// Platform-specific logger
export function createPlatformLogger(platform: string): Logger {
  return {
    info: (message: string, meta: any = {}) => logger.info(message, { platform, ...meta }),
    warn: (message: string, meta: any = {}) => logger.warn(message, { platform, ...meta }),
    error: (message: string, meta: any = {}) => logger.error(message, { platform, ...meta }),
    debug: (message: string, meta: any = {}) => logger.debug(message, { platform, ...meta })
  };
}

// Request logger for API calls
export function logApiRequest(platform: string, method: string, url: string, data?: any): void {
  logger.debug('API Request', {
    platform,
    method,
    url,
    data: data ? 'present' : 'none'
  });
}

export function logApiResponse(platform: string, status: number, responseTime: number): void {
  logger.debug('API Response', {
    platform,
    status,
    responseTime: `${responseTime}ms`
  });
}

export function logApiError(platform: string, error: any, url: string): void {
  logger.error('API Error', {
    platform,
    url,
    error: error.message,
    code: error.code,
    status: error.response?.status
  });
}
