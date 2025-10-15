// Простейшая EventTarget-шина для связи Composer ↔ MessageList (UI4)
export const chatBus = new EventTarget();

export type LocalTextPayload = {
  chatId: string;
  tempId: string;     // локальный id (для обновления статуса)
  text: string;
  createdAtISO: string;
};

export type LocalFilePayload = {
  chatId: string;
  tempId: string;
  file: File;
  createdAtISO: string;
};

export function emitLocalText(p: LocalTextPayload) {
  chatBus.dispatchEvent(new CustomEvent('local-text', { detail: p }));
}
export function emitLocalFile(p: LocalFilePayload) {
  chatBus.dispatchEvent(new CustomEvent('local-file', { detail: p }));
}

export function emitAck(params: { chatId: string; tempId: string; serverId: string; }) {
  chatBus.dispatchEvent(new CustomEvent('ack', { detail: params }));
}

export function emitFail(params: { chatId: string; tempId: string; error?: string; }) {
  chatBus.dispatchEvent(new CustomEvent('fail', { detail: params }));
}


