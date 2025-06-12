import chalk from 'chalk';
import { validateAllPlatforms, getPlatformNames } from '../platforms/index.js';
import { validateConfig } from '../config/config.js';

interface StatusOptions {
  platform?: string;
}

/**
 * Handle status command
 */
export async function statusCommand(options: StatusOptions): Promise<void> {
  try {
    console.log(chalk.blue('\n🔍 Platform Connection Status\n'));

    if (options.platform) {
      await checkSinglePlatform(options.platform);
    } else {
      await checkAllPlatforms();
    }
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Check status of all platforms
 */
async function checkAllPlatforms(): Promise<void> {
  // First check configuration
  console.log(chalk.yellow('📋 Configuration Check:'));
  const missingConfig = validateConfig();
  
  for (const platform of getPlatformNames()) {
    const missing = missingConfig[platform];
    if (missing.length === 0) {
      console.log(chalk.green(`  ✅ ${platform}: Configured`));
    } else {
      console.log(chalk.red(`  ❌ ${platform}: Missing ${missing.join(', ')}`));
    }
  }

  // Then check API connections
  console.log(chalk.yellow('\n🌐 API Connection Check:'));
  const results = await validateAllPlatforms();
  
  for (const [platform, isValid] of Object.entries(results)) {
    if (isValid) {
      console.log(chalk.green(`  ✅ ${platform}: Connected`));
    } else {
      console.log(chalk.red(`  ❌ ${platform}: Connection failed`));
    }
  }

  // Summary
  const configuredCount = Object.values(missingConfig).filter(arr => arr.length === 0).length;
  const connectedCount = Object.values(results).filter(Boolean).length;
  
  console.log(chalk.blue('\n📊 Summary:'));
  console.log(chalk.gray(`  Configured platforms: ${configuredCount}/${getPlatformNames().length}`));
  console.log(chalk.gray(`  Connected platforms: ${connectedCount}/${getPlatformNames().length}`));
}

/**
 * Check status of a single platform
 */
async function checkSinglePlatform(platformName: string): Promise<void> {
  const platformNames = getPlatformNames();
  
  if (!platformNames.includes(platformName.toLowerCase())) {
    throw new Error(`Unknown platform: ${platformName}. Available platforms: ${platformNames.join(', ')}`);
  }

  const platform = platformName.toLowerCase();
  
  // Check configuration
  console.log(chalk.yellow(`📋 ${platform} Configuration:`));
  const missingConfig = validateConfig();
  const missing = missingConfig[platform];
  
  if (missing.length === 0) {
    console.log(chalk.green(`  ✅ All required environment variables are set`));
  } else {
    console.log(chalk.red(`  ❌ Missing environment variables: ${missing.join(', ')}`));
    return;
  }

  // Check API connection
  console.log(chalk.yellow(`\n🌐 ${platform} API Connection:`));
  const results = await validateAllPlatforms();
  
  if (results[platform]) {
    console.log(chalk.green(`  ✅ API connection successful`));
    console.log(chalk.gray(`  Platform is ready for posting`));
  } else {
    console.log(chalk.red(`  ❌ API connection failed`));
    console.log(chalk.gray(`  Check your credentials and network connection`));
  }
}