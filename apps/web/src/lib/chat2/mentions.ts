import type { Mention } from './types';

export function extractMentions(text: string, index: Array<{id:string; name:string}>): Mention[] {
  // Простой алгоритм: ищем "@Name" с точным совпадением из index (регистронезависимо)
  const res: Mention[] = [];
  for (const u of index) {
    const re = new RegExp(`(^|\\s)@${escapeRegExp(u.name)}\\b`, 'gi');
    let m:RegExpExecArray|null;
    while ((m = re.exec(text))) {
      const start = m.index + m[1].length;
      res.push({ userId: u.id, from: start, to: start + u.name.length + 1 });
    }
  }
  return res;
}
function escapeRegExp(s:string){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

export function filterMentionRecipients(mentions: Mention[], chatParticipants: Array<{userId:string; muted?:boolean}>, allowOverride:boolean) {
  // если allowOverride=false — mute побеждает (никого не будим)
  // если true — упомянутых будим, даже если они muted
  const set = new Set(mentions.map(m=>m.userId));
  return chatParticipants.filter(p=> set.has(p.userId) && (allowOverride || !p.muted)).map(p=>p.userId);
}

