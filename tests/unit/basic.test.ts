import { describe, it, expect } from '@jest/globals';

describe('Basic Test Suite', () => {
  describe('Configuration', () => {
    it('should have test environment set up', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });
  });

  describe('Basic Math', () => {
    it('should do basic arithmetic', () => {
      expect(1 + 1).toBe(2);
      expect(2 * 3).toBe(6);
    });
  });

  describe('String Operations', () => {
    it('should concatenate strings', () => {
      expect('hello' + ' ' + 'world').toBe('hello world');
    });
  });
});
