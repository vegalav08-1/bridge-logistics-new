import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createChatMediaStorage } from '../storage';
import { FileDeduplicationService } from '../deduplication';
import { UploadInitSchema, UploadCompleteSchema } from '../schemas';

// Mock fetch для API тестов
global.fetch = vi.fn();

describe('Chat Media Integration Tests', () => {
  let storage: ReturnType<typeof createChatMediaStorage>;
  let deduplicationService: FileDeduplicationService;
  
  beforeEach(() => {
    storage = createChatMediaStorage();
    deduplicationService = new FileDeduplicationService();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('File Upload Flow', () => {
    it('should complete full upload flow', async () => {
      // 1. Инициализация загрузки
      const uploadInit = {
        chatId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'test.jpg',
        size: 1024000,
        mime: 'image/jpeg',
        sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        kind: 'image' as const
      };
      
      // Валидация данных
      const validatedData = UploadInitSchema.parse(uploadInit);
      expect(validatedData).toEqual(uploadInit);
      
      // 2. Проверка дедупликации
      const dedupResult = await deduplicationService.checkDeduplication(
        {
          sha256: uploadInit.sha256,
          size: uploadInit.size,
          name: uploadInit.name,
          mime: uploadInit.mime
        },
        uploadInit.chatId,
        'user-123'
      );
      
      expect(dedupResult.isDuplicate).toBe(false);
      
      // 3. Инициализация multipart загрузки
      const uploadResult = await storage.initMultipartUpload(
        `chats/${uploadInit.chatId}/file-456/original`,
        uploadInit.mime,
        { maxFileSize: uploadInit.size }
      );
      
      expect(uploadResult.uploadId).toBeDefined();
      expect(uploadResult.presignedUrls.length).toBeGreaterThan(0);
      
      // 4. Завершение загрузки
      const uploadComplete = {
        fileId: 'file-456',
        uploadId: uploadResult.uploadId,
        parts: [
          { partNumber: 1, etag: 'etag1' },
          { partNumber: 2, etag: 'etag2' }
        ]
      };
      
      const validatedComplete = UploadCompleteSchema.parse(uploadComplete);
      expect(validatedComplete).toEqual(uploadComplete);
      
      await storage.completeMultipartUpload(
        `chats/${uploadInit.chatId}/file-456/original`,
        uploadResult.uploadId,
        uploadComplete.parts
      );
      
      // 5. Генерация подписанного URL
      const signedUrl = await storage.generateSignedUrl(
        `chats/${uploadInit.chatId}/file-456/original`
      );
      
      expect(signedUrl).toBeDefined();
      expect(signedUrl).toContain('chats/');
    });
    
    it('should handle deduplication correctly', async () => {
      const fileHash = {
        sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        size: 1024000,
        name: 'duplicate.jpg',
        mime: 'image/jpeg'
      };
      
      // Первая загрузка - не дубликат
      const firstResult = await deduplicationService.checkDeduplication(
        fileHash,
        'chat-123',
        'user-456'
      );
      
      expect(firstResult.isDuplicate).toBe(false);
      
      // Вторая загрузка - дубликат
      const secondResult = await deduplicationService.checkDeduplication(
        fileHash,
        'chat-789',
        'user-101'
      );
      
      expect(secondResult.isDuplicate).toBe(true);
      expect(secondResult.existingFile).toBeDefined();
    });
  });
  
  describe('API Endpoints Integration', () => {
    it('should handle /api/files/init endpoint', async () => {
      const requestBody = {
        chatId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'test.jpg',
        size: 1024000,
        mime: 'image/jpeg',
        sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        kind: 'image'
      };
      
      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          fileId: 'file-123',
          uploadUrl: 'https://s3.example.com/presigned-url',
          uploadId: 'upload-123',
          partSize: 1024000,
          expiresIn: 3600
        })
      });
      
      const response = await fetch('/api/files/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.fileId).toBeDefined();
    });
    
    it('should handle /api/files/complete endpoint', async () => {
      const requestBody = {
        fileId: 'file-123',
        uploadId: 'upload-123',
        parts: [
          { partNumber: 1, etag: 'etag1' },
          { partNumber: 2, etag: 'etag2' }
        ]
      };
      
      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          fileId: 'file-123',
          url: 'https://s3.example.com/signed-url',
          status: 'completed'
        })
      });
      
      const response = await fetch('/api/files/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe('completed');
    });
    
    it('should handle /api/files/[id]/url endpoint', async () => {
      const fileId = 'file-123';
      const variant = 'thumb';
      const width = 256;
      const height = 256;
      
      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          url: 'https://s3.example.com/signed-url',
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          variant: 'thumb',
          file: {
            id: fileId,
            name: 'test.jpg',
            size: 1024000,
            mime: 'image/jpeg',
            kind: 'image'
          }
        })
      });
      
      const response = await fetch(`/api/files/${fileId}/url?variant=${variant}&width=${width}&height=${height}`);
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.url).toBeDefined();
      expect(data.variant).toBe(variant);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const invalidData = {
        chatId: 'invalid-uuid',
        name: '',
        size: -1,
        mime: '',
        sha256: 'invalid',
        kind: 'invalid'
      };
      
      expect(() => UploadInitSchema.parse(invalidData)).toThrow();
    });
    
    it('should handle storage errors gracefully', async () => {
      // Mock storage error
      vi.spyOn(storage, 'initMultipartUpload').mockRejectedValueOnce(
        new Error('Storage service unavailable')
      );
      
      await expect(storage.initMultipartUpload(
        'chats/chat-123/file-456/original',
        'image/jpeg'
      )).rejects.toThrow('Storage service unavailable');
    });
    
    it('should handle deduplication errors gracefully', async () => {
      // Mock deduplication error
      vi.spyOn(deduplicationService, 'checkDeduplication').mockRejectedValueOnce(
        new Error('Database connection failed')
      );
      
      const result = await deduplicationService.checkDeduplication(
        {
          sha256: 'test',
          size: 1000,
          name: 'test.jpg',
          mime: 'image/jpeg'
        },
        'chat-123',
        'user-456'
      );
      
      // Should return isDuplicate: false on error
      expect(result.isDuplicate).toBe(false);
    });
  });
  
  describe('Performance Tests', () => {
    it('should handle large files efficiently', async () => {
      const largeFileSize = 100 * 1024 * 1024; // 100MB
      
      const startTime = Date.now();
      
      const result = await storage.initMultipartUpload(
        'chats/chat-123/large-file/original',
        'video/mp4',
        { maxFileSize: largeFileSize }
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result.presignedUrls.length).toBeGreaterThan(1);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
    
    it('should handle multiple concurrent uploads', async () => {
      const uploads = Array.from({ length: 5 }, (_, i) => 
        storage.initMultipartUpload(
          `chats/chat-123/file-${i}/original`,
          'image/jpeg'
        )
      );
      
      const results = await Promise.all(uploads);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.uploadId).toBeDefined();
        expect(result.presignedUrls.length).toBeGreaterThan(0);
      });
    });
  });
});
