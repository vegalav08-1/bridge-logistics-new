import type { Chat, ChatId, ChatSettings, Message, Participant, Role } from './types';
import { sanitizeText } from './sanitize';

const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));

const CHATS: Record<string, Chat> = {};
const MSGS: Record<string, Message[]> = {};

function ensureChat(chatId:string){
  if(!CHATS[chatId]) {
    CHATS[chatId] = {
      id: chatId, orderId:`ORD_${chatId}`, title:`Chat ${chatId}`, visibility:'PRIVATE',
      participants:[
        { userId: 'user-1', role: 'ADMIN', joinedAtISO: new Date().toISOString(), displayName: 'Администратор' },
        { userId: 'user-2', role: 'USER', joinedAtISO: new Date().toISOString(), displayName: 'Клиент' }
      ], 
      settings:{ muteAll:false, allowMentionsOverride:true, allowExternalInvite:false }, 
      createdAtISO:new Date().toISOString()
    };
    MSGS[chatId] = [
      {
        id: 'msg-1',
        chatId,
        kind: 'text',
        text: 'Добро пожаловать в Chat V2! 🎉\n\nЗдесь вы можете:\n• Использовать @упоминания\n• Закреплять сообщения\n• Отправлять финансовые данные',
        authorId: 'user-1',
        createdAtISO: new Date(Date.now() - 300000).toISOString(),
        pinned: false
      },
      {
        id: 'msg-2',
        chatId,
        kind: 'text',
        text: 'Это тестовое сообщение от клиента. @Администратор, можете помочь с отгрузкой?',
        authorId: 'user-2',
        createdAtISO: new Date(Date.now() - 180000).toISOString(),
        mentions: [{ userId: 'user-1', from: 45, to: 58 }],
        pinned: false
      },
      {
        id: 'msg-3',
        chatId,
        kind: 'finance',
        text: 'Оплата за отгрузку',
        authorId: 'user-1',
        createdAtISO: new Date(Date.now() - 120000).toISOString(),
        finance: { sign: '+', amount: 2500, currency: 'RUB', note: 'Оплата за доставку' },
        pinned: false
      },
      {
        id: 'msg-4',
        chatId,
        kind: 'system',
        text: 'Статус отгрузки обновлен: В пути',
        authorId: 'system',
        createdAtISO: new Date(Date.now() - 60000).toISOString(),
        systemType: 'status',
        pinned: false
      }
    ];
  }
}

export async function fetchChat(chatId:ChatId): Promise<Chat> { 
  await wait(60); 
  ensureChat(chatId); 
  return structuredClone(CHATS[chatId]); 
}

export async function listMessages(chatId:ChatId, cursor?:string, limit=50): Promise<{items:Message[], next?:string}> {
  await wait(60); 
  ensureChat(chatId);
  const all = MSGS[chatId]; 
  const start = cursor ? Number(cursor) : 0;
  const slice = all.slice(start, start+limit);
  const next = start+limit < all.length ? String(start+limit) : undefined;
  return { items: structuredClone(slice), next };
}

export async function postMessage(input: Omit<Message,'id'|'createdAtISO'>): Promise<Message> {
  await wait(80); 
  ensureChat(input.chatId);
  const msg: Message = { 
    ...input, 
    id: crypto.randomUUID(), 
    createdAtISO:new Date().toISOString(), 
    text: sanitizeText(input.text || '') 
  };
  MSGS[input.chatId].unshift(msg);
  return structuredClone(msg);
}

export async function editMessage(messageId:string, patch:Partial<Message>): Promise<Message> {
  await wait(60);
  for (const chatId of Object.keys(MSGS)) {
    const idx = MSGS[chatId].findIndex(m=>m.id===messageId);
    if (idx>=0) { 
      MSGS[chatId][idx] = { ...MSGS[chatId][idx], ...patch, editedAtISO:new Date().toISOString() }; 
      return structuredClone(MSGS[chatId][idx]); 
    }
  }
  throw new Error('MESSAGE_NOT_FOUND');
}

export async function setChatSettings(chatId:ChatId, settings: Partial<ChatSettings>) {
  await wait(60); 
  ensureChat(chatId); 
  CHATS[chatId].settings = { ...CHATS[chatId].settings, ...settings }; 
  return structuredClone(CHATS[chatId].settings);
}

export async function addParticipant(chatId:ChatId, userId:string, role:Role, joinedAtISO=new Date().toISOString()): Promise<Participant> {
  await wait(40); 
  ensureChat(chatId);
  const ex = CHATS[chatId].participants.find(p=>p.userId===userId);
  const p: Participant = ex ? { ...ex, role } : { userId, role, joinedAtISO };
  CHATS[chatId].participants = [p, ...CHATS[chatId].participants.filter(x=>x.userId!==userId)];
  return structuredClone(p);
}

export async function setParticipantMute(chatId:ChatId, userId:string, muted:boolean) {
  await wait(40); 
  ensureChat(chatId);
  CHATS[chatId].participants = CHATS[chatId].participants.map(p=> p.userId===userId ? { ...p, muted } : p );
  return true;
}

export async function pinMessage(chatId:ChatId, messageId:string, pinned:boolean) {
  await wait(40);
  const m = MSGS[chatId]?.find(x=>x.id===messageId); 
  if (!m) throw new Error('MESSAGE_NOT_FOUND');
  m.pinned = pinned; 
  return true;
}



