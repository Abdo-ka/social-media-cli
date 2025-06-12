import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { config } from '../config/config.js';
import { createPlatformLogger, logApiRequest, logApiResponse, logApiError } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/helpers.js';
import { getMimeType } from '../utils/fileHandler.js';

const logger = createPlatformLogger('facebook');

/**
 * Facebook Platform Handler
 */
export class FacebookPlatform {
  constructor() {
    this.name = 'facebook';
    this.config = config.facebook;
    this.baseUrl = `${this.config.baseUrl}/${this.config.apiVersion}`;
  }

  /**
   * Test connection to Facebook API
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      logApiRequest('facebook', 'GET', `${this.baseUrl}/me`);
      
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          access_token: this.config.accessToken,
          fields: 'id,name'
        }
      });
      
      const responseTime = Date.now() - startTime;
      logApiResponse('facebook', response.status, responseTime);
      
      logger.info('Connection test successful', { user: response.data.name });
      return { success: true, user: response.data };
    } catch (error) {
      logApiError('facebook', error, `${this.baseUrl}/me`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Post text content to Facebook
   */
  async postText(content) {
    const postData = {
      message: content,
      access_token: this.config.accessToken
    };

    return await retryWithBackoff(async () => {
      const startTime = Date.now();
      const url = `${this.baseUrl}/${this.config.pageId}/feed`;
      
      logApiRequest('facebook', 'POST', url, postData);
      
      const response = await axios.post(url, postData);
      
      const responseTime = Date.now() - startTime;
      logApiResponse('facebook', response.status, responseTime);
      
      logger.info('Text post successful', { postId: response.data.id });
      return response.data;
    }, config.app.maxRetries, config.app.retryDelay, 'facebook');
  }

  /**
   * Post single image to Facebook
   */
  async postImage(content, imagePath) {
    const formData = new FormData();
    formData.append('message', content);
    formData.append('source', fs.createReadStream(imagePath));
    formData.append('access_token', this.config.accessToken);

    return await retryWithBackoff(async () => {
      const startTime = Date.now();
      const url = `${this.baseUrl}/${this.config.pageId}/photos`;
      
      logApiRequest('facebook', 'POST', url);
      
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      const responseTime = Date.now() - startTime;
      logApiResponse('facebook', response.status, responseTime);
      
      logger.info('Image post successful', { postId: response.data.id });
      return response.data;
    }, config.app.maxRetries, config.app.retryDelay, 'facebook');
  }

  /**
   * Post multiple images to Facebook
   */
  async postMultipleImages(content, imagePaths) {
    try {
      // First, upload images to get their IDs
      const imageIds = [];
      
      for (const imagePath of imagePaths) {
        const formData = new FormData();
        formData.append('source', fs.createReadStream(imagePath));
        formData.append('published', 'false'); // Don't publish immediately
        formData.append('access_token', this.config.accessToken);
        
        const uploadResponse = await retryWithBackoff(async () => {
          const url = `${this.baseUrl}/${this.config.pageId}/photos`;
          logApiRequest('facebook', 'POST', url);
          
          const response = await axios.post(url, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          });
          
          return response.data;
        }, config.app.maxRetries, config.app.retryDelay, 'facebook');
        
        imageIds.push(uploadResponse.id);
      }
      
      // Create post with multiple images
      const attachedMedia = imageIds.map(id => ({ media_fbid: id }));
      
      const postData = {
        message: content,
        attached_media: JSON.stringify(attachedMedia),
        access_token: this.config.accessToken
      };
      
      return await retryWithBackoff(async () => {
        const url = `${this.baseUrl}/${this.config.pageId}/feed`;
        logApiRequest('facebook', 'POST', url);
        
        const response = await axios.post(url, postData);
        
        logger.info('Multiple images post successful', { 
          postId: response.data.id, 
          imageCount: imagePaths.length 
        });
        return response.data;
      }, config.app.maxRetries, config.app.retryDelay, 'facebook');
      
    } catch (error) {
      logger.error('Failed to post multiple images', { error: error.message });
      throw error;
    }
  }

  /**
   * Post video to Facebook
   */
  async postVideo(content, videoPath) {
    const formData = new FormData();
    formData.append('description', content);
    formData.append('source', fs.createReadStream(videoPath));
    formData.append('access_token', this.config.accessToken);

    return await retryWithBackoff(async () => {
      const startTime = Date.now();
      const url = `${this.baseUrl}/${this.config.pageId}/videos`;
      
      logApiRequest('facebook', 'POST', url);
      
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000 // 5 minutes for video uploads
      });
      
      const responseTime = Date.now() - startTime;
      logApiResponse('facebook', response.status, responseTime);
      
      logger.info('Video post successful', { videoId: response.data.id });
      return response.data;
    }, config.app.maxRetries, config.app.retryDelay, 'facebook');
  }

  /**
   * Main post method that handles different content types
   */
  async post(postData) {
    const { content, media = [] } = postData;
    
    try {
      if (media.length === 0) {
        // Text only post
        return await this.postText(content);
      } else if (media.length === 1) {
        const mediaFile = media[0];
        if (mediaFile.isImage) {
          return await this.postImage(content, mediaFile.path);
        } else if (mediaFile.isVideo) {
          return await this.postVideo(content, mediaFile.path);
        }
      } else {
        // Multiple media files
        const images = media.filter(m => m.isImage);
        const videos = media.filter(m => m.isVideo);
        
        if (images.length > 0 && videos.length === 0) {
          // Multiple images
          return await this.postMultipleImages(content, images.map(img => img.path));
        } else {
          // Mixed content - post separately
          logger.warn('Mixed media content detected, posting images first');
          if (images.length > 0) {
            await this.postMultipleImages(content, images.map(img => img.path));
          }
          // Note: Facebook doesn't support multiple videos in one post
          for (const video of videos) {
            await this.postVideo(content, video.path);
          }
        }
      }
    } catch (error) {
      logger.error('Post failed', { error: error.message });
      throw error;
    }
  }
}

export default new FacebookPlatform();
