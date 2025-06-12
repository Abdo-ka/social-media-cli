import { logger } from './logger.js';

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3, 
  delay: number = 1000, 
  platform: string = 'unknown'
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        logger.info(`Operation succeeded on attempt ${attempt}`, { platform });
      }
      return result;
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        logger.error(`Operation failed after ${maxRetries} attempts`, { 
          platform, 
          error: error.message 
        });
        break;
      }
      
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${backoffDelay}ms`, { 
        platform, 
        error: error.message 
      });
      
      await sleep(backoffDelay);
    }
  }
  
  throw lastError!;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate if platform is supported
 */
export function isValidPlatform(platform: string, supportedPlatforms: readonly string[]): boolean {
  return supportedPlatforms.includes(platform.toLowerCase());
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string, imageExtensions: readonly string[]): boolean {
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
}

/**
 * Check if file is a video
 */
export function isVideoFile(filename: string, videoExtensions: readonly string[]): boolean {
  const ext = getFileExtension(filename);
  return videoExtensions.includes(ext);
}

/**
 * Sanitize text content for posting
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove excessive whitespace
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate unique ID for posts
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}