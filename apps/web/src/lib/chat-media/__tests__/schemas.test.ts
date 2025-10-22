import { describe, it, expect } from 'vitest';
import {
  MediaKindSchema,
  FileMetadataSchema,
  ImageMetadataSchema,
  VideoMetadataSchema,
  AudioMetadataSchema,
  DocumentMetadataSchema,
  FileMetaJsonSchema,
  UploadInitSchema,
  UploadCompleteSchema,
  FileUrlSchema,
  validateFileType,
  getFileKindFromMime,
  formatFileSize,
  getFileIcon
} from '../schemas';

describe('Chat Media Schemas', () => {
  describe('MediaKindSchema', () => {
    it('should validate valid media kinds', () => {
      const validKinds = ['image', 'video', 'pdf', 'doc', 'sheet', 'audio', 'other'];
      
      validKinds.forEach(kind => {
        expect(() => MediaKindSchema.parse(kind)).not.toThrow();
      });
    });
    
    it('should reject invalid media kinds', () => {
      const invalidKinds = ['invalid', 'text', 'archive', ''];
      
      invalidKinds.forEach(kind => {
        expect(() => MediaKindSchema.parse(kind)).toThrow();
      });
    });
  });
  
  describe('FileMetadataSchema', () => {
    it('should validate valid file metadata', () => {
      const validMetadata = {
        name: 'test.jpg',
        size: 1024000,
        mime: 'image/jpeg',
        sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
      };
      
      expect(() => FileMetadataSchema.parse(validMetadata)).not.toThrow();
    });
    
    it('should reject invalid file metadata', () => {
      const invalidMetadata = {
        name: '', // empty name
        size: -1, // negative size
        mime: '', // empty mime
        sha256: 'invalid' // invalid sha256
      };
      
      expect(() => FileMetadataSchema.parse(invalidMetadata)).toThrow();
    });
  });
  
  describe('ImageMetadataSchema', () => {
    it('should validate valid image metadata', () => {
      const validImage = {
        width: 1920,
        height: 1080,
        orientation: 1,
        exif: { camera: 'iPhone' },
        hasAlpha: false
      };
      
      expect(() => ImageMetadataSchema.parse(validImage)).not.toThrow();
    });
    
    it('should reject invalid image metadata', () => {
      const invalidImage = {
        width: -1, // negative width
        height: 0, // zero height
        orientation: 9 // invalid orientation
      };
      
      expect(() => ImageMetadataSchema.parse(invalidImage)).toThrow();
    });
  });
  
  describe('VideoMetadataSchema', () => {
    it('should validate valid video metadata', () => {
      const validVideo = {
        width: 1920,
        height: 1080,
        duration: 120000, // 2 minutes
        fps: 30,
        codec: 'h264',
        bitrate: 5000000
      };
      
      expect(() => VideoMetadataSchema.parse(validVideo)).not.toThrow();
    });
  });
  
  describe('AudioMetadataSchema', () => {
    it('should validate valid audio metadata', () => {
      const validAudio = {
        duration: 180000, // 3 minutes
        bitrate: 320000,
        sampleRate: 44100,
        channels: 2
      };
      
      expect(() => AudioMetadataSchema.parse(validAudio)).not.toThrow();
    });
  });
  
  describe('DocumentMetadataSchema', () => {
    it('should validate valid document metadata', () => {
      const validDoc = {
        pages: 10,
        title: 'Test Document',
        author: 'John Doe',
        subject: 'Test Subject',
        keywords: ['test', 'document'],
        language: 'en'
      };
      
      expect(() => DocumentMetadataSchema.parse(validDoc)).not.toThrow();
    });
  });
  
  describe('UploadInitSchema', () => {
    it('should validate valid upload init data', () => {
      const validUpload = {
        chatId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'test.jpg',
        size: 1024000,
        mime: 'image/jpeg',
        sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        kind: 'image',
        meta: {
          image: {
            width: 1920,
            height: 1080
          }
        }
      };
      
      expect(() => UploadInitSchema.parse(validUpload)).not.toThrow();
    });
    
    it('should reject upload init data with invalid chatId', () => {
      const invalidUpload = {
        chatId: 'invalid-uuid',
        name: 'test.jpg',
        size: 1024000,
        mime: 'image/jpeg',
        sha256: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        kind: 'image'
      };
      
      expect(() => UploadInitSchema.parse(invalidUpload)).toThrow();
    });
  });
  
  describe('UploadCompleteSchema', () => {
    it('should validate valid upload complete data', () => {
      const validComplete = {
        fileId: '123e4567-e89b-12d3-a456-426614174000',
        uploadId: 'upload-123',
        parts: [
          { partNumber: 1, etag: 'etag1' },
          { partNumber: 2, etag: 'etag2' }
        ]
      };
      
      expect(() => UploadCompleteSchema.parse(validComplete)).not.toThrow();
    });
  });
  
  describe('FileUrlSchema', () => {
    it('should validate valid file URL data', () => {
      const validUrl = {
        fileId: '123e4567-e89b-12d3-a456-426614174000',
        variant: 'thumb',
        width: 256,
        height: 256,
        expiresIn: 3600
      };
      
      expect(() => FileUrlSchema.parse(validUrl)).not.toThrow();
    });
  });
  
  describe('Utility functions', () => {
    describe('validateFileType', () => {
      it('should validate correct file types', () => {
        expect(validateFileType('image/jpeg', 'image')).toBe(true);
        expect(validateFileType('video/mp4', 'video')).toBe(true);
        expect(validateFileType('application/pdf', 'pdf')).toBe(true);
      });
      
      it('should reject incorrect file types', () => {
        expect(validateFileType('image/jpeg', 'video')).toBe(false);
        expect(validateFileType('video/mp4', 'image')).toBe(false);
        expect(validateFileType('application/pdf', 'audio')).toBe(false);
      });
    });
    
    describe('getFileKindFromMime', () => {
      it('should return correct file kind from MIME type', () => {
        expect(getFileKindFromMime('image/jpeg')).toBe('image');
        expect(getFileKindFromMime('video/mp4')).toBe('video');
        expect(getFileKindFromMime('audio/mpeg')).toBe('audio');
        expect(getFileKindFromMime('application/pdf')).toBe('pdf');
        expect(getFileKindFromMime('application/msword')).toBe('doc');
        expect(getFileKindFromMime('application/vnd.ms-excel')).toBe('sheet');
        expect(getFileKindFromMime('text/plain')).toBe('other');
      });
    });
    
    describe('formatFileSize', () => {
      it('should format file sizes correctly', () => {
        expect(formatFileSize(1024)).toBe('1.0 KB');
        expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
        expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
      });
    });
    
    describe('getFileIcon', () => {
      it('should return correct icons for file kinds', () => {
        expect(getFileIcon('image')).toBe('🖼️');
        expect(getFileIcon('video')).toBe('🎬');
        expect(getFileIcon('pdf')).toBe('📄');
        expect(getFileIcon('doc')).toBe('📝');
        expect(getFileIcon('sheet')).toBe('📊');
        expect(getFileIcon('audio')).toBe('🎵');
        expect(getFileIcon('other')).toBe('📎');
      });
    });
  });
});
