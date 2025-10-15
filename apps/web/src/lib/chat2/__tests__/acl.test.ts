import { canEditSettings, canPostFinance, canManageParticipants, canPin, myParticipant } from '../acl';
import type { Role, Participant } from '../types';

describe('ACL functions', () => {
  const participants: Participant[] = [
    { userId: 'user1', role: 'USER', joinedAtISO: '2023-01-01T00:00:00Z' },
    { userId: 'admin1', role: 'ADMIN', joinedAtISO: '2023-01-01T00:00:00Z' },
    { userId: 'super1', role: 'SUPER', joinedAtISO: '2023-01-01T00:00:00Z' },
  ];

  describe('canEditSettings', () => {
    it('should allow ADMIN and SUPER to edit settings', () => {
      expect(canEditSettings('ADMIN')).toBe(true);
      expect(canEditSettings('SUPER')).toBe(true);
    });

    it('should deny USER from editing settings', () => {
      expect(canEditSettings('USER')).toBe(false);
    });
  });

  describe('canPostFinance', () => {
    it('should allow ADMIN and SUPER to post finance messages', () => {
      expect(canPostFinance('ADMIN')).toBe(true);
      expect(canPostFinance('SUPER')).toBe(true);
    });

    it('should deny USER from posting finance messages', () => {
      expect(canPostFinance('USER')).toBe(false);
    });
  });

  describe('canManageParticipants', () => {
    it('should allow ADMIN and SUPER to manage participants', () => {
      expect(canManageParticipants('ADMIN')).toBe(true);
      expect(canManageParticipants('SUPER')).toBe(true);
    });

    it('should deny USER from managing participants', () => {
      expect(canManageParticipants('USER')).toBe(false);
    });
  });

  describe('canPin', () => {
    it('should allow ADMIN and SUPER to pin messages', () => {
      expect(canPin('ADMIN')).toBe(true);
      expect(canPin('SUPER')).toBe(true);
    });

    it('should deny USER from pinning messages', () => {
      expect(canPin('USER')).toBe(false);
    });
  });

  describe('myParticipant', () => {
    it('should find participant by userId', () => {
      const participant = myParticipant(participants, 'user1');
      expect(participant).toEqual(participants[0]);
    });

    it('should return undefined for non-existent participant', () => {
      const participant = myParticipant(participants, 'nonexistent');
      expect(participant).toBeUndefined();
    });

    it('should handle empty participants list', () => {
      const participant = myParticipant([], 'user1');
      expect(participant).toBeUndefined();
    });
  });
});

