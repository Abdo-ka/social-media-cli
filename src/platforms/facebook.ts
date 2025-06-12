import axios from 'axios';
import FormData from 'form-data';
import { promises as fs } from 'fs';
import { config } from '../config/config.js';
import { createPlatformLogger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/helpers.js';
import type { Platform, PostContent, PlatformResponse } from '../types/index.js';

const logger = createPlatformLogger('facebook');

export class FacebookPlatform implements Platform {
  name = 'facebook';

  /**
   * Check if Facebook is properly configured
   */
  isConfigured(): boolean {
    const fbConfig = config.platforms.facebook;
    return !!(fbConfig.accessToken && fbConfig.pageId);
  }

  /**
   * Validate Facebook configuration
   */
  async validateConfig(): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.error('Facebook not configured - missing access token or page ID');
      return false;
    }

    try {
      const fbConfig = config.platforms.facebook;
      const response = await axios.get(
        `${fbConfig.baseUrl}/${fbConfig.apiVersion}/me?access_token=${fbConfig.accessToken}`
      );
      
      logger.info('Facebook configuration validated successfully');
      return true;
    } catch (error: any) {
      logger.error('Facebook configuration validation failed', { error: error.message });
      return false;
    }
  }

  /**
   * Post content to Facebook
   */
  async post(content: PostContent): Promise<PlatformResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Facebook not configured'
      };
    }

    return retryWithBackoff(async () => {
      if (content.media && content.media.length > 0) {
        return this.postWithMedia(content);
      } else {
        return this.postText(content.text || '');
      }
    }, config.retry.maxAttempts, config.retry.delay, 'facebook');
  }

  /**
   * Post text-only content
   */
  private async postText(text: string): Promise<PlatformResponse> {
    try {
      const fbConfig = config.platforms.facebook;
      const url = `${fbConfig.baseUrl}/${fbConfig.apiVersion}/${fbConfig.pageId}/feed`;
      
      const response = await axios.post(url, {
        message: text,
        access_token: fbConfig.accessToken
      });

      logger.info('Text post successful', { postId: response.data.id });
      
      return {
        success: true,
        data: response.data,
        postId: response.data.id
      };
    } catch (error: any) {
      logger.error('Failed to post text', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post content with media
   */
  private async postWithMedia(content: PostContent): Promise<PlatformResponse> {
    try {
      if (content.media!.length === 1) {
        return this.postSingleMedia(content);
      } else {
        return this.postMultipleMedia(content);
      }
    } catch (error: any) {
      logger.error('Failed to post with media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post single media item
   */
  private async postSingleMedia(content: PostContent): Promise<PlatformResponse> {
    const fbConfig = config.platforms.facebook;
    const media = content.media![0];
    const formData = new FormData();
    
    formData.append('access_token', fbConfig.accessToken);
    if (content.text) {
      formData.append('message', content.text);
    }
    
    const fileStream = await fs.readFile(media.path);
    formData.append('source', fileStream, {
      filename: media.path.split('/').pop(),
      contentType: media.mimetype
    });

    const endpoint = media.type === 'video' ? 'videos' : 'photos';
    const url = `${fbConfig.baseUrl}/${fbConfig.apiVersion}/${fbConfig.pageId}/${endpoint}`;

    const response = await axios.post(url, formData, {
      headers: formData.getHeaders()
    });

    logger.info('Single media post successful', { postId: response.data.id });
    
    return {
      success: true,
      data: response.data,
      postId: response.data.id
    };
  }

  /**
   * Post multiple media items
   */
  private async postMultipleMedia(content: PostContent): Promise<PlatformResponse> {
    // Facebook doesn't support multiple videos in one post
    const images = content.media!.filter(m => m.type === 'image');
    const videos = content.media!.filter(m => m.type === 'video');

    if (videos.length > 0 && images.length > 0) {
      return {
        success: false,
        error: 'Facebook does not support mixing images and videos in the same post'
      };
    }

    if (videos.length > 1) {
      return {
        success: false,
        error: 'Facebook does not support multiple videos in the same post'
      };
    }

    // Handle multiple images
    const fbConfig = config.platforms.facebook;
    const attachedMedia = [];

    // First, upload all media and get their IDs
    for (const media of content.media!) {
      const formData = new FormData();
      formData.append('access_token', fbConfig.accessToken);
      formData.append('published', 'false');
      
      const fileStream = await fs.readFile(media.path);
      formData.append('source', fileStream, {
        filename: media.path.split('/').pop(),
        contentType: media.mimetype
      });

      const url = `${fbConfig.baseUrl}/${fbConfig.apiVersion}/${fbConfig.pageId}/photos`;
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders()
      });

      attachedMedia.push({ media_fbid: response.data.id });
    }

    // Now create the post with all attached media
    const postData: any = {
      access_token: fbConfig.accessToken,
      attached_media: JSON.stringify(attachedMedia)
    };

    if (content.text) {
      postData.message = content.text;
    }

    const url = `${fbConfig.baseUrl}/${fbConfig.apiVersion}/${fbConfig.pageId}/feed`;
    const response = await axios.post(url, postData);

    logger.info('Multiple media post successful', { postId: response.data.id });
    
    return {
      success: true,
      data: response.data,
      postId: response.data.id
    };
  }
}