import { extractMentions, filterMentionRecipients } from '../mentions';

describe('extractMentions', () => {
  it('should extract mentions from text', () => {
    const text = 'Hello @user123 and @user456, how are you?';
    const mentions = extractMentions(text);
    
    expect(mentions).toHaveLength(2);
    expect(mentions[0]).toEqual({ userId: 'user123', from: 6, to: 13 });
    expect(mentions[1]).toEqual({ userId: 'user456', from: 18, to: 25 });
  });

  it('should handle text without mentions', () => {
    const text = 'Hello world, how are you?';
    const mentions = extractMentions(text);
    
    expect(mentions).toHaveLength(0);
  });

  it('should handle empty text', () => {
    const mentions = extractMentions('');
    expect(mentions).toHaveLength(0);
  });

  it('should handle duplicate mentions', () => {
    const text = 'Hello @user123 and @user123 again';
    const mentions = extractMentions(text);
    
    expect(mentions).toHaveLength(2);
    expect(mentions[0].userId).toBe('user123');
    expect(mentions[1].userId).toBe('user123');
  });
});

describe('filterMentionRecipients', () => {
  const participants = [
    { userId: 'user1', role: 'USER' as const, joinedAtISO: '2023-01-01T00:00:00Z' },
    { userId: 'user2', role: 'ADMIN' as const, joinedAtISO: '2023-01-01T00:00:00Z' },
    { userId: 'user3', role: 'USER' as const, joinedAtISO: '2023-01-01T00:00:00Z', muted: true },
  ];

  it('should filter out muted participants', () => {
    const mentions = [
      { userId: 'user1', from: 0, to: 6 },
      { userId: 'user2', from: 0, to: 6 },
      { userId: 'user3', from: 0, to: 6 },
    ];
    
    const filtered = filterMentionRecipients(mentions, participants);
    
    expect(filtered).toHaveLength(2);
    expect(filtered.map(m => m.userId)).toEqual(['user1', 'user2']);
  });

  it('should handle empty mentions', () => {
    const filtered = filterMentionRecipients([], participants);
    expect(filtered).toHaveLength(0);
  });

  it('should handle mentions for non-existent participants', () => {
    const mentions = [
      { userId: 'nonexistent', from: 0, to: 11 },
    ];
    
    const filtered = filterMentionRecipients(mentions, participants);
    expect(filtered).toHaveLength(0);
  });
});

