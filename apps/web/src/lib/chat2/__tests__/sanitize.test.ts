import { sanitizeText } from '../sanitize';

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello <b>world</b>';
    const result = sanitizeText(input);
    expect(result).toBe('Hello world');
  });

  it('should limit text length', () => {
    const longText = 'a'.repeat(10000);
    const result = sanitizeText(longText);
    expect(result.length).toBeLessThanOrEqual(4000);
  });

  it('should preserve mentions', () => {
    const input = 'Hello @user123 how are you?';
    const result = sanitizeText(input);
    expect(result).toBe('Hello @user123 how are you?');
  });

  it('should handle empty string', () => {
    const result = sanitizeText('');
    expect(result).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeText(null as any)).toBe('');
    expect(sanitizeText(undefined as any)).toBe('');
  });
});

