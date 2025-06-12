import { logger } from './logger.js';

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @param {string} platform - Platform name for logging
 * @returns {Promise} - Promise that resolves when function succeeds
 */
export async function retryWithBackoff(fn, maxRetries = 3, delay = 1000, platform = 'unknown') {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        logger.info(`Operation succeeded on attempt ${attempt}`, { platform });
      }
      return result;
    } catch (error) {
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
  
  throw lastError;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate if platform is supported
 * @param {string} platform - Platform name
 * @param {Array} supportedPlatforms - Array of supported platforms
 * @returns {boolean} - True if platform is supported
 */
export function isValidPlatform(platform, supportedPlatforms) {
  return supportedPlatforms.includes(platform.toLowerCase());
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension with dot
 */
export function getFileExtension(filename) {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Check if file is an image
 * @param {string} filename - Filename
 * @param {Array} imageExtensions - Array of supported image extensions
 * @returns {boolean} - True if file is an image
 */
export function isImageFile(filename, imageExtensions) {
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
}

/**
 * Check if file is a video
 * @param {string} filename - Filename  
 * @param {Array} videoExtensions - Array of supported video extensions
 * @returns {boolean} - True if file is a video
 */
export function isVideoFile(filename, videoExtensions) {
  const ext = getFileExtension(filename);
  return videoExtensions.includes(ext);
}

/**
 * Sanitize text content for posting
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  // Remove excessive whitespace
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate unique ID for posts
 * @returns {string} - Unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
