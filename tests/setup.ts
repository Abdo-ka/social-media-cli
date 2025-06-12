// Jest setup file
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.FACEBOOK_ACCESS_TOKEN = 'mock_facebook_token';
process.env.FACEBOOK_PAGE_ID = 'mock_page_id';
process.env.INSTAGRAM_ACCESS_TOKEN = 'mock_instagram_token';
process.env.INSTAGRAM_ACCOUNT_ID = 'mock_account_id';
process.env.TELEGRAM_BOT_TOKEN = 'mock_telegram_token';
process.env.TELEGRAM_CHAT_ID = 'mock_chat_id';
process.env.LINKEDIN_ACCESS_TOKEN = 'mock_linkedin_token';
process.env.LINKEDIN_PERSON_ID = 'mock_person_id';

// Increase test timeout for async operations
jest.setTimeout(10000);

// Mock Winston logger to avoid file system operations during tests
jest.mock('../src/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));
