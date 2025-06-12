import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Facebook configuration
  facebook: {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    pageId: process.env.FACEBOOK_PAGE_ID,
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com'
  },

  // Instagram configuration
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    accountId: process.env.INSTAGRAM_ACCOUNT_ID,
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com'
  },

  // Telegram configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    baseUrl: 'https://api.telegram.org'
  },

  // LinkedIn configuration
  linkedin: {
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    personId: process.env.LINKEDIN_PERSON_ID,
    baseUrl: 'https://api.linkedin.com/v2'
  },

  // Application configuration
  app: {
    logLevel: process.env.LOG_LEVEL || 'info',
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 1000,
    uploadsDir: path.join(__dirname, '../../uploads'),
    logsDir: path.join(__dirname, '../../logs'),
    schedulerFile: path.join(__dirname, '../../scheduler.json')
  },

  // Supported platforms
  platforms: ['facebook', 'instagram', 'telegram', 'linkedin'],

  // Supported media types
  mediaTypes: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    documents: ['.pdf', '.doc', '.docx', '.txt']
  },

  // File size limits (in bytes)
  fileLimits: {
    facebook: {
      image: 4 * 1024 * 1024, // 4MB
      video: 1024 * 1024 * 1024 // 1GB
    },
    instagram: {
      image: 8 * 1024 * 1024, // 8MB
      video: 100 * 1024 * 1024 // 100MB
    },
    telegram: {
      photo: 10 * 1024 * 1024, // 10MB
      video: 50 * 1024 * 1024, // 50MB
      document: 50 * 1024 * 1024 // 50MB
    },
    linkedin: {
      image: 20 * 1024 * 1024, // 20MB
      video: 200 * 1024 * 1024 // 200MB
    }
  }
};

// Validate required environment variables
export function validateConfig() {
  const requiredVars = {
    facebook: ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
    instagram: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID'],
    telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    linkedin: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_ID']
  };

  const missing = {};
  
  for (const [platform, vars] of Object.entries(requiredVars)) {
    missing[platform] = vars.filter(varName => !process.env[varName]);
  }

  return missing;
}
