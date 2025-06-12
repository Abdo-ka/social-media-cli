import axios from 'axios';
import FormData from 'form-data';
import { promises as fs } from 'fs';
import { config } from '../config/config.js';
import { createPlatformLogger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/helpers.js';
import type { Platform, PostContent, PlatformResponse } from '../types/index.js';

const logger = createPlatformLogger('instagram');

export class InstagramPlatform implements Platform {
  name = 'instagram';

  /**
   * Check if Instagram is properly configured
   */
  isConfigured(): boolean {
    const igConfig = config.platforms.instagram;
    return !!(igConfig.accessToken && igConfig.accountId);
  }

  /**
   * Validate Instagram configuration
   */
  async validateConfig(): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.error('Instagram not configured - missing access token or account ID');
      return false;
    }

    try {
      const igConfig = config.platforms.instagram;
      const response = await axios.get(
        `${igConfig.baseUrl}/${igConfig.apiVersion}/${igConfig.accountId}?fields=id,username&access_token=${igConfig.accessToken}`
      );
      
      logger.info('Instagram configuration validated successfully', { username: response.data.username });
      return true;
    } catch (error: any) {
      logger.error('Instagram configuration validation failed', { error: error.message });
      return false;
    }
  }

  /**
   * Post content to Instagram
   */
  async post(content: PostContent): Promise<PlatformResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Instagram not configured'
      };
    }

    if (!content.media || content.media.length === 0) {
      return {
        success: false,
        error: 'Instagram requires at least one media file'
      };
    }

    return retryWithBackoff(async () => {
      if (content.media!.length === 1) {
        return this.postSingleMedia(content);
      } else {
        return this.postCarousel(content);
      }
    }, config.retry.maxAttempts, config.retry.delay, 'instagram');
  }

  /**
   * Post single media item
   */
  private async postSingleMedia(content: PostContent): Promise<PlatformResponse> {
    try {
      const igConfig = config.platforms.instagram;
      const media = content.media![0];

      // Step 1: Upload media and create container
      const containerResponse = await this.createMediaContainer(media, content.text);
      if (!containerResponse.success) {
        return containerResponse;
      }

      // Step 2: Publish the container
      const publishResponse = await this.publishContainer(containerResponse.data.id);
      
      logger.info('Single media post successful', { postId: publishResponse.data?.id });
      
      return publishResponse;
    } catch (error: any) {
      logger.error('Failed to post single media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post carousel (multiple media items)
   */
  private async postCarousel(content: PostContent): Promise<PlatformResponse> {
    try {
      const igConfig = config.platforms.instagram;
      const mediaContainers = [];

      // Step 1: Create containers for all media items
      for (const media of content.media!) {
        const containerResponse = await this.createMediaContainer(media);
        if (!containerResponse.success) {
          return containerResponse;
        }
        mediaContainers.push(containerResponse.data.id);
      }

      // Step 2: Create carousel container
      const carouselData: any = {
        media_type: 'CAROUSEL',
        children: mediaContainers.join(','),
        access_token: igConfig.accessToken
      };

      if (content.text) {
        carouselData.caption = content.text;
      }

      const carouselUrl = `${igConfig.baseUrl}/${igConfig.apiVersion}/${igConfig.accountId}/media`;
      const carouselResponse = await axios.post(carouselUrl, carouselData);

      // Step 3: Publish the carousel
      const publishResponse = await this.publishContainer(carouselResponse.data.id);
      
      logger.info('Carousel post successful', { postId: publishResponse.data?.id });
      
      return publishResponse;
    } catch (error: any) {
      logger.error('Failed to post carousel', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create media container
   */
  private async createMediaContainer(media: any, caption?: string): Promise<PlatformResponse> {
    try {
      const igConfig = config.platforms.instagram;
      
      // For Instagram, we need to upload to a public URL first
      // In a real implementation, you'd upload to your own server or cloud storage
      // For this example, we'll simulate the process
      
      const containerData: any = {
        access_token: igConfig.accessToken
      };

      if (media.type === 'video') {
        containerData.media_type = 'VIDEO';
        containerData.video_url = `https://your-server.com/uploads/${media.path.split('/').pop()}`;
      } else {
        containerData.media_type = 'IMAGE';
        containerData.image_url = `https://your-server.com/uploads/${media.path.split('/').pop()}`;
      }

      if (caption) {
        containerData.caption = caption;
      }

      const url = `${igConfig.baseUrl}/${igConfig.apiVersion}/${igConfig.accountId}/media`;
      const response = await axios.post(url, containerData);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Failed to create media container', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Publish container
   */
  private async publishContainer(containerId: string): Promise<PlatformResponse> {
    try {
      const igConfig = config.platforms.instagram;
      
      const publishData = {
        creation_id: containerId,
        access_token: igConfig.accessToken
      };

      const url = `${igConfig.baseUrl}/${igConfig.apiVersion}/${igConfig.accountId}/media_publish`;
      const response = await axios.post(url, publishData);

      return {
        success: true,
        data: response.data,
        postId: response.data.id
      };
    } catch (error: any) {
      logger.error('Failed to publish container', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}