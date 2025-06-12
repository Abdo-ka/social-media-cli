import axios from 'axios';
import FormData from 'form-data';
import { promises as fs } from 'fs';
import { config } from '../config/config.js';
import { createPlatformLogger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/helpers.js';
import type { Platform, PostContent, PlatformResponse } from '../types/index.js';

const logger = createPlatformLogger('linkedin');

export class LinkedInPlatform implements Platform {
  name = 'linkedin';

  /**
   * Check if LinkedIn is properly configured
   */
  isConfigured(): boolean {
    const liConfig = config.platforms.linkedin;
    return !!(liConfig.accessToken && liConfig.personId);
  }

  /**
   * Validate LinkedIn configuration
   */
  async validateConfig(): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.error('LinkedIn not configured - missing access token or person ID');
      return false;
    }

    try {
      const liConfig = config.platforms.linkedin;
      const response = await axios.get(
        `${liConfig.baseUrl}/people/~:(id,firstName,lastName)`,
        {
          headers: {
            'Authorization': `Bearer ${liConfig.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info('LinkedIn configuration validated successfully', { 
        name: `${response.data.firstName.localized.en_US} ${response.data.lastName.localized.en_US}` 
      });
      return true;
    } catch (error: any) {
      logger.error('LinkedIn configuration validation failed', { error: error.message });
      return false;
    }
  }

  /**
   * Post content to LinkedIn
   */
  async post(content: PostContent): Promise<PlatformResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'LinkedIn not configured'
      };
    }

    return retryWithBackoff(async () => {
      if (!content.media || content.media.length === 0) {
        return this.postText(content.text || '');
      } else if (content.media.length === 1) {
        return this.postWithSingleMedia(content);
      } else {
        return this.postWithMultipleMedia(content);
      }
    }, config.retry.maxAttempts, config.retry.delay, 'linkedin');
  }

  /**
   * Post text-only content
   */
  private async postText(text: string): Promise<PlatformResponse> {
    try {
      const liConfig = config.platforms.linkedin;
      
      const postData = {
        author: `urn:li:person:${liConfig.personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(
        `${liConfig.baseUrl}/ugcPosts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${liConfig.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

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
   * Post with single media
   */
  private async postWithSingleMedia(content: PostContent): Promise<PlatformResponse> {
    try {
      const media = content.media![0];
      
      // Step 1: Register upload
      const uploadResponse = await this.registerUpload(media);
      if (!uploadResponse.success) {
        return uploadResponse;
      }

      // Step 2: Upload media
      const uploadUrlResponse = await this.uploadMedia(media, uploadResponse.data.uploadMechanism);
      if (!uploadUrlResponse.success) {
        return uploadUrlResponse;
      }

      // Step 3: Create post with media
      const postResponse = await this.createPostWithMedia(content, uploadResponse.data.asset);
      
      logger.info('Single media post successful', { postId: postResponse.data?.id });
      
      return postResponse;
    } catch (error: any) {
      logger.error('Failed to post with single media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post with multiple media
   */
  private async postWithMultipleMedia(content: PostContent): Promise<PlatformResponse> {
    try {
      const mediaAssets = [];

      // Upload all media items
      for (const media of content.media!) {
        // Step 1: Register upload
        const uploadResponse = await this.registerUpload(media);
        if (!uploadResponse.success) {
          return uploadResponse;
        }

        // Step 2: Upload media
        const uploadUrlResponse = await this.uploadMedia(media, uploadResponse.data.uploadMechanism);
        if (!uploadUrlResponse.success) {
          return uploadUrlResponse;
        }

        mediaAssets.push(uploadResponse.data.asset);
      }

      // Step 3: Create post with all media
      const postResponse = await this.createPostWithMultipleMedia(content, mediaAssets);
      
      logger.info('Multiple media post successful', { postId: postResponse.data?.id });
      
      return postResponse;
    } catch (error: any) {
      logger.error('Failed to post with multiple media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register upload for media
   */
  private async registerUpload(media: any): Promise<PlatformResponse> {
    try {
      const liConfig = config.platforms.linkedin;
      
      const registerData = {
        registerUploadRequest: {
          recipes: media.type === 'video' ? ['urn:li:digitalmediaRecipe:feedshare-video'] : ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${liConfig.personId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      };

      const response = await axios.post(
        `${liConfig.baseUrl}/assets?action=registerUpload`,
        registerData,
        {
          headers: {
            'Authorization': `Bearer ${liConfig.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.value
      };
    } catch (error: any) {
      logger.error('Failed to register upload', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload media to LinkedIn
   */
  private async uploadMedia(media: any, uploadMechanism: any): Promise<PlatformResponse> {
    try {
      const fileData = await fs.readFile(media.path);
      
      const response = await axios.put(
        uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
        fileData,
        {
          headers: {
            'Content-Type': media.mimetype || 'application/octet-stream'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Failed to upload media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create post with media
   */
  private async createPostWithMedia(content: PostContent, asset: string): Promise<PlatformResponse> {
    try {
      const liConfig = config.platforms.linkedin;
      
      const postData = {
        author: `urn:li:person:${liConfig.personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text || ''
            },
            shareMediaCategory: content.media![0].type === 'video' ? 'VIDEO' : 'IMAGE',
            media: [
              {
                status: 'READY',
                description: {
                  text: content.text || ''
                },
                media: asset,
                title: {
                  text: 'Media Post'
                }
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(
        `${liConfig.baseUrl}/ugcPosts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${liConfig.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        postId: response.data.id
      };
    } catch (error: any) {
      logger.error('Failed to create post with media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create post with multiple media
   */
  private async createPostWithMultipleMedia(content: PostContent, assets: string[]): Promise<PlatformResponse> {
    try {
      const liConfig = config.platforms.linkedin;
      
      const mediaItems = assets.map((asset, index) => ({
        status: 'READY',
        description: {
          text: content.text || ''
        },
        media: asset,
        title: {
          text: `Media ${index + 1}`
        }
      }));

      const postData = {
        author: `urn:li:person:${liConfig.personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text || ''
            },
            shareMediaCategory: 'IMAGE',
            media: mediaItems
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(
        `${liConfig.baseUrl}/ugcPosts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${liConfig.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        postId: response.data.id
      };
    } catch (error: any) {
      logger.error('Failed to create post with multiple media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}