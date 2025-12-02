# WebSocket Events Contract

**Feature**: 002-realtime-chat  
**Date**: 2024-12-02  
**WebSocket URL**: `ws://localhost:3000/api/websocket`

## Connection

### Establishing Connection

**Client initiates**:
```javascript
const ws = new WebSocket('ws://localhost:3000/api/websocket?room=general&userName=Alice');
```

**Query Parameters**:
- `room`: Room ID to join (required)
- `userName`: Display name (required, 2-30 characters)

**Server response** (on successful connection):
```json
{
  "type": "connection_ack",
  "payload": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "Alice",
    "roomId": "general",
    "timestamp": 1733166200000
  }
}
```

**Server response** (on error):
```json
{
  "type": "error",
  "payload": {
    "message": "Invalid display name: must be between 2 and 30 characters",
    "code": "INVALID_USERNAME"
  }
}
```

---

## Client → Server Events

### 1. Send Chat Message

**Event**: `chat_message`

**Description**: User sends a message to the current chat room.

**Payload**:
```json
{
  "type": "chat_message",
  "payload": {
    "content": "Hello everyone!",
    "timestamp": 1733166250000
  }
}
```

**Fields**:
- `content`: Message text (1-1000 characters)
- `timestamp`: Client timestamp (milliseconds)

**Server Response** (Success):
```json
{
  "type": "message_sent",
  "payload": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "roomId": "general",
    "senderName": "Alice",
    "content": "Hello everyone!",
    "timestamp": 1733166250100,
    "status": "sent"
  }
}
```

**Server Response** (Error - Profanity):
```json
{
  "type": "error",
  "payload": {
    "message": "Message contains inappropriate language. Please revise and try again.",
    "code": "PROFANITY_DETECTED"
  }
}
```

**Server Response** (Error - Rate Limit):
```json
{
  "type": "error",
  "payload": {
    "message": "Rate limit exceeded. Maximum 10 messages per minute.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 45000
  }
}
```

**Related Requirements**: FR-001, FR-002, FR-003, FR-025, FR-031, FR-032

---

### 2. Heartbeat / Keep-Alive

**Event**: `ping`

**Description**: Client sends periodic heartbeat to maintain connection and update lastActiveAt.

**Payload**:
```json
{
  "type": "ping",
  "payload": {
    "timestamp": 1733166300000
  }
}
```

**Server Response**:
```json
{
  "type": "pong",
  "payload": {
    "timestamp": 1733166300050
  }
}
```

**Frequency**: Every 30 seconds (recommended)

---

### 3. Switch Room

**Event**: `switch_room`

**Description**: User leaves current room and joins a different room.

**Payload**:
```json
{
  "type": "switch_room",
  "payload": {
    "roomId": "tech-talk",
    "timestamp": 1733166350000
  }
}
```

**Server Response** (Success):
```json
{
  "type": "room_switched",
  "payload": {
    "previousRoom": "general",
    "newRoom": "tech-talk",
    "timestamp": 1733166350100
  }
}
```

**Related Requirements**: FR-017

---

### 4. Typing Indicator (Optional - Not in MVP)

**Event**: `typing_start` / `typing_stop`

**Description**: Notify other users when someone is typing (future enhancement).

**Payload**:
```json
{
  "type": "typing_start",
  "payload": {
    "roomId": "general",
    "timestamp": 1733166400000
  }
}
```

---

## Server → Client Events

### 1. Broadcast Chat Message

**Event**: `chat_message`

**Description**: Server broadcasts a new message to all users in the room.

**Payload**:
```json
{
  "type": "chat_message",
  "payload": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "roomId": "general",
    "senderName": "Bob",
    "content": "Hello Alice!",
    "timestamp": 1733166450000
  }
}
```

**Related Requirements**: FR-001, FR-002, FR-007

---

### 2. User Joined

**Event**: `user_joined`

**Description**: Notify all users in a room when a new user joins.

**Payload**:
```json
{
  "type": "user_joined",
  "payload": {
    "userName": "Charlie",
    "roomId": "general",
    "timestamp": 1733166500000
  }
}
```

**Related Requirements**: FR-021

---

### 3. User Left

**Event**: `user_left`

**Description**: Notify all users in a room when a user leaves or disconnects.

**Payload**:
```json
{
  "type": "user_left",
  "payload": {
    "userName": "Charlie",
    "roomId": "general",
    "timestamp": 1733166550000
  }
}
```

**Related Requirements**: FR-022

---

### 4. Presence Update

**Event**: `presence_update`

**Description**: Broadcast updated list of active users in the room.

**Payload**:
```json
{
  "type": "presence_update",
  "payload": {
    "roomId": "general",
    "users": [
      {
        "userName": "Alice",
        "sessionId": "session-123",
        "joinedAt": 1733165900000,
        "lastActiveAt": 1733166600000
      },
      {
        "userName": "Bob",
        "sessionId": "session-456",
        "joinedAt": 1733165950000,
        "lastActiveAt": 1733166590000
      }
    ],
    "count": 2,
    "timestamp": 1733166600000
  }
}
```

**Frequency**: Sent on user join/leave events

**Related Requirements**: FR-020, FR-023

---

### 5. Connection Status

**Event**: `connection_status`

**Description**: Server notifies client about connection state changes.

**Payload**:
```json
{
  "type": "connection_status",
  "payload": {
    "status": "connected",
    "message": "Successfully connected to chat server",
    "timestamp": 1733166650000
  }
}
```

**Status Values**:
- `connected`: Connection established
- `disconnected`: Connection lost
- `reconnecting`: Attempting to reconnect

**Related Requirements**: FR-026, FR-027

---

