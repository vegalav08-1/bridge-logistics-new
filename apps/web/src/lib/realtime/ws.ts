type Listener = (e: any) => void;

type Options = {
  url: string;                      // wss://host/ws
  getToken: () => Promise<string>;  // получить актуальный JWT/токен
  log?: boolean;
};

export class RTClient {
  private socket?: WebSocket;
  private opts: Options;
  private connected = false;
  private manualClose = false;
  private reconnectAttempts = 0;
  private pingTimer?: any;
  private listeners: Map<string, Set<Listener>> = new Map();
  private pendingSubs: { topic: string; id?: string }[] = [];

  constructor(opts: Options) { this.opts = opts; }

  async connect() {
    this.manualClose = false;
    const token = await this.opts.getToken();
    const url = `${this.opts.url}?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.log('open');
      // восстановить подписки
      this.pendingSubs.forEach(s => this.send({ type: 'subscribe', data: s }));
      // heartbeat
      this.startHeartbeat();
      this.emit('open', {});
    };

    this.socket.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        this.emit('message', msg);
      } catch (e) { this.log('parse err', e); }
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.log('close');
      this.emit('close', {});
      this.stopHeartbeat();
      if (!this.manualClose) this.scheduleReconnect();
    };

    this.socket.onerror = (e) => {
      this.log('error', e);
    };
  }

  private scheduleReconnect() {
    const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts++)); // 1s,2s,4s..30s
    setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.connected) this.send({ type: 'ping' });
    }, 15000);
  }
  private stopHeartbeat() { if (this.pingTimer) clearInterval(this.pingTimer); }

  async close() {
    this.manualClose = true;
    this.stopHeartbeat();
    this.socket?.close();
  }

  send(msg: any) {
    const raw = JSON.stringify(msg);
    if (this.socket && this.connected && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(raw);
    } else {
      this.log('send queued/dropped', raw);
    }
  }

  subscribe(topic: string, id?: string) {
    const sub = { topic, id };
    this.pendingSubs.push(sub);
    if (this.connected) this.send({ type: 'subscribe', data: sub });
  }
  unsubscribe(topic: string, id?: string) {
    this.pendingSubs = this.pendingSubs.filter(s => !(s.topic === topic && s.id === id));
    if (this.connected) this.send({ type: 'unsubscribe', data: { topic, id } });
  }

  on(event: 'open'|'close'|'message', cb: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)!.delete(cb);
  }

  private emit(event: string, payload: any) {
    this.listeners.get(event)?.forEach(cb => cb(payload));
  }

  private log(...args: any[]) { if (this.opts.log) console.log('[RT]', ...args); }
}


