# Data Model: Real-Time Chat

**Feature**: 002-realtime-chat  
**Date**: 2024-12-02  
**Status**: Phase 1 Complete

## Overview

This document defines the data structures for the real-time chat application, including entities, their relationships, validation rules, and state transitions.

---

## Entity 1: Message

**Description**: Represents a single chat message sent by a user in a specific chat room.

**TypeScript Definition**:
```typescript
// src/types/message.ts
export interface Message {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Chat room this message belongs to */
  roomId: string;
  
  /** Display name of the user who sent the message */
  senderName: string;
  
  /** Message text content */
  content: string;
  
  /** Unix timestamp (milliseconds) when message was sent */
  timestamp: number;
  
  /** Message delivery status (client-side only) */
  status?: 'sending' | 'sent' | 'failed';
}

export type MessageStatus = 'sending' | 'sent' | 'failed';
```

**Validation Rules**:
- `id`: Required, UUID v4 format
- `roomId`: Required, 1-50 characters, must match existing room
- `senderName`: Required, 2-30 characters, alphanumeric + spaces
- `content`: Required, 1-1000 characters (FR-004)
- `timestamp`: Required, positive integer, server-authoritative
- `status`: Optional (client-side state tracking only)

**State Transitions**:
```
[Client sends message]
    ↓
status: 'sending' (queued locally)
    ↓
[WebSocket connected] → send to server
    ↓
status: 'sent' (server acknowledged)
    ↓
[Broadcast to all users] → display in chat

[Connection lost]
    ↓
status: 'sending' (remains queued)
    ↓
[Reconnect] → retry send
    ↓
status: 'sent' or 'failed'
```

**Database Schema** (SQLite):
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK(length(content) <= 1000),
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_room_timestamp ON messages(room_id, timestamp DESC);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Related Requirements**: FR-001, FR-002, FR-004, FR-005, FR-007, FR-030, FR-037, FR-038

---

## Entity 2: Chat Room

**Description**: Represents a user-created conversation space where messages are exchanged.

**TypeScript Definition**:
```typescript
// src/types/room.ts
export interface ChatRoom {
  /** Unique identifier (slug format: lowercase, hyphens) */
  id: string;
  
  /** Human-readable room name */
  name: string;
  
  /** Unix timestamp (milliseconds) when room was created */
  createdAt: number;
  
  /** Number of messages in this room */
  messageCount: number;
  
  /** Number of users currently active in this room */
  activeUserCount: number;
}

export interface RoomWithMessages extends ChatRoom {
  /** Recent messages (last 50) */
  messages: Message[];
}
```

**Validation Rules**:
- `id`: Required, unique, slug format (e.g., "general-chat", "tech-talk")
- `name`: Required, 3-50 characters, alphanumeric + spaces (FR-014)
- `createdAt`: Required, positive integer, set on creation
- `messageCount`: Computed field (count of messages)
- `activeUserCount`: Computed field (count of active users)

**State Transitions**:
```
[User creates room]
    ↓
Room created with messageCount=0, activeUserCount=0
    ↓
[Users join] → activeUserCount increments
    ↓
[Messages sent] → messageCount increments
    ↓
[Users leave] → activeUserCount decrements
    ↓
[Room empty + no messages] → cleanup/delete (FR-039)
```

