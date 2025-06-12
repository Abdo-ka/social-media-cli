import { promises as fs } from 'fs';
import { config, APP_CONFIG } from '../config/config.js';
import { logger } from './logger.js';
import { formatFileSize, getFileExtension, isImageFile, isVideoFile } from './helpers.js';
import type { MediaFile, SupportedPlatform } from '../types/index.js';

interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  formattedSize: string;
  isImage: boolean;
  isVideo: boolean;
  isDocument: boolean;
  modified: Date;
  mimetype: string;
}

interface ValidationResult {
  valid: FileInfo[];
  invalid: string[];
  errors: string[];
}

/**
 * Validate file existence and accessibility
 */
export async function validateFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file information
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  try {
    const stats = await fs.stat(filePath);
    const filename = filePath.split('/').pop() || '';
    const extension = getFileExtension(filename);
    
    return {
      path: filePath,
      name: filename,
      extension,
      size: stats.size,
      formattedSize: formatFileSize(stats.size),
      isImage: isImageFile(filename, APP_CONFIG.mediaTypes.images),
      isVideo: isVideoFile(filename, APP_CONFIG.mediaTypes.videos),
      isDocument: APP_CONFIG.mediaTypes.documents.includes(extension as any),
      modified: stats.mtime,
      mimetype: getMimeType(filename)
    };
  } catch (error: any) {
    logger.error(`Failed to get file info for ${filePath}`, { error: error.message });
    throw new Error(`Cannot access file: ${filePath}`);
  }
}

/**
 * Validate file size against platform limits
 */
export function validateFileSize(fileInfo: FileInfo, platform: SupportedPlatform): boolean {
  const limits = APP_CONFIG.fileLimits[platform] as any;
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
 */
export async function validateFiles(filePaths: string[], platform: SupportedPlatform): Promise<ValidationResult> {
  const results: ValidationResult = {
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
        const limits = APP_CONFIG.fileLimits[platform] as any;
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
      
    } catch (error: any) {
      results.invalid.push(filePath);
      results.errors.push(error.message);
    }
  }
  
  return results;
}

/**
 * Copy file to uploads directory
 */
export async function copyToUploads(sourcePath: string, filename: string): Promise<string> {
  try {
    // Ensure uploads directory exists
    await fs.mkdir(config.storage.uploadsDir, { recursive: true });
    
    const destPath = `${config.storage.uploadsDir}/${filename}`;
    await fs.copyFile(sourcePath, destPath);
    
    logger.debug(`File copied to uploads: ${filename}`);
    return destPath;
  } catch (error: any) {
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
 */
export async function cleanupFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      logger.debug(`Cleaned up temporary file: ${filePath}`);
    } catch (error: any) {
      logger.warn(`Failed to cleanup file: ${filePath}`, { error: error.message });
    }
  }
}

/**
 * Get MIME type for file
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  
  const mimeTypes: Record<string, string> = {
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

/**
 * Convert file paths to MediaFile objects
 */
export async function prepareMediaFiles(filePaths: string[]): Promise<MediaFile[]> {
  const mediaFiles: MediaFile[] = [];
  
  for (const filePath of filePaths) {
    const fileInfo = await getFileInfo(filePath);
    
    mediaFiles.push({
      path: filePath,
      type: fileInfo.isImage ? 'image' : 'video',
      mimetype: fileInfo.mimetype,
      size: fileInfo.size
    });
  }
  
  return mediaFiles;
}
