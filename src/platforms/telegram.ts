import axios from 'axios';
import FormData from 'form-data';
import { promises as fs } from 'fs';
import { config } from '../config/config.js';
import { createPlatformLogger } from '../utils/logger.js';
import { retryWithBackoff } from '../utils/helpers.js';
import type { Platform, PostContent, PlatformResponse } from '../types/index.js';

const logger = createPlatformLogger('telegram');

export class TelegramPlatform implements Platform {
  name = 'telegram';

  /**
   * Check if Telegram is properly configured
   */
  isConfigured(): boolean {
    const tgConfig = config.platforms.telegram;
    return !!(tgConfig.botToken && tgConfig.chatId);
  }

  /**
   * Validate Telegram configuration
   */
  async validateConfig(): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.error('Telegram not configured - missing bot token or chat ID');
      return false;
    }

    try {
      const tgConfig = config.platforms.telegram;
      const response = await axios.get(
        `${tgConfig.baseUrl}/bot${tgConfig.botToken}/getMe`
      );
      
      logger.info('Telegram configuration validated successfully', { botInfo: response.data.result });
      return true;
    } catch (error: any) {
      logger.error('Telegram configuration validation failed', { error: error.message });
      return false;
    }
  }

  /**
   * Post content to Telegram
   */
  async post(content: PostContent): Promise<PlatformResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Telegram not configured'
      };
    }

    return retryWithBackoff(async () => {
      if (!content.media || content.media.length === 0) {
        return this.sendMessage(content.text || '');
      } else if (content.media.length === 1) {
        return this.sendSingleMedia(content);
      } else {
        return this.sendMediaGroup(content);
      }
    }, config.retry.maxAttempts, config.retry.delay, 'telegram');
  }

  /**
   * Send text message
   */
  private async sendMessage(text: string): Promise<PlatformResponse> {
    try {
      const tgConfig = config.platforms.telegram;
      const url = `${tgConfig.baseUrl}/bot${tgConfig.botToken}/sendMessage`;
      
      const response = await axios.post(url, {
        chat_id: tgConfig.chatId,
        text: text,
        parse_mode: 'HTML'
      });

      logger.info('Text message sent successfully', { messageId: response.data.result.message_id });
      
      return {
        success: true,
        data: response.data.result,
        postId: response.data.result.message_id.toString()
      };
    } catch (error: any) {
      logger.error('Failed to send text message', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send single media item
   */
  private async sendSingleMedia(content: PostContent): Promise<PlatformResponse> {
    try {
      const tgConfig = config.platforms.telegram;
      const media = content.media![0];
      const formData = new FormData();
      
      formData.append('chat_id', tgConfig.chatId);
      if (content.text) {
        formData.append('caption', content.text);
        formData.append('parse_mode', 'HTML');
      }
      
      const fileStream = await fs.readFile(media.path);
      const filename = media.path.split('/').pop();
      
      let endpoint: string;
      let fieldName: string;
      
      if (media.type === 'video') {
        endpoint = 'sendVideo';
        fieldName = 'video';
      } else {
        endpoint = 'sendPhoto';
        fieldName = 'photo';
      }
      
      formData.append(fieldName, fileStream, {
        filename,
        contentType: media.mimetype
      });

      const url = `${tgConfig.baseUrl}/bot${tgConfig.botToken}/${endpoint}`;
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders()
      });

      logger.info('Single media sent successfully', { messageId: response.data.result.message_id });
      
      return {
        success: true,
        data: response.data.result,
        postId: response.data.result.message_id.toString()
      };
    } catch (error: any) {
      logger.error('Failed to send single media', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send media group (multiple media items)
   */
  private async sendMediaGroup(content: PostContent): Promise<PlatformResponse> {
    try {
      const tgConfig = config.platforms.telegram;
      const formData = new FormData();
      const mediaArray = [];
      
      formData.append('chat_id', tgConfig.chatId);
      
      for (let i = 0; i < content.media!.length; i++) {
        const media = content.media![i];
        const fileStream = await fs.readFile(media.path);
        const filename = media.path.split('/').pop();
        const fieldName = `file_${i}`;
        
        formData.append(fieldName, fileStream, {
          filename,
          contentType: media.mimetype
        });
        
        const mediaObject: any = {
          type: media.type === 'video' ? 'video' : 'photo',
          media: `attach://${fieldName}`
        };
        
        // Add caption to first media item
        if (i === 0 && content.text) {
          mediaObject.caption = content.text;
          mediaObject.parse_mode = 'HTML';
        }
        
        mediaArray.push(mediaObject);
      }
      
      formData.append('media', JSON.stringify(mediaArray));

      const url = `${tgConfig.baseUrl}/bot${tgConfig.botToken}/sendMediaGroup`;
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders()
      });

      logger.info('Media group sent successfully', { 
        messageCount: response.data.result.length,
        firstMessageId: response.data.result[0].message_id 
      });
      
      return {
        success: true,
        data: response.data.result,
        postId: response.data.result[0].message_id.toString()
      };
    } catch (error: any) {
      logger.error('Failed to send media group', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}