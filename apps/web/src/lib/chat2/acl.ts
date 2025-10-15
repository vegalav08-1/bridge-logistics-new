import type { Role, Chat, Participant } from './types';

export function canEditSettings(meRole: Role) {
  return meRole === 'ADMIN' || meRole === 'SUPER';
}
export function canPostFinance(meRole: Role) {
  return meRole === 'ADMIN' || meRole === 'EMPLOYEE' || meRole === 'SUPER';
}
export function canManageParticipants(meRole: Role) {
  return meRole === 'ADMIN' || meRole === 'SUPER';
}
export function canPin(meRole: Role) {
  return meRole === 'ADMIN' || meRole === 'EMPLOYEE' || meRole === 'SUPER';
}
export function myParticipant(chat: Chat, meId: string): Participant|undefined {
  return chat.participants.find(p => p.userId === meId);
}

