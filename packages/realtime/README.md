# @yp/realtime

Real-time WebSocket/SSE server with event bus, receipts, and typing indicators.

## Features

- WebSocket server with SSE fallback
- Event bus with Redis Pub/Sub support
- Message receipts (delivered/read)
- Typing indicators with auto-timeout
- Room-based subscriptions (chat/user)
- Authentication and RBAC
- Rate limiting and flood protection
- Metrics and observability

## Usage

```typescript
import { RealtimeServer } from '@yp/realtime/server';
import { EventBus } from '@yp/realtime/bus';

// Start server
const server = new RealtimeServer({
  port: 4040,
  redis: { host: 'localhost', port: 6379 }
});

// Publish events
const bus = new EventBus();
await bus.publish('chat:c_123', {
  type: 'message.created',
  data: { chatId: 'c_123', message: {...} }
});
```

## Configuration

Set environment variables:

```env
REDIS_URL=redis://localhost:6379
REALTIME_PORT=4040
JWT_SECRET=your-secret-key
```