### 6. Error

**Event**: `error`

**Description**: Server sends error messages to client.

**Payload**:
```json
{
  "type": "error",
  "payload": {
    "message": "An error occurred processing your request",
    "code": "INTERNAL_ERROR",
    "timestamp": 1733166700000
  }
}
```

**Error Codes**:
- `INVALID_USERNAME`: Display name validation failed
- `PROFANITY_DETECTED`: Message contains blocked words
- `RATE_LIMIT_EXCEEDED`: Too many messages sent
- `ROOM_NOT_FOUND`: Requested room doesn't exist
- `INTERNAL_ERROR`: Server error

---

## Message Format

### Base Structure

All WebSocket messages follow this discriminated union structure:

```typescript
type WebSocketMessage =
  | { type: 'connection_ack'; payload: ConnectionAckPayload }
  | { type: 'chat_message'; payload: ChatMessagePayload }
  | { type: 'message_sent'; payload: MessageSentPayload }
  | { type: 'user_joined'; payload: UserEventPayload }
  | { type: 'user_left'; payload: UserEventPayload }
  | { type: 'presence_update'; payload: PresenceUpdatePayload }
  | { type: 'connection_status'; payload: ConnectionStatusPayload }
  | { type: 'error'; payload: ErrorPayload }
  | { type: 'ping'; payload: PingPayload }
  | { type: 'pong'; payload: PongPayload }
  | { type: 'switch_room'; payload: SwitchRoomPayload }
  | { type: 'room_switched'; payload: RoomSwitchedPayload };
```

### Payload Types

```typescript
interface ConnectionAckPayload {
  sessionId: string;
  userName: string;
  roomId: string;
  timestamp: number;
}

interface ChatMessagePayload {
  id: string;
  roomId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

interface MessageSentPayload extends ChatMessagePayload {
  status: 'sent';
}

interface UserEventPayload {
  userName: string;
  roomId: string;
  timestamp: number;
}

interface PresenceUpdatePayload {
  roomId: string;
  users: ActiveUser[];
  count: number;
  timestamp: number;
}

interface ConnectionStatusPayload {
  status: 'connected' | 'disconnected' | 'reconnecting';
  message: string;
  timestamp: number;
}

interface ErrorPayload {
  message: string;
  code: string;
  timestamp?: number;
  retryAfter?: number;  // milliseconds
}

interface PingPayload {
  timestamp: number;
}

interface PongPayload {
  timestamp: number;
}

interface SwitchRoomPayload {
  roomId: string;
  timestamp: number;
}

interface RoomSwitchedPayload {
  previousRoom: string;
  newRoom: string;
  timestamp: number;
}
```

---

## Connection Lifecycle

```
1. Client opens WebSocket connection
   ws://localhost:3000/api/websocket?room=general&userName=Alice
   
2. Server validates parameters
   - Check userName length (2-30 chars)
   - Check room exists or create it
   - Assign sessionId
   
3. Server sends connection_ack
   
4. Server broadcasts user_joined to room
   
5. Server sends presence_update to all users
   
6. Client can now send/receive messages
   
7. Client sends ping every 30 seconds
   Server responds with pong
   
8. Client closes connection or connection lost
   
9. Server broadcasts user_left to room
   
10. Server sends presence_update to remaining users
```

---

## Error Handling

### Client-Side Reconnection Strategy

```typescript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function handleDisconnect() {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('Max reconnect attempts reached');
    return;
  }
  
  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
  
  setTimeout(() => {
    connectWebSocket();
  }, delay);
}

ws.onclose = handleDisconnect;
ws.onerror = handleDisconnect;
```

### Message Queueing (Offline)

```typescript
const messageQueue: Message[] = [];

function sendMessage(content: string) {
  const message = {
    type: 'chat_message',
    payload: { content, timestamp: Date.now() }
  };
  
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    // Queue for later (FR-028)
    messageQueue.push({ ...message, status: 'sending' });
  }
}

ws.onopen = () => {
  // Flush queue (FR-029)
  while (messageQueue.length > 0) {
    const message = messageQueue.shift()!;
    ws.send(JSON.stringify(message));
  }
};
```

**Related Requirements**: FR-027, FR-028, FR-029

---

## Performance Considerations

### Message Delivery Latency
- Target: <1 second (FR-001)
- Server processes messages synchronously
- Broadcast uses efficient room-based subscriptions

### Connection Limits
- Support 100 concurrent connections (FR-024)
- Each connection subscribes to 1 room at a time
- Server tracks active connections in-memory

### Bandwidth Optimization
- JSON messages are compact (avg 200 bytes)
- No compression for simplicity (demo scope)
- Heartbeat only every 30 seconds

---

## Security

### Input Validation
- All message content validated server-side
- Display names sanitized (alphanumeric + spaces only)
- Room names sanitized (slug format)

### Rate Limiting
- 10 messages per minute per session (FR-025)
- Tracked server-side with token bucket algorithm
- Client-side UI reflects remaining quota

### Content Moderation
- Profanity filter applied to all messages (FR-031)
- Blocked messages not stored or delivered (FR-033)
- User receives clear error message (FR-032)

---

## Testing Checklist

- [ ] Connection establishment with valid parameters
- [ ] Connection rejection with invalid username
- [ ] Send message and receive broadcast
- [ ] Profanity filter blocks offensive messages
- [ ] Rate limit prevents spam
- [ ] User join/leave events broadcast correctly
- [ ] Presence list updates in real-time
- [ ] Reconnection after disconnect
- [ ] Message queue during offline period
- [ ] Heartbeat keeps connection alive

---

## Next Steps

See `rest-api.md` for HTTP endpoint contracts.
