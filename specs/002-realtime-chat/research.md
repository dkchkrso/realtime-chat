# Research: Real-Time Chat Implementation

**Feature**: 002-realtime-chat  
**Date**: 2024-12-02  
**Status**: Phase 0 Complete

## Overview

This document resolves all technical uncertainties identified in the Technical Context section and establishes best practices for implementing a real-time chat application using Next.js 14, TypeScript, and Tailwind CSS with @theme configuration.

---

## Decision 1: WebSocket Library Selection

**Question**: Socket.io vs native WebSocket vs Pusher?

**Decision**: Native WebSocket API with custom implementation

**Rationale**:
- **Simplicity**: Native WebSocket support in both browser and Node.js eliminates third-party dependency
- **Next.js Compatibility**: Next.js 14 API routes support WebSocket upgrade via `socket` event on server response
- **No vendor lock-in**: Pusher requires external service and adds costs
- **Socket.io overhead**: Socket.io adds 60KB+ to bundle and includes features we don't need (rooms, namespaces, fallbacks to polling)
- **Performance**: Native WebSocket has minimal overhead and <1ms latency for message delivery
- **Constitution alignment**: "Simplicity First" principle favors native APIs over abstractions

**Implementation Pattern**:
```typescript
// Server: app/api/websocket/route.ts
export async function GET(request: Request) {
  const upgrade = request.headers.get('upgrade');
  if (upgrade !== 'websocket') return new Response('Expected WebSocket', { status: 426 });
  
  const { socket, response } = Deno.upgradeWebSocket(request);
  socket.onmessage = (event) => { /* handle messages */ };
  return response;
}

// Client: src/lib/websocket/client.ts
const ws = new WebSocket('ws://localhost:3000/api/websocket');
ws.onmessage = (event) => { /* handle messages */ };
```

**Alternatives Considered**:
- Socket.io: Too heavy, unnecessary features
- Pusher: External dependency, requires account, costs money
- Ably: Similar to Pusher, overkill for demo
- ws library: Good but unnecessary since native WebSocket works

