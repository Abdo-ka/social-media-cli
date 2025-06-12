export interface PlatformConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  accessToken?: string;
  appId?: string;
  appSecret?: string;
  botToken?: string;
  chatId?: string;
  [key: string]: any;
}

export interface MediaFile {
  path: string;
  type: 'image' | 'video';
  mimetype?: string;
  size?: number;
}

export interface PostContent {
  text?: string;
  media?: MediaFile[];
  type: 'text' | 'image' | 'video' | 'mixed';
}

export interface PlatformResponse {
  success: boolean;
  data?: any;
  error?: string;
  postId?: string;
}

export interface PostOptions {
  platforms?: string;
  content?: string;
  media?: string[];
  interactive?: boolean;
}

export interface Platform {
  name: string;
  post(content: PostContent): Promise<PlatformResponse>;
  validateConfig(): Promise<boolean>;
  isConfigured(): boolean;
}

export interface Config {
  platforms: {
    facebook: PlatformConfig;
    instagram: PlatformConfig;
    telegram: PlatformConfig;
    linkedin: PlatformConfig;
  };
  storage: {
    postsFile: string;
    uploadsDir: string;
    logsDir: string;
  };
  retry: {
    maxAttempts: number;
    delay: number;
  };
}

export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Export supported platform type
export type SupportedPlatform = 'facebook' | 'instagram' | 'telegram' | 'linkedin';
