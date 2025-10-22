import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatMediaStorage, FileKeyUtils, createChatMediaStorage } from '../storage';

// Mock S3 configuration
const mockS3Config = {
  endpoint: 's3.amazonaws.com',
  region: 'us-east-1',
  bucket: 'test-bucket',
  accessKeyId: 'test-key',
  secretAccessKey: 'test-secret'
};

describe('Chat Media Storage', () => {
  let storage: ChatMediaStorage;
  
  beforeEach(() => {
    storage = new ChatMediaStorage(mockS3Config);
  });
  
  describe('initMultipartUpload', () => {
    it('should initialize multipart upload with presigned URLs', async () => {
      const result = await storage.initMultipartUpload(
        'chats/chat-123/file-456/original',
        'image/jpeg',
        { maxFileSize: 1024 * 1024 } // 1MB
      );
      
      expect(result.uploadId).toBeDefined();
      expect(result.presignedUrls).toBeDefined();
      expect(result.presignedUrls.length).toBeGreaterThan(0);
      expect(result.partSize).toBeGreaterThan(0);
    });
    
    it('should handle large files with multiple parts', async () => {
      const result = await storage.initMultipartUpload(
        'chats/chat-123/file-456/original',
        'video/mp4',
        { maxFileSize: 100 * 1024 * 1024 } // 100MB
      );
      
      expect(result.presignedUrls.length).toBeGreaterThan(1);
    });
  });
  
  describe('completeMultipartUpload', () => {
    it('should complete multipart upload', async () => {
      const parts = [
        { partNumber: 1, etag: 'etag1' },
        { partNumber: 2, etag: 'etag2' }
      ];
      
      await expect(storage.completeMultipartUpload(
        'chats/chat-123/file-456/original',
        'upload-123',
        parts
      )).resolves.not.toThrow();
    });
  });
  
  describe('abortMultipartUpload', () => {
    it('should abort multipart upload', async () => {
      await expect(storage.abortMultipartUpload(
        'chats/chat-123/file-456/original',
        'upload-123'
      )).resolves.not.toThrow();
    });
  });
  
  describe('generatePresignedUploadUrl', () => {
    it('should generate presigned upload URL', async () => {
      const url = await storage.generatePresignedUploadUrl(
        'chats/chat-123/file-456/original',
        'image/jpeg'
      );
      
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
      expect(url).toContain('chats/chat-123/file-456/original');
    });
  });
  
  describe('generateSignedUrl', () => {
    it('should generate signed URL for original file', async () => {
      const url = await storage.generateSignedUrl(
        'chats/chat-123/file-456/original'
      );
      
      expect(url).toBeDefined();
      expect(url).toContain('chats/chat-123/file-456/original');
    });
    
    it('should generate signed URL for thumbnail', async () => {
      const url = await storage.generateSignedUrl(
        'chats/chat-123/file-456/original',
        { variant: 'thumb', width: 256, height: 256 }
      );
      
      expect(url).toBeDefined();
      expect(url).toContain('thumb_256x256.webp');
    });
    
    it('should generate signed URL for video poster', async () => {
      const url = await storage.generateSignedUrl(
        'chats/chat-123/file-456/original',
        { variant: 'poster' }
      );
      
      expect(url).toBeDefined();
      expect(url).toContain('poster.jpg');
    });
    
    it('should generate signed URL for HLS playlist', async () => {
      const url = await storage.generateSignedUrl(
        'chats/chat-123/file-456/original',
        { variant: 'hls' }
      );
      
      expect(url).toBeDefined();
      expect(url).toContain('hls/playlist.m3u8');
    });
  });
  
  describe('deleteFile', () => {
    it('should delete file', async () => {
      await expect(storage.deleteFile(
        'chats/chat-123/file-456/original'
      )).resolves.not.toThrow();
    });
  });
  
  describe('copyFile', () => {
    it('should copy file', async () => {
      await expect(storage.copyFile(
        'chats/chat-123/file-456/original',
        'chats/chat-789/file-456/original'
      )).resolves.not.toThrow();
    });
  });
  
  describe('fileExists', () => {
    it('should check if file exists', async () => {
      const exists = await storage.fileExists('chats/chat-123/file-456/original');
      
      expect(typeof exists).toBe('boolean');
    });
  });
  
  describe('getFileMetadata', () => {
    it('should get file metadata', async () => {
      const metadata = await storage.getFileMetadata('chats/chat-123/file-456/original');
      
      expect(metadata).toBeDefined();
      expect(metadata?.size).toBeDefined();
      expect(metadata?.lastModified).toBeDefined();
      expect(metadata?.etag).toBeDefined();
      expect(metadata?.contentType).toBeDefined();
    });
  });
});

describe('File Key Utils', () => {
  describe('getOriginalKey', () => {
    it('should generate original key', () => {
      const key = FileKeyUtils.getOriginalKey('chat-123', 'file-456');
      expect(key).toBe('chats/chat-123/file-456/original');
    });
  });
  
  describe('getThumbnailKey', () => {
    it('should generate thumbnail key', () => {
      const key = FileKeyUtils.getThumbnailKey('chat-123', 'file-456', 256, 256);
      expect(key).toBe('chats/chat-123/file-456/thumb_256x256.webp');
    });
  });
  
  describe('getPosterKey', () => {
    it('should generate poster key', () => {
      const key = FileKeyUtils.getPosterKey('chat-123', 'file-456');
      expect(key).toBe('chats/chat-123/file-456/poster.jpg');
    });
  });
  
  describe('getHlsKey', () => {
    it('should generate HLS key', () => {
      const key = FileKeyUtils.getHlsKey('chat-123', 'file-456');
      expect(key).toBe('chats/chat-123/file-456/hls/playlist.m3u8');
    });
  });
  
  describe('getHlsSegmentKey', () => {
    it('should generate HLS segment key', () => {
      const key = FileKeyUtils.getHlsSegmentKey('chat-123', 'file-456', 'segment001.ts');
      expect(key).toBe('chats/chat-123/file-456/hls/segment001.ts');
    });
  });
  
  describe('extractChatId', () => {
    it('should extract chat ID from key', () => {
      const chatId = FileKeyUtils.extractChatId('chats/chat-123/file-456/original');
      expect(chatId).toBe('chat-123');
    });
    
    it('should return null for invalid key', () => {
      const chatId = FileKeyUtils.extractChatId('invalid-key');
      expect(chatId).toBeNull();
    });
  });
  
  describe('extractFileId', () => {
    it('should extract file ID from key', () => {
      const fileId = FileKeyUtils.extractFileId('chats/chat-123/file-456/original');
      expect(fileId).toBe('file-456');
    });
    
    it('should return null for invalid key', () => {
      const fileId = FileKeyUtils.extractFileId('invalid-key');
      expect(fileId).toBeNull();
    });
  });
});

describe('createChatMediaStorage', () => {
  it('should create storage instance with environment config', () => {
    const storage = createChatMediaStorage();
    expect(storage).toBeInstanceOf(ChatMediaStorage);
  });
});