**References**:
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Next.js 14 WebSocket support discussion](https://github.com/vercel/next.js/discussions/48427)

---

## Decision 2: Message Storage Solution

**Question**: In-memory vs SQLite vs PostgreSQL for message persistence?

**Decision**: SQLite with better-sqlite3

**Rationale**:
- **Persistence**: Requirement FR-030 requires survival of server restarts (rules out in-memory)
- **Simplicity**: SQLite is zero-config, single-file database (no external server needed)
- **Performance**: better-sqlite3 provides synchronous API with 100k+ inserts/sec capability
- **Scope-appropriate**: Demo site with 100 concurrent users doesn't need PostgreSQL's complexity
- **Constitution alignment**: Avoid over-engineering (PostgreSQL would be overkill)
- **Development experience**: No Docker/installation required, works immediately

**Schema Design**:
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_room_timestamp ON messages(room_id, timestamp DESC);

CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Data Lifecycle**:
- Keep last 1000 messages per room (FR-038)
- Archive messages older than 7 days (FR-037)
- Clean up empty rooms on startup (FR-039)

**Alternatives Considered**:
- **In-memory (Map/Set)**: Violates FR-030 persistence requirement
- **PostgreSQL**: Requires Docker/installation, overkill for demo scope
- **MongoDB**: NoSQL not needed, adds complexity
- **LocalStorage**: Browser-only, can't be shared across users

**References**:
- [better-sqlite3 documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite performance benchmarks](https://www.sqlite.org/speed.html)

---

## Decision 3: Tailwind @theme Configuration

**Question**: How to implement Tailwind CSS with @theme for color customization?

**Decision**: Use Tailwind CSS v4 @theme directive in globals.css

**Rationale**:
- **User requirement**: Explicitly requested "@theme for theme colours"
- **Modern approach**: Tailwind v4 introduces @theme as CSS-first configuration
- **Type safety**: Can generate TypeScript types from theme values
- **Hot reload**: Changes to @theme update immediately without rebuild
- **Semantic naming**: Define colors like `--color-primary` rather than arbitrary values

**Implementation**:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-secondary: #64748b;
  --color-accent: #8b5cf6;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-chat: #f1f5f9;
  
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  
  --color-border: #e2e8f0;
  --color-border-focus: #3b82f6;
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

@theme dark {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-chat: #334155;
  
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-muted: #94a3b8;
  
  --color-border: #334155;
}
```

**Usage in Components**:
```tsx
// Automatic via Tailwind utilities
<div className="bg-bg-primary text-text-primary border-border">
  <button className="bg-primary hover:bg-primary-hover">Send</button>
</div>
```

**Migration Note**: If Tailwind v4 is not stable yet, fall back to v3 with CSS variables:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        // ... map all theme colors
      }
    }
  }
}
```

**Alternatives Considered**:
- **Standard Tailwind colors**: User specifically requested @theme approach
- **CSS Modules**: Doesn't integrate with Tailwind's utility-first approach
- **Styled Components**: Violates constitution's requirement for Tailwind CSS
- **Inline styles**: Poor maintainability, no design system consistency

**References**:
- [Tailwind CSS v4 @theme documentation](https://tailwindcss.com/docs/theme)
- [CSS Custom Properties best practices](https://web.dev/css-custom-properties/)

---

## Best Practice 1: Next.js 14 Real-Time Patterns

**Context**: Next.js 14 App Router with Server Components and WebSocket integration

**Pattern**: Hybrid architecture with Server Components for initial load, Client Components for real-time

**Implementation**:
```typescript
// app/[roomId]/page.tsx (Server Component)
export default async function ChatRoomPage({ params }: { params: { roomId: string } }) {
  // Server-side fetch for initial messages (fast first paint)
  const initialMessages = await getRecentMessages(params.roomId);
  
  return <ChatRoom roomId={params.roomId} initialMessages={initialMessages} />;
}

// src/components/chat/ChatRoom.tsx (Client Component)
'use client';

export default function ChatRoom({ roomId, initialMessages }: Props) {
  const { messages, sendMessage } = useWebSocket(roomId, initialMessages);
  // Real-time updates via WebSocket
  return <MessageList messages={messages} />;
}
```

**Benefits**:
- Fast initial page load (Server Component with cached data)
- Progressive enhancement (works without JS, enhanced with WebSocket)
- SEO-friendly (messages rendered server-side)
- Automatic code splitting (Client Components bundled separately)

**References**:
- [Next.js Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)

---

## Best Practice 2: WebSocket Connection Management

**Context**: Handling connection lifecycle, reconnection, and offline queueing (FR-026 to FR-029)

**Pattern**: State machine with automatic reconnection and message queue

```typescript
// src/lib/websocket/client.ts
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

class ChatWebSocket {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private messageQueue: Message[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(roomId: string) {
    this.state = 'connecting';
    this.ws = new WebSocket(`ws://localhost:3000/api/websocket?room=${roomId}`);
    
    this.ws.onopen = () => {
      this.state = 'connected';
      this.flushMessageQueue(); // FR-029: Send queued messages
      this.reconnectAttempts = 0;
    };
    
    this.ws.onclose = () => {
      this.state = 'disconnected';
      this.attemptReconnect(); // FR-027: Auto-reconnect
    };
    
    this.ws.onerror = () => {
      console.error('[WebSocket] Connection error');
    };
  }
  
  sendMessage(message: Message) {
    if (this.state === 'connected' && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      // FR-028: Queue messages when disconnected
      this.messageQueue.push({ ...message, status: 'sending' });
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }
    
    this.state = 'reconnecting';
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    setTimeout(() => this.connect(this.roomId), delay);
  }
  
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.sendMessage(message);
    }
  }
}
```

**Connection States**:
- `connecting`: Initial connection establishment
- `connected`: Active WebSocket, messages sent immediately
- `disconnected`: Connection lost, queue messages locally
- `reconnecting`: Attempting to restore connection with exponential backoff

**UI Indicators** (FR-026):
```tsx
function ConnectionStatus({ state }: { state: ConnectionState }) {
  const config = {
    connecting: { color: 'bg-warning', text: 'Connecting...' },
    connected: { color: 'bg-success', text: 'Connected' },
    disconnected: { color: 'bg-error', text: 'Disconnected' },
    reconnecting: { color: 'bg-warning', text: 'Reconnecting...' },
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config[state].color}`} />
      <span className="text-sm text-text-secondary">{config[state].text}</span>
    </div>
  );
}
```

**References**:
- [WebSocket API: Connection lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#ready_state_constants)
- [Exponential backoff pattern](https://en.wikipedia.org/wiki/Exponential_backoff)

---

## Best Practice 3: Rate Limiting Implementation

**Context**: Prevent spam with 10 messages/minute limit per user (FR-025)

**Pattern**: Token bucket algorithm on client and server

**Client-side (UX)**:
```typescript
// src/hooks/useRateLimit.ts
export function useRateLimit(maxMessages = 10, windowMs = 60000) {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  
  const canSend = useCallback(() => {
    const now = Date.now();
    const recentMessages = timestamps.filter(t => now - t < windowMs);
    return recentMessages.length < maxMessages;
  }, [timestamps, maxMessages, windowMs]);
  
  const recordMessage = useCallback(() => {
    setTimestamps(prev => [...prev, Date.now()]);
  }, []);
  
  const remainingMessages = useMemo(() => {
    const now = Date.now();
    const recentMessages = timestamps.filter(t => now - t < windowMs);
    return maxMessages - recentMessages.length;
  }, [timestamps, maxMessages, windowMs]);
  
  return { canSend, recordMessage, remainingMessages };
}

// Usage in MessageInput component
function MessageInput() {
  const { canSend, recordMessage, remainingMessages } = useRateLimit();
  
  const handleSend = () => {
    if (!canSend()) {
      toast.error('Rate limit exceeded. Please wait before sending more messages.');
      return;
    }
    
    sendMessage(content);
    recordMessage();
  };
  
  return (
    <div>
      <input value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={handleSend} disabled={!canSend()}>
        Send {remainingMessages < 5 && `(${remainingMessages} left)`}
      </button>
    </div>
  );
}
```

**Server-side (Security)**:
```typescript
// src/lib/websocket/server.ts
const rateLimits = new Map<string, number[]>(); // sessionId -> timestamps

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimits.get(sessionId) || [];
  
  // Remove timestamps older than 1 minute
  const recentTimestamps = timestamps.filter(t => now - t < 60000);
  
  if (recentTimestamps.length >= 10) {
    return false; // Rate limit exceeded
  }
  
  recentTimestamps.push(now);
  rateLimits.set(sessionId, recentTimestamps);
  return true;
}

// In WebSocket message handler
socket.onmessage = (event) => {
  const sessionId = getSessionId(socket);
  
  if (!checkRateLimit(sessionId)) {
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Rate limit exceeded. Maximum 10 messages per minute.'
    }));
    return;
  }
  
  // Process message...
};
```

**References**:
- [Token bucket algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Rate limiting strategies](https://blog.logrocket.com/rate-limiting-node-js/)

---

## Best Practice 4: Profanity Filtering

**Context**: Block common offensive words (FR-031 to FR-033)

**Pattern**: Simple blocklist with exact and fuzzy matching

**Implementation**:
```typescript
// src/lib/profanity-filter.ts
const BLOCKED_WORDS = [
  'badword1', 'badword2', 'badword3',
  // Comprehensive list from external source
];

// Normalize text: lowercase, remove special chars, handle leetspeak
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't');
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  
  // Check exact word matches
  return BLOCKED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(normalized);
  });
}

export function filterMessage(text: string): { allowed: boolean; reason?: string } {
  if (containsProfanity(text)) {
    return {
      allowed: false,
      reason: 'Message contains inappropriate language. Please revise and try again.'
    };
  }
  
  return { allowed: true };
}

// Usage in message handler
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const filter = filterMessage(message.content);
  
  if (!filter.allowed) {
    socket.send(JSON.stringify({
      type: 'error',
      message: filter.reason
    }));
    return; // FR-033: Do not store or deliver
  }
  
  // Proceed with message...
};
```

**Alternatives Considered**:
- **External API (e.g., CleanSpeak)**: Adds network latency and external dependency
- **ML-based filtering**: Overkill for demo, requires training data
- **Regex patterns**: Less maintainable than word list

**References**:
- [bad-words npm package](https://www.npmjs.com/package/bad-words)
- [Content moderation best practices](https://www.eff.org/deeplinks/2019/04/content-moderation-broken-let-us-count-ways)

---

## Best Practice 5: TypeScript Type Safety

**Context**: Constitution requires strict TypeScript with no `any` types

**Pattern**: Discriminated unions for WebSocket messages, strict entity types

**Type Definitions**:
```typescript
// src/types/message.ts
export interface Message {
  id: string;
  roomId: string;
  senderName: string;
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'failed';
}

// src/types/websocket.ts
export type WebSocketMessage =
  | { type: 'chat_message'; payload: Message }
  | { type: 'user_joined'; payload: { userName: string; roomId: string } }
  | { type: 'user_left'; payload: { userName: string; roomId: string } }
  | { type: 'presence_update'; payload: { roomId: string; users: ActiveUser[] } }
  | { type: 'error'; payload: { message: string } }
  | { type: 'connection_ack'; payload: { sessionId: string } };

// Type guard for runtime validation
export function isWebSocketMessage(data: unknown): data is WebSocketMessage {
  if (typeof data !== 'object' || data === null) return false;
  if (!('type' in data) || !('payload' in data)) return false;
  
  const validTypes = ['chat_message', 'user_joined', 'user_left', 'presence_update', 'error', 'connection_ack'];
  return validTypes.includes((data as any).type);
}

// Usage
socket.onmessage = (event) => {
  const data: unknown = JSON.parse(event.data);
  
  if (!isWebSocketMessage(data)) {
    console.error('Invalid message format');
    return;
  }
  
  // TypeScript now knows data is WebSocketMessage
  switch (data.type) {
    case 'chat_message':
      handleChatMessage(data.payload); // payload is Message
      break;
    case 'user_joined':
      handleUserJoined(data.payload); // payload has userName and roomId
      break;
    // ... handle other types
  }
};
```

**Zod for Runtime Validation** (optional but recommended):
```typescript
import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().min(1).max(50),
  senderName: z.string().min(2).max(30),
  content: z.string().min(1).max(1000),
  timestamp: z.number().positive(),
});

export type Message = z.infer<typeof MessageSchema>;

// Validate incoming data
const result = MessageSchema.safeParse(data);
if (!result.success) {
  console.error('Validation error:', result.error);
  return;
}
const message: Message = result.data;
```

**References**:
- [TypeScript discriminated unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions)
- [Zod validation library](https://zod.dev/)

---

## Summary

All NEEDS CLARIFICATION items have been resolved:

1. ✅ **WebSocket Library**: Native WebSocket API (no external library)
2. ✅ **Storage Solution**: SQLite with better-sqlite3
3. ✅ **Tailwind @theme**: Tailwind v4 @theme directive in globals.css (or v3 with CSS variables fallback)

Best practices established for:
- Next.js 14 real-time patterns (Server + Client Components)
- WebSocket connection management (auto-reconnect, offline queue)
- Rate limiting (token bucket, client + server)
- Profanity filtering (blocklist with normalization)
- TypeScript type safety (discriminated unions, type guards)

**Next Steps**: Proceed to Phase 1 - Design & Contracts
