import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Config } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config: Config = {
  platforms: {
    facebook: {
      name: 'facebook',
      enabled: !!process.env.FACEBOOK_ACCESS_TOKEN,
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      pageId: process.env.FACEBOOK_PAGE_ID,
      apiVersion: 'v18.0',
      baseUrl: 'https://graph.facebook.com'
    },
    instagram: {
      name: 'instagram',
      enabled: !!process.env.INSTAGRAM_ACCESS_TOKEN,
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      accountId: process.env.INSTAGRAM_ACCOUNT_ID,
      apiVersion: 'v18.0',
      baseUrl: 'https://graph.facebook.com'
    },
    telegram: {
      name: 'telegram',
      enabled: !!process.env.TELEGRAM_BOT_TOKEN,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
      baseUrl: 'https://api.telegram.org'
    },
    linkedin: {
      name: 'linkedin',
      enabled: !!process.env.LINKEDIN_ACCESS_TOKEN,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      personId: process.env.LINKEDIN_PERSON_ID,
      baseUrl: 'https://api.linkedin.com/v2'
    }
  },
  storage: {
    postsFile: path.join(__dirname, '../../data/posts.json'),
    uploadsDir: path.join(__dirname, '../../uploads'),
    logsDir: path.join(__dirname, '../../logs')
  },
  retry: {
    maxAttempts: parseInt(process.env.MAX_RETRIES || '3'),
    delay: parseInt(process.env.RETRY_DELAY || '1000')
  }
};

// Application constants
export const APP_CONFIG = {
  logLevel: process.env.LOG_LEVEL || 'info',
  supportedPlatforms: ['facebook', 'instagram', 'telegram', 'linkedin'] as const,
  mediaTypes: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    documents: ['.pdf', '.doc', '.docx', '.txt']
  },
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
} as const;

export type SupportedPlatform = typeof APP_CONFIG.supportedPlatforms[number];

// Validate required environment variables
export function validateConfig(): { [platform: string]: string[] } {
  const requiredVars: Record<SupportedPlatform, string[]> = {
    facebook: ['FACEBOOK_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID'],
    instagram: ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_ACCOUNT_ID'],
    telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    linkedin: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_ID']
  };

  const missing: { [platform: string]: string[] } = {};
  
  for (const [platform, vars] of Object.entries(requiredVars)) {
    missing[platform] = vars.filter(varName => !process.env[varName]);
  }

  return missing;
}

// Check if a platform is properly configured
export function isPlatformConfigured(platform: SupportedPlatform): boolean {
  const missing = validateConfig();
  return missing[platform].length === 0;
}
