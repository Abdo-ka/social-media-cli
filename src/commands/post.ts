import inquirer from 'inquirer';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { isValidPlatform } from '../utils/helpers.js';
import { validateFiles, prepareMediaFiles } from '../utils/fileHandler.js';
import { APP_CONFIG } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { getPlatform } from '../platforms/index.js';
import type { PostOptions, PostContent } from '../types/index.js';

/**
 * Handle post command
 */
export async function postCommand(options: PostOptions): Promise<void> {
  try {
    if (options.interactive) {
      await interactivePost();
    } else {
      await directPost(options);
    }
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Post command failed: ${error.message}`));
    logger.error('Post command failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

/**
 * Interactive post creation
 */
async function interactivePost(): Promise<void> {
  console.log(chalk.blue('\n📝 Interactive Post Creation\n'));

  // Get platforms
  const platformAnswers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'platforms',
      message: 'Select platforms to post to:',
      choices: [
        { name: 'Facebook', value: 'facebook' },
        { name: 'Instagram', value: 'instagram' },
        { name: 'Telegram', value: 'telegram' },
        { name: 'LinkedIn', value: 'linkedin' }
      ],
      validate: (input) => input.length > 0 || 'Please select at least one platform'
    }
  ]);

  // Get content
  const contentAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'content',
      message: 'Enter post content:',
      validate: (input) => input.trim().length > 0 || 'Content cannot be empty'
    }
  ]);

  // Get media files
  const mediaAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'mediaFiles',
      message: 'Enter media file paths (comma-separated, or press Enter to skip):'
    }
  ]);

  let mediaFiles: string[] = [];
  if (mediaAnswers.mediaFiles?.trim()) {
    mediaFiles = mediaAnswers.mediaFiles
      .split(',')
      .map((f: string) => f.trim().replace(/['"]/g, ''))
      .filter((f: string) => f.length > 0);
  }

  const postData = {
    platforms: platformAnswers.platforms,
    content: contentAnswers.content,
    media: mediaFiles
  };

  await executePost(postData);
}

/**
 * Direct post from command line options
 */
async function directPost(options: PostOptions): Promise<void> {
  console.log(chalk.blue('\n📤 Creating Post\n'));

  // Parse platforms
  let platforms: string[] = [];
  if (options.platforms) {
    if (options.platforms.toLowerCase() === 'all') {
      platforms = ['facebook', 'instagram', 'telegram', 'linkedin'];
    } else {
      platforms = options.platforms.split(',').map(p => p.trim().toLowerCase());
    }
  } else {
    throw new Error('No platforms specified. Use --platforms option or --interactive mode');
  }

  // Validate platforms
  for (const platform of platforms) {
    if (!isValidPlatform(platform, APP_CONFIG.supportedPlatforms)) {
      throw new Error(`Invalid platform: ${platform}. Valid platforms: facebook, instagram, telegram, linkedin`);
    }
  }

  // Get content
  if (!options.content?.trim()) {
    throw new Error('No content specified. Use --content option or --interactive mode');
  }

  const postData = {
    platforms,
    content: options.content,
    media: options.media || []
  };

  await executePost(postData);
}

/**
 * Execute the post to all specified platforms
 */
async function executePost(data: {
  platforms: string[];
  content: string;
  media: string[];
}): Promise<void> {
  const { platforms, content, media } = data;

  // Validate and prepare media files
  let preparedMedia: any[] = [];
  if (media.length > 0) {
    console.log(chalk.gray('📂 Validating media files...'));
    
    // Validate file access
    for (const filePath of media) {
      try {
        await fs.access(filePath);
        console.log(chalk.green(`   ✅ ${filePath}`));
      } catch {
        throw new Error(`Cannot access file: ${filePath}`);
      }
    }

    // Validate and prepare files
    const validationResult = await validateFiles(media, 'telegram'); // Use telegram as default platform for validation
    if (validationResult.invalid.length > 0) {
      throw new Error(`Invalid media files: ${validationResult.errors.join(', ')}`);
    }

    preparedMedia = await prepareMediaFiles(media);
  }

  // Determine content type
  let contentType: 'text' | 'image' | 'video' | 'mixed' = 'text';
  if (preparedMedia.length > 0) {
    const hasImages = preparedMedia.some(f => f.type === 'image');
    const hasVideos = preparedMedia.some(f => f.type === 'video');
    
    if (hasImages && hasVideos) {
      contentType = 'mixed';
    } else if (hasVideos) {
      contentType = 'video';
    } else {
      contentType = 'image';
    }
  }

  const postContent: PostContent = {
    text: content,
    media: preparedMedia,
    type: contentType
  };

  console.log(chalk.blue(`\n🚀 Posting to ${platforms.length} platform(s)...\n`));

  const results: { [platform: string]: any } = {};
  const errors: { [platform: string]: string } = {};

  // Post to each platform
  for (const platform of platforms) {
    try {
      console.log(chalk.gray(`📤 Posting to ${platform}...`));
      
      const platformInstance = getPlatform(platform);
      if (!platformInstance) {
        throw new Error(`Platform ${platform} not found`);
      }

      if (!platformInstance.isConfigured()) {
        throw new Error(`Platform ${platform} is not configured`);
      }

      const result = await platformInstance.post(postContent);

      if (result.success) {
        results[platform] = result;
        console.log(chalk.green(`   ✅ ${platform}: Posted successfully`));
        if (result.postId) {
          console.log(chalk.gray(`      Post ID: ${result.postId}`));
        }
      } else {
        errors[platform] = result.error || 'Unknown error';
        console.log(chalk.red(`   ❌ ${platform}: ${result.error}`));
      }
    } catch (error: any) {
      errors[platform] = error.message;
      console.log(chalk.red(`   ❌ ${platform}: ${error.message}`));
      logger.error(`Failed to post to ${platform}`, { error: error.message, platform });
    }
  }

  // Summary
  const successCount = Object.keys(results).length;
  const errorCount = Object.keys(errors).length;

  console.log(chalk.blue('\n📊 Post Summary:'));
  console.log(chalk.green(`   ✅ Successful: ${successCount}/${platforms.length}`));
  
  if (errorCount > 0) {
    console.log(chalk.red(`   ❌ Failed: ${errorCount}/${platforms.length}`));
    console.log(chalk.gray('\nErrors:'));
    Object.entries(errors).forEach(([platform, error]) => {
      console.log(chalk.red(`   • ${platform}: ${error}`));
    });
  }

  console.log();

  // Log the results
  logger.info('Post execution completed', {
    platforms,
    contentType,
    results: Object.keys(results),
    errors: Object.keys(errors)
  });
}