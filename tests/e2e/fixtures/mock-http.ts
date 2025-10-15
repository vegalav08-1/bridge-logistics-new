import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  // список отгрузок
  http.get('*/api/shipments', ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') ?? '0';
    const cur = parseInt(cursor, 10);
    const pageSize = 20;
    const items = Array.from({length: pageSize}).map((_,i)=>({
      id:`id_${cur+i}`, kind: (i%5===0?'REQUEST':'SHIPMENT'),
      number:`BR-${String(cur+i).padStart(6,'0')}`,
      status:['NEW','RECEIVE','RECONCILE','PACK','IN_TRANSIT','ON_DELIVERY','DELIVERED'][i%7],
      createdAtISO:new Date(Date.now()- (i+cur)*86400000).toISOString(),
      updatedAtISO:new Date(Date.now()- (i+cur)*3600000).toISOString(),
      unreadCount:(i%3===0)?(i%6):0, ownerName:`Client ${i}`, partnerName:`Admin ${i}`,
      financeBadge: i%4===0?'debt':'ok'
    }));
    const nextCursor = cur + pageSize >= 60 ? undefined : String(cur+pageSize);
    return HttpResponse.json({ items, nextCursor });
  }),

  // чат — список сообщений
  http.get('*/api/chats/:chatId/messages', ({ params, request }) => {
    const url = new URL(request.url);
    const prev = url.searchParams.get('prevCursor');
    const base = prev ? parseInt(prev, 10) : 0;
    const pageSize = 20;
    const items = Array.from({length: pageSize}).map((_,i)=>{
      const idx = base+i;
      if (idx % 5 === 0) return {
        id:`att_${idx}`, kind:'attachment', chatId: params.chatId,
        createdAtISO: new Date(Date.now()-idx*60000).toISOString(),
        authorId:'u2', authorName:'Operator', isMine:false,
        attachment:{ id:`file_${idx}`, name:`photo-${idx}.jpg`, size:123000, mime:'image/jpeg' }
      };
      return {
        id:`msg_${idx}`, kind:'text', chatId: params.chatId,
        createdAtISO: new Date(Date.now()-idx*60000).toISOString(),
        authorId: idx%2?'me':'u2', authorName: idx%2?'Me':'Operator', isMine: !!(idx%2),
        text: `Сообщение ${idx}`
      };
    });
    const next = base + pageSize >= 120 ? undefined : String(base + pageSize);
    return HttpResponse.json({ items, prevCursor: next });
  }),

  // отправка текст/файл
  http.post('*/api/chats/:chatId/messages', async ({ request }) => {
    const body:any = await request.json();
    return HttpResponse.json({ serverId: 'srv_'+Math.random().toString(36).slice(2), ...body });
  }),
  http.post('*/api/chats/:chatId/upload', async () => {
    return HttpResponse.json({ serverId: 'srv_'+Math.random().toString(36).slice(2) });
  }),

  // уведомления
  http.get('*/api/notifications', () => {
    return HttpResponse.json([
      { id:'n1', kind:'chat_message', title:'Новое сообщение', link:'/chat/demo', createdAtISO:new Date().toISOString(), read:false },
    ]);
  }),
  http.post('*/api/notifications/:id/read', () => HttpResponse.json({ ok:true })),
  http.post('*/api/notifications/read-all', () => HttpResponse.json({ ok:true })),

  // viewer
  http.get('*/api/attachments/:id', ({ params }) => {
    const isPdf = String(params.id).includes('pdf');
    return HttpResponse.json({
      id: params.id, name: isPdf ? 'doc.pdf' : 'photo.jpg',
      mime: isPdf ? 'application/pdf' : 'image/jpeg',
      size: 350000,
      url: isPdf ? 'https://example.com/dummy.pdf' : 'https://picsum.photos/1200/800',
      kind: isPdf ? 'pdf' : 'image',
      versions: [
        { id: 'v3', createdAtISO: new Date().toISOString(), author: 'Operator', note: 'current', url: isPdf ? 'https://example.com/dummy.pdf' : 'https://picsum.photos/1200/800' }
      ]
    });
  }),
);

export function startHttpMock() {
  server.listen({ onUnhandledRequest: 'bypass' });
}
export function stopHttpMock() {
  server.close();
}


