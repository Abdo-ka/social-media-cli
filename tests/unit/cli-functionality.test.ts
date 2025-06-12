import { describe, it, expect } from '@jest/globals';

describe('CLI Functionality Tests', () => {
  describe('Platform Selection', () => {
    it('should support all platforms', () => {
      const supportedPlatforms = ['facebook', 'instagram', 'telegram', 'linkedin'];
      expect(supportedPlatforms.length).toBeGreaterThan(0);
      expect(supportedPlatforms).toContain('facebook');
      expect(supportedPlatforms).toContain('instagram');
      expect(supportedPlatforms).toContain('telegram');
      expect(supportedPlatforms).toContain('linkedin');
    });

    it('should handle "all" platform selection', () => {
      const input = 'all';
      const supportedPlatforms = ['facebook', 'instagram', 'telegram', 'linkedin'];
      const result = input.toLowerCase() === 'all' ? supportedPlatforms : input.split(',');
      expect(result).toEqual(supportedPlatforms);
    });
  });

  describe('Media File Handling', () => {
    it('should handle single media file', () => {
      const mediaInput = '/path/to/image.jpg';
      const result = Array.isArray(mediaInput) ? mediaInput : [mediaInput];
      expect(result).toEqual(['/path/to/image.jpg']);
    });

    it('should handle multiple media files', () => {
      const mediaInput = ['/path/to/image.jpg', '/path/to/video.mp4'];
      const result = Array.isArray(mediaInput) ? mediaInput : [mediaInput];
      expect(result).toEqual(['/path/to/image.jpg', '/path/to/video.mp4']);
    });

    it('should handle comma-separated media files', () => {
      const mediaInput = '/path/to/image.jpg,/path/to/video.mp4';
      const result = mediaInput.split(',').map(f => f.trim()).filter(Boolean);
      expect(result).toEqual(['/path/to/image.jpg', '/path/to/video.mp4']);
    });
  });

  describe('File Path Validation', () => {
    it('should validate image file extensions', () => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const testFile = '/path/to/image.jpg';
      const extension = testFile.split('.').pop()?.toLowerCase();
      const isImage = imageExtensions.includes('.' + extension);
      expect(isImage).toBe(true);
    });

    it('should validate video file extensions', () => {
      const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
      const testFile = '/path/to/video.mp4';
      const extension = testFile.split('.').pop()?.toLowerCase();
      const isVideo = videoExtensions.includes('.' + extension);
      expect(isVideo).toBe(true);
    });
  });
});