# @yp/realtime-client

Client library for real-time communication with WebSocket and SSE fallback.

## Features

- WebSocket connection with automatic reconnection
- SSE fallback for corporate proxies
- Message backfill after reconnection
- Offline queue for outgoing messages
- Typing indicators
- Delivery and read receipts
- Event subscription management

## Usage

```typescript
import { RealtimeClient } from '@yp/realtime-client';

const client = new RealtimeClient({
  baseUrl: 'https://api.example.com',
  token: 'your-jwt-token'
});

// Subscribe to events
client.on('message.created', (data) => {
  console.log('New message:', data);
});

// Connect and subscribe to rooms
await client.connect();
await client.subscribe(['chat:123', 'user:456']);

// Send typing indicator
await client.sendTyping('chat:123', 'start');

// Send acknowledgment
await client.sendAck('chat:123', 42, 'read');
```







