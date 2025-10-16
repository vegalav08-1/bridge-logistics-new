type Msg = any;

class MockWS {
  static sockets: MockWS[] = [];
  onopen: (()=>void)|null = null;
  onclose: (()=>void)|null = null;
  onmessage: ((ev:{data:string})=>void)|null = null;
  readyState = 0; // 0-connecting, 1-open
  url: string;

  constructor(url: string) {
    this.url = url;
    setTimeout(()=>{ this.readyState=1; this.onopen && this.onopen(); }, 5);
    MockWS.sockets.push(this);
  }
  send(_data: string) {}
  close() { this.readyState=3; this.onclose && this.onclose(); }

  // тестовый helper: инжект события на клиента
  static pushServerEvent(obj: Msg) {
    for (const s of MockWS.sockets) s.onmessage && s.onmessage({ data: JSON.stringify(obj) });
  }
  // очистка
  static reset(){ MockWS.sockets.length=0; }
}

// Подменяем глобальный WebSocket
export function installWSMock(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    // @ts-ignore
    window.__MOCK_WS__ = true;
    // @ts-ignore
    window.WebSocket = class {
      constructor(url) { return new (window as any).__MockWS__(url); }
    };
    // хранилище экземпляров
    // @ts-ignore
    window.__MockWS__Class__ = (window as any).__MockWS__Class__ || null;
  });
}

// Экспорт для теста: проброс класса внутрь страницы
export async function exposeWS(page: import('@playwright/test').Page) {
  await page.exposeFunction('__registerMockWSClass', (klass: any) => {
    // noop on node side
  });
  await page.addInitScript(({ }) => {
    // класть класс в window, чтобы им управлять из тестов нельзя — поэтому создадим вспомогательные API через evaluate
  }, {});
}

// Утилиты для триггера событий из теста
export async function wsPush(page: import('@playwright/test').Page, payload: Msg) {
  await page.evaluate((obj) => {
    // @ts-ignore
    if (!window.__MockWS__) return;
    // хак: мы не держим класс снаружи, но можем хранить список сокетов в window
    // упростим: создадим на лету пул ивентов внутри стабов
    // @ts-ignore
    if (!window.__WSPOOL__) window.__WSPOOL__ = [];
    // @ts-ignore
    for (const s of (window as any).__WSPOOL__ ?? []) {
      s.onmessage && s.onmessage({ data: JSON.stringify(obj) });
    }
  }, payload);
}





