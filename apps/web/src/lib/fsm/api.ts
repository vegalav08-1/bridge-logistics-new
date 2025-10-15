import type { ReceivePartialInput, DeliverPartialInput, SplitInput, MergeAttachInput } from './schema';
import type { LinesState, ShipmentStatus } from './types';

const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));

export async function fetchLines(chatId: string): Promise<LinesState> {
  await wait(150);
  return { version: 1, items: [], remaining: 0, delivered: 0 };
}

export async function postTransition(chatId: string, key: string, payload: any, idempotencyKey: string): Promise<{ ok:true; version:number; status: ShipmentStatus; syscard:any }> {
  await wait(250);
  return { ok:true, version: Math.floor(Math.random()*1000), status: 'RECEIVE', syscard: { key, payload } as any };
}

export async function postReceivePartial(chatId: string, input: ReceivePartialInput, idem: string) {
  return postTransition(chatId, 'receive_partial', input, idem);
}

export async function postDeliverPartial(chatId: string, input: DeliverPartialInput, idem: string) {
  return postTransition(chatId, 'deliver_partial', input, idem);
}

export async function postSplit(chatId: string, input: SplitInput, idem: string): Promise<{ ok:true; newChatId:string; version:number; syscard:any }> {
  await wait(300);
  return { ok:true, newChatId: 'shp_'+Math.random().toString(36).slice(2), version: 1, syscard: { key:'split', payload: input } };
}

export async function postMergeAttach(chatId: string, input: MergeAttachInput, idem: string) {
  await wait(300);
  return { ok:true, version: 2, syscard: { key:'merge_attach', payload: input } };
}

export async function postMergeDetach(chatId: string, targetChatId: string, idem: string) {
  await wait(200);
  return { ok:true, version: 3, syscard: { key:'merge_detach', payload: { targetChatId } } };
}


