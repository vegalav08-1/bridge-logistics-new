import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileDeduplicationService, FileHashUtils } from '../deduplication';

describe('File Deduplication Service', () => {
  let deduplicationService: FileDeduplicationService;
  
  beforeEach(() => {
    deduplicationService = new FileDeduplicationService();
  });
  
  describe('checkDeduplication', () => {
    it('should return isDuplicate: false for new files', async () => {
      const fileHash = {
        sha256: 'new1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        size: 1024000,
        name: 'new-file.jpg',
        mime: 'image/jpeg'
      };
      
      const result = await deduplicationService.checkDeduplication(
        fileHash,
        'chat-123',
        'user-456'
      );
      
      expect(result.isDuplicate).toBe(false);
      expect(result.existingFile).toBeUndefined();
    });
    
    it('should return isDuplicate: true for existing files', async () => {
      const fileHash = {
        sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        size: 1024000,
        name: 'duplicate.jpg',
        mime: 'image/jpeg'
      };
      
      const result = await deduplicationService.checkDeduplication(
        fileHash,
        'chat-123',
        'user-456'
      );
      
      expect(result.isDuplicate).toBe(true);
      expect(result.existingFile).toBeDefined();
      expect(result.existingFile?.id).toBe('existing-file-123');
      expect(result.existingFile?.name).toBe('duplicate.jpg');
    });
  });
  
  describe('createFileReference', () => {
    it('should create a file reference for existing file', async () => {
      const fileId = await deduplicationService.createFileReference(
        'existing-file-123',
        'chat-456',
        'message-789',
        'user-101'
      );
      
      expect(fileId).toBeDefined();
      expect(typeof fileId).toBe('string');
    });
  });
  
  describe('getDeduplicationStats', () => {
    it('should return deduplication statistics', async () => {
      const stats = await deduplicationService.getDeduplicationStats('chat-123');
      
      expect(stats).toHaveProperty('totalFiles');
      expect(stats).toHaveProperty('uniqueFiles');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('savedSize');
      expect(stats).toHaveProperty('deduplicationRate');
    });
  });
  
  describe('cleanupUnusedFiles', () => {
    it('should cleanup unused files', async () => {
      const cleanedCount = await deduplicationService.cleanupUnusedFiles(30);
      
      expect(typeof cleanedCount).toBe('number');
      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('File Hash Utils', () => {
  describe('calculateSHA256', () => {
    it('should calculate SHA256 hash for a file', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const hash = await FileHashUtils.calculateSHA256(file);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 produces 64 character hex string
    });
  });
  
  describe('verifyFileIntegrity', () => {
    it('should verify file integrity with correct hash', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const expectedHash = await FileHashUtils.calculateSHA256(file);
      
      const isValid = await FileHashUtils.verifyFileIntegrity(file, expectedHash);
      
      expect(isValid).toBe(true);
    });
    
    it('should reject file with incorrect hash', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const incorrectHash = 'incorrect1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      
      const isValid = await FileHashUtils.verifyFileIntegrity(file, incorrectHash);
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('generateUniqueFileName', () => {
    it('should generate unique file name with file ID', () => {
      const originalName = 'test.jpg';
      const fileId = '123e4567-e89b-12d3-a456-426614174000';
      
      const uniqueName = FileHashUtils.generateUniqueFileName(originalName, fileId);
      
      expect(uniqueName).toBe('test_123e4567.jpg');
    });
    
    it('should handle files without extension', () => {
      const originalName = 'test';
      const fileId = '123e4567-e89b-12d3-a456-426614174000';
      
      const uniqueName = FileHashUtils.generateUniqueFileName(originalName, fileId);
      
      expect(uniqueName).toBe('test_123e4567');
    });
  });
  
  describe('normalizeFileName', () => {
    it('should normalize file names with special characters', () => {
      const testCases = [
        { input: 'My File (1).jpg', expected: 'my_file_1_.jpg' },
        { input: 'файл с пробелами.png', expected: '____________.png' },
        { input: 'file___with___underscores.txt', expected: 'file_with_underscores.txt' },
        { input: '_file_with_underscores_', expected: 'file_with_underscores' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = FileHashUtils.normalizeFileName(input);
        expect(result).toBe(expected);
      });
    });
  });
});
