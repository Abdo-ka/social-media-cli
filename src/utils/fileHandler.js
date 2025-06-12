import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config.js';
import { logger } from './logger.js';
import { formatFileSize, getFileExtension, isImageFile, isVideoFile } from './helpers.js';

/**
 * Validate file existence and accessibility
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} - True if file exists and is accessible
 */
export async function validateFile(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file information
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} - File information object
 */
export async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const filename = path.basename(filePath);
    const extension = getFileExtension(filename);
    
    return {
      path: filePath,
      name: filename,
      extension,
      size: stats.size,
      formattedSize: formatFileSize(stats.size),
      isImage: isImageFile(filename, config.mediaTypes.images),
      isVideo: isVideoFile(filename, config.mediaTypes.videos),
      isDocument: config.mediaTypes.documents.includes(extension),
      modified: stats.mtime
    };
  } catch (error) {
    logger.error(`Failed to get file info for ${filePath}`, { error: error.message });
    throw new Error(`Cannot access file: ${filePath}`);
  }
}

/**
 * Validate file size against platform limits
 * @param {Object} fileInfo - File information object
 * @param {string} platform - Platform name
 * @returns {boolean} - True if file size is within limits
 */
export function validateFileSize(fileInfo, platform) {
  const limits = config.fileLimits[platform];
  if (!limits) return true;
  
  if (fileInfo.isImage && limits.image) {
    return fileInfo.size <= limits.image;
  }
  
  if (fileInfo.isVideo && limits.video) {
    return fileInfo.size <= limits.video;
  }
  
  if (fileInfo.isDocument && limits.document) {
    return fileInfo.size <= limits.document;
  }
  
  return true;
}

/**
 * Validate multiple files
 * @param {Array<string>} filePaths - Array of file paths
 * @param {string} platform - Platform name
 * @returns {Promise<Object>} - Validation result
 */
export async function validateFiles(filePaths, platform) {
  const results = {
    valid: [],
    invalid: [],
    errors: []
  };
  
  for (const filePath of filePaths) {
    try {
      // Check if file exists
      const exists = await validateFile(filePath);
      if (!exists) {
        results.invalid.push(filePath);
        results.errors.push(`File not found: ${filePath}`);
        continue;
      }
      
      // Get file info
      const fileInfo = await getFileInfo(filePath);
      
      // Check file size
      if (!validateFileSize(fileInfo, platform)) {
        results.invalid.push(filePath);
        const limit = config.fileLimits[platform];
        const limitType = fileInfo.isImage ? 'image' : fileInfo.isVideo ? 'video' : 'document';
        results.errors.push(
          `File too large: ${fileInfo.name} (${fileInfo.formattedSize}) exceeds ${platform} ${limitType} limit`
        );
        continue;
      }
      
      // Check file type support
      if (!fileInfo.isImage && !fileInfo.isVideo && !fileInfo.isDocument) {
        results.invalid.push(filePath);
        results.errors.push(`Unsupported file type: ${fileInfo.name}`);
        continue;
      }
      
      results.valid.push(fileInfo);
      
    } catch (error) {
      results.invalid.push(filePath);
      results.errors.push(error.message);
    }
  }
  
  return results;
}

/**
 * Copy file to uploads directory
 * @param {string} sourcePath - Source file path
 * @param {string} filename - Destination filename
 * @returns {Promise<string>} - Destination file path
 */
export async function copyToUploads(sourcePath, filename) {
  try {
    // Ensure uploads directory exists
    await fs.mkdir(config.app.uploadsDir, { recursive: true });
    
    const destPath = path.join(config.app.uploadsDir, filename);
    await fs.copyFile(sourcePath, destPath);
    
    logger.debug(`File copied to uploads: ${filename}`);
    return destPath;
  } catch (error) {
    logger.error(`Failed to copy file to uploads`, { 
      source: sourcePath, 
      destination: filename, 
      error: error.message 
    });
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

/**
 * Clean up temporary files
 * @param {Array<string>} filePaths - Array of file paths to clean up
 */
export async function cleanupFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      logger.debug(`Cleaned up temporary file: ${filePath}`);
    } catch (error) {
      logger.warn(`Failed to cleanup file: ${filePath}`, { error: error.message });
    }
  }
}

/**
 * Get MIME type for file
 * @param {string} filename - Filename
 * @returns {string} - MIME type
 */
export function getMimeType(filename) {
  const ext = getFileExtension(filename);
  
  const mimeTypes = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    
    // Videos
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}
