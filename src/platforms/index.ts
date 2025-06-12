import { FacebookPlatform } from './facebook.js';
import { InstagramPlatform } from './instagram.js';
import { TelegramPlatform } from './telegram.js';
import { LinkedInPlatform } from './linkedin.js';
import type { Platform } from '../types/index.js';

// Platform instances
export const platforms: Record<string, Platform> = {
  facebook: new FacebookPlatform(),
  instagram: new InstagramPlatform(),
  telegram: new TelegramPlatform(),
  linkedin: new LinkedInPlatform()
};

/**
 * Get platform instance by name
 */
export function getPlatform(name: string): Platform | null {
  return platforms[name.toLowerCase()] || null;
}

/**
 * Get all configured platforms
 */
export function getConfiguredPlatforms(): Platform[] {
  return Object.values(platforms).filter(platform => platform.isConfigured());
}

/**
 * Get platform names
 */
export function getPlatformNames(): string[] {
  return Object.keys(platforms);
}

/**
 * Validate all platform configurations
 */
export async function validateAllPlatforms(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  for (const [name, platform] of Object.entries(platforms)) {
    if (platform.isConfigured()) {
      results[name] = await platform.validateConfig();
    } else {
      results[name] = false;
    }
  }
  
  return results;
}