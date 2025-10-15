const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function apiSendText(chatId: string, text: string): Promise<{ serverId: string }> {
  // TODO: заменить на fetch POST /api/chats/:id/messages
  await wait(300);
  return { serverId: 'srv_' + Math.random().toString(36).slice(2) };
}

export async function apiUploadFile(chatId: string, blob: Blob, fileName: string, mime: string): Promise<{ serverId: string }> {
  // TODO: заменить на реальный upload (multipart/form-data, s3 url и пр.)
  await wait(800);
  return { serverId: 'srv_' + Math.random().toString(36).slice(2) };
}