**Database Schema** (SQLite):
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK(length(name) >= 3 AND length(name) <= 50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_name ON rooms(name);
```

**Lifecycle Rules**:
- Persist if `messageCount > 0` (FR-016)
- Delete if `messageCount = 0` after 24 hours of inactivity
- Archive old messages (keep last 1000, FR-038)

**Related Requirements**: FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-039

---

## Entity 3: User Session

**Description**: Represents an active user connection to the chat application.

**TypeScript Definition**:
```typescript
// src/types/session.ts
export interface UserSession {
  /** Unique session identifier (UUID v4) */
  sessionId: string;
  
  /** User's chosen display name */
  displayName: string;
  
  /** Current chat room user is in */
  currentRoomId: string | null;
  
  /** WebSocket connection status */
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  
  /** Unix timestamp when session was created */
  createdAt: number;
  
  /** Unix timestamp of last activity (for timeout detection) */
  lastActiveAt: number;
  
  /** WebSocket instance (client-side only) */
  socket?: WebSocket;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
```

**Validation Rules**:
- `sessionId`: Required, UUID v4, generated on first connection
- `displayName`: Required, 2-30 characters, unique within room (FR-010, FR-011)
- `currentRoomId`: Optional (null when not in a room)
- `connectionStatus`: Required, one of defined statuses
- `createdAt`: Required, set on session creation
- `lastActiveAt`: Required, updated on each message/activity

**State Transitions**:
```
[User opens app]
    ↓
connectionStatus: 'connecting'
    ↓
[WebSocket established]
    ↓
connectionStatus: 'connected'
    ↓
[User joins room] → currentRoomId = roomId
    ↓
[Connection lost]
    ↓
connectionStatus: 'disconnected'
    ↓
[Auto-reconnect attempt]
    ↓
connectionStatus: 'reconnecting'
    ↓
[Success] → 'connected' | [Fail] → 'disconnected'
```

**Session Timeout**:
- Inactive for 5 minutes → mark as inactive
- Connection lost + 30 seconds → remove from active users (FR-022)

**Storage**: In-memory only (ephemeral, no persistence needed)

**Related Requirements**: FR-008, FR-009, FR-010, FR-011, FR-012, FR-026, FR-027

---

## Entity 4: Active User

**Description**: Represents a user's presence in a specific chat room.

**TypeScript Definition**:
```typescript
// src/types/presence.ts
export interface ActiveUser {
  /** User's display name */
  userName: string;
  
  /** Session identifier */
  sessionId: string;
  
  /** Chat room the user is active in */
  roomId: string;
  
  /** Unix timestamp when user joined this room */
  joinedAt: number;
  
  /** Unix timestamp of last activity in this room */
  lastActiveAt: number;
}

export interface RoomPresence {
  /** Chat room identifier */
  roomId: string;
  
  /** List of users currently in this room */
  users: ActiveUser[];
  
  /** Total count of active users */
  count: number;
}
```

**Validation Rules**:
- `userName`: Required, must match session's displayName
- `sessionId`: Required, must match active session
- `roomId`: Required, must match existing room
- `joinedAt`: Required, set when user joins room
- `lastActiveAt`: Required, updated on each message/activity

**State Transitions**:
```
[User joins room]
    ↓
ActiveUser created with joinedAt = now, lastActiveAt = now
    ↓
[User sends message] → lastActiveAt = now
    ↓
[User switches room]
    ↓
ActiveUser removed from old room, created in new room
    ↓
[User closes browser / connection lost]
    ↓
ActiveUser removed within 5 seconds (FR-022)
```

**Cleanup Rules**:
- Remove if `lastActiveAt` older than 5 seconds and connection lost
- Remove immediately on explicit disconnect
- Broadcast presence updates to all users in room

**Storage**: In-memory Map structure:
```typescript
// Server-side: src/lib/websocket/server.ts
const activeUsers = new Map<string, Map<string, ActiveUser>>();
// Structure: roomId -> (sessionId -> ActiveUser)
```

**Related Requirements**: FR-020, FR-021, FR-022, FR-023

---

## Relationships

### Message → Chat Room (Many-to-One)
- Each message belongs to exactly one chat room
- One chat room can have many messages (up to 1000 active, FR-038)
- Cascade delete: If room deleted, all messages deleted

### Message → User Session (Many-to-One, ephemeral)
- Each message is sent by one user session (via `senderName`)
- No foreign key (sessions are ephemeral)
- Display name stored in message for persistence

### Active User → Chat Room (Many-to-One)
- Each active user is in exactly one chat room at a time
- One chat room can have many active users
- No persistence (in-memory only)

### Active User → User Session (One-to-One)
- Each active user corresponds to one user session
- One user session can be one active user (in one room)
- Joined by `sessionId`

**Entity Relationship Diagram**:
```
┌─────────────────┐         ┌─────────────────┐
│   UserSession   │         │    ChatRoom     │
│─────────────────│         │─────────────────│
│ sessionId (PK)  │         │ id (PK)         │
│ displayName     │         │ name            │
│ currentRoomId   │         │ createdAt       │
│ connectionStatus│         │ messageCount    │
│ createdAt       │         │ activeUserCount │
│ lastActiveAt    │         └─────────────────┘
└─────────────────┘                 │
         │                           │
         │                           │
         │                           │ 1
         │                           │
         │                           │ *
         │                  ┌─────────────────┐
         │                  │     Message     │
         │                  │─────────────────│
         │                  │ id (PK)         │
         │                  │ roomId (FK)     │
         │                  │ senderName      │
         │                  │ content         │
         │                  │ timestamp       │
         │                  │ status          │
         │                  └─────────────────┘
         │
         │ 1
         │
         │ 1
         │
┌─────────────────┐
│   ActiveUser    │
│─────────────────│
│ sessionId (FK)  │
│ userName        │
│ roomId (FK)     │
│ joinedAt        │
│ lastActiveAt    │
└─────────────────┘
```

---

## Data Access Patterns

### Pattern 1: Load Chat Room with Recent Messages
```typescript
// GET /api/rooms/[roomId]
// Server Component initial load (FR-018)

interface RoomData {
  room: ChatRoom;
  messages: Message[];  // Last 50
  activeUsers: ActiveUser[];
}

async function getRoomData(roomId: string): Promise<RoomData> {
  const room = await db
    .select()
    .from(rooms)
    .where({ id: roomId })
    .first();
  
  const messages = await db
    .select()
    .from(messages)
    .where({ room_id: roomId })
    .orderBy({ timestamp: 'desc' })
    .limit(50);
  
  const activeUsers = getActiveUsersInRoom(roomId); // In-memory
  
  return { room, messages, activeUsers };
}
```

### Pattern 2: Send Message
```typescript
// WebSocket: 'chat_message' event

async function handleChatMessage(
  sessionId: string,
  roomId: string,
  content: string
): Promise<Message> {
  const session = getSession(sessionId);
  
  // Validate (FR-031, FR-032, FR-033)
  const filter = filterMessage(content);
  if (!filter.allowed) {
    throw new Error(filter.reason);
  }
  
  // Create message
  const message: Message = {
    id: crypto.randomUUID(),
    roomId,
    senderName: session.displayName,
    content,
    timestamp: Date.now(),
  };
  
  // Persist (FR-030)
  await db.insert(messages).values(message);
  
  // Broadcast to all users in room (FR-001)
  broadcastToRoom(roomId, {
    type: 'chat_message',
    payload: message,
  });
  
  return message;
}
```

### Pattern 3: User Joins Room
```typescript
// WebSocket: 'join_room' event

async function handleJoinRoom(
  sessionId: string,
  roomId: string
): Promise<void> {
  const session = getSession(sessionId);
  
  // Update session
  session.currentRoomId = roomId;
  session.lastActiveAt = Date.now();
  
  // Add to active users (FR-021)
  const activeUser: ActiveUser = {
    userName: session.displayName,
    sessionId,
    roomId,
    joinedAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  
  addActiveUser(roomId, activeUser);
  
  // Broadcast presence update (FR-020)
  broadcastToRoom(roomId, {
    type: 'user_joined',
    payload: { userName: session.displayName, roomId },
  });
  
  broadcastToRoom(roomId, {
    type: 'presence_update',
    payload: {
      roomId,
      users: getActiveUsersInRoom(roomId),
    },
  });
}
```

### Pattern 4: Cleanup Old Messages
```typescript
// Background job: runs daily (FR-037, FR-038)

async function cleanupOldMessages(): Promise<void> {
  // Archive messages older than 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  await db
    .delete(messages)
    .where('timestamp < ?', sevenDaysAgo);
  
  // Keep only last 1000 messages per room
  const rooms = await db.select('id').from(rooms);
  
  for (const room of rooms) {
    const oldMessages = await db
      .select('id')
      .from(messages)
      .where({ room_id: room.id })
      .orderBy({ timestamp: 'desc' })
      .offset(1000);
    
    if (oldMessages.length > 0) {
      await db
        .delete(messages)
        .where('id IN (?)', oldMessages.map(m => m.id));
    }
  }
  
  // Delete empty rooms (FR-039)
  await db
    .delete(rooms)
    .where('id NOT IN (SELECT DISTINCT room_id FROM messages)');
}
```

---

## Summary

**Entities Defined**: 4 (Message, Chat Room, User Session, Active User)  
**Persistent Storage**: SQLite for Message and Chat Room  
**Ephemeral Storage**: In-memory for User Session and Active User  
**Total TypeScript Interfaces**: 8  
**Database Tables**: 2 (messages, rooms)  
**Indexes**: 4 (optimized for common queries)

All functional requirements addressed through data model design.
