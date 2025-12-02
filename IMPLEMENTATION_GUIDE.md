# Implementation Guide: Real-Time Chat Website

**Feature**: 002-realtime-chat  
**Status**: Ready for Implementation  
**Date**: 2025-12-02

## ✅ Checklist Status

All specification checklists are complete and validated:

| Checklist | Total | Completed | Incomplete | Status |
|-----------|-------|-----------|------------|--------|
| requirements.md | 16 | 16 | 0 | ✓ PASS |

## 📋 Project Overview

Build a real-time chat website using Next.js 14, TypeScript, native WebSocket, SQLite, and Tailwind CSS. Users can create chat rooms, send instant messages, identify themselves with display names, and see active users - all without authentication.

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3+ with @theme directive
- **Real-time**: Native WebSocket API
- **Database**: SQLite with better-sqlite3
- **Target**: 100 concurrent users, <1s message latency

## 🎯 User Stories (Priority Order)

### P1: Send and Receive Messages (MVP)
Users can send messages in a chat room and see them appear instantly in real-time for all participants.

**Validation**: Open two browsers, send message from one, verify appears in both within 1 second.

### P2: Create and Join Chat Rooms
Users can view existing rooms, create new rooms, join rooms, and see message history.

**Validation**: Access homepage, create "Test Room", verify it appears in list, click room, verify loads with messages.

### P3: Identify Users
Users provide display names that appear alongside their messages for identification.

**Validation**: Enter username "Alice", send message, verify "Alice" appears next to message.

### P4: See Active Users
Users see a list of other users currently online in the chat room.

**Validation**: Open two browsers with different usernames, verify both see each other in active users list.

## 📂 Project Structure

```
app/
  layout.tsx                    # Root layout
  globals.css                   # Tailwind with @theme
  (chat)/
    page.tsx                   # Homepage with room list
    layout.tsx                 # Chat layout wrapper
    [roomId]/page.tsx          # Chat room page
  api/
    rooms/route.ts             # GET/POST rooms
    rooms/[roomId]/route.ts    # GET room details
    websocket/route.ts         # WebSocket upgrade handler

src/
  components/
    chat/
      MessageList.tsx          # Display messages with sender/timestamp
      MessageInput.tsx         # Send message input with Enter key
      ChatRoom.tsx             # Container integrating WebSocket + messages
      UserNamePrompt.tsx       # Display name prompt modal
      UserPresence.tsx         # Active users list
    rooms/
      RoomList.tsx             # List of available rooms
      CreateRoom.tsx           # Room creation form
    ui/
      ConnectionStatus.tsx     # Online/offline indicator
      Button.tsx               # Shared button component
  
  lib/
    websocket/
      server.ts                # Server WebSocket handler
      client.ts                # Client WebSocket manager
    storage/
      database.ts              # SQLite initialization
      messages.ts              # Message CRUD operations
      rooms.ts                 # Room CRUD operations
    profanity-filter.ts        # Blocklist filtering
    rate-limiter.ts            # 10 msg/min enforcement
    logger.ts                  # Structured logging
    utils.ts                   # Utilities (timestamp, slugs)
  
  types/
    message.ts                 # Message interface
    room.ts                    # ChatRoom interface
    session.ts                 # UserSession, ActiveUser interfaces
    websocket.ts               # WebSocket message types
  
  hooks/
    useWebSocket.ts            # WebSocket connection state
    useMessages.ts             # Message state management
    useSession.ts              # User session state
    usePresence.ts             # Active users state

data/
  chat.db                      # SQLite database file
```

## 🚀 Implementation Phases

### Phase 1: Setup (7 tasks)
**Time**: ~2 hours

1. Create Next.js 14 project: `npx create-next-app@latest --typescript --tailwind --app`
2. Install dependencies:
   ```bash
   npm install better-sqlite3 ws uuid
   npm install --save-dev @types/ws @types/better-sqlite3
   ```
3. Configure Tailwind CSS with @theme directive in `app/globals.css`
4. Setup TypeScript strict mode in `tsconfig.json`
5. Create folder structure: `app/`, `src/components/`, `src/lib/`, `src/types/`, `src/hooks/`, `data/`
6. Configure Next.js for WebSocket in `next.config.js`
7. Create root layout in `app/layout.tsx`

### Phase 2: Foundational (14 tasks) ⚠️ CRITICAL BLOCKER
**Time**: ~6 hours  
**Note**: ALL user stories depend on this phase completion

**TypeScript Types** (can run in parallel):
- Create `src/types/message.ts` - Message interface with id, roomId, senderName, content, timestamp, status
- Create `src/types/room.ts` - ChatRoom interface with id, name, createdAt, activeUsers
- Create `src/types/session.ts` - UserSession and ActiveUser interfaces
- Create `src/types/websocket.ts` - WebSocket message types (discriminated unions)

**Storage Layer**:
- Create `src/lib/storage/database.ts` - SQLite initialization with tables for messages and rooms
- Create `src/lib/storage/messages.ts` - CRUD operations for messages
- Create `src/lib/storage/rooms.ts` - CRUD operations for rooms

**Utilities** (can run in parallel):
- Create `src/lib/profanity-filter.ts` - Blocklist filtering
- Create `src/lib/rate-limiter.ts` - 10 messages/minute per user
- Create `src/lib/logger.ts` - Structured logging

**WebSocket & API**:
- Create `src/lib/websocket/server.ts` - Server WebSocket handler with connection upgrade
- Create REST API route `app/api/rooms/route.ts` - GET (list) and POST (create) rooms
- Create REST API route `app/api/rooms/[roomId]/route.ts` - GET room details
- Create `app/api/websocket/route.ts` - WebSocket upgrade handler

**Database Schema**:
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
```

### Phase 3: User Story 1 - Send/Receive Messages (20 tasks)
**Time**: ~8 hours  
**Priority**: P1 (MVP)

**WebSocket Foundation**:
- Create `src/lib/websocket/client.ts` - Client WebSocket manager with reconnection
- Create `src/hooks/useWebSocket.ts` - WebSocket connection state hook
- Create `src/hooks/useMessages.ts` - Message state management hook

**Server Logic**:
- Implement message broadcast in `src/lib/websocket/server.ts`
- Add message validation (length, profanity filter)
- Add rate limiting enforcement

**Components**:
- Create `src/components/chat/MessageList.tsx` - Display messages with sender/timestamp
- Create `src/components/chat/MessageInput.tsx` - Send message with Enter key handler
- Create `src/components/ui/ConnectionStatus.tsx` - Online/offline indicator
- Create `src/components/chat/ChatRoom.tsx` - Container component

**Pages**:
- Create `app/(chat)/[roomId]/page.tsx` - Chat room page

**Features**:
- Offline message queueing with "sending..." status
- Automatic retry on reconnection
- Message persistence (save to SQLite on receipt)
- Timestamp formatting utility

**Styling**:
- Style MessageList with Tailwind @theme colors
- Style MessageInput with character counter (max 1000)
- Add empty state for no messages
- Error handling UI for profanity blocks and rate limits

**Checkpoint**: Test by opening two browsers, sending messages, verifying real-time delivery

### Phase 4: User Story 2 - Create/Join Rooms (15 tasks)
**Time**: ~4 hours  
**Priority**: P2

**Components**:
- Create `src/components/rooms/RoomList.tsx` - Fetch and display available rooms
- Create `src/components/rooms/CreateRoom.tsx` - Room name form with validation

**Pages**:
- Create `app/(chat)/page.tsx` - Homepage with RoomList and CreateRoom
- Create `app/(chat)/layout.tsx` - Chat layout wrapper for navigation

**Features**:
- Room slug generation utility (name → id conversion) in `src/lib/utils.ts`
- Room name validation (3-50 chars, alphanumeric + spaces)
- Load last 50 messages on room join
- Duplicate room handling (409 Conflict)

**Styling**:
- Style RoomList with room cards showing active users count
- Style CreateRoom form with validation feedback
- Add loading states and empty states

**Checkpoint**: Create "Test Room", navigate to it, verify message history loads

### Phase 5: User Story 3 - Identify Users (12 tasks)
**Time**: ~3 hours  
**Priority**: P3

**Components**:
- Create `src/components/chat/UserNamePrompt.tsx` - Display name prompt modal

**Features**:
- Display name validation (2-30 chars) in `src/lib/utils.ts`
- Display name uniqueness check (append numbers if duplicate)
- Store display name in session storage
- Create `src/hooks/useSession.ts` - User session state management
- Add display name to WebSocket connection query params
- Extract display name from WebSocket connection on server

**UI Updates**:
- Update MessageList to display sender names prominently
- Add visual distinction for user's own messages vs others
- Show display name in connection status indicator
- Add display name change option

**Checkpoint**: Enter username, send message, verify username appears and persists

### Phase 6: User Story 4 - Active Users (11 tasks)
**Time**: ~3 hours  
**Priority**: P4

**Components**:
- Create `src/components/chat/UserPresence.tsx` - Active users list

**Features**:
- User presence tracking in `src/lib/websocket/server.ts`
- Create `src/hooks/usePresence.ts` - Active users state management
- User join/leave event broadcasts
- 5-second timeout before removing disconnected users
- Heartbeat/ping-pong mechanism for connection monitoring

**UI Updates**:
- Integrate UserPresence into ChatRoom layout
- Add join/leave notification messages in chat
- Style UserPresence with user avatars/initials
- Add active user count badge

**Checkpoint**: Open two browsers, verify both see each other in active users list

### Phase 7: Polish & Cross-Cutting (21 tasks)
**Time**: ~4 hours

**UI Enhancements**:
- Responsive mobile layout
- Dark mode support with Tailwind @theme dark variant
- Smooth scrolling and auto-scroll to latest message
- Message grouping by sender (consecutive messages)
- Loading skeletons for room list and message history
- Shared Button component for consistent styling

**Features**:
- Message sound notification on receipt (optional, user preference)
- Keyboard shortcuts documentation
- Emoji support validation
- Special character handling

**Maintenance**:
- Database cleanup job for old messages (>7 days)
- Empty room cleanup job (no messages after 24hrs)
- Comprehensive error logging

**Performance**:
- WebSocket message batching for high-frequency updates
- Virtual scrolling for long message histories

**Documentation**:
- Create `README.md` with setup instructions
- Validate all quickstart.md scenarios

## 🎓 Key Implementation Details

### WebSocket Connection Flow

**Client Side**:
```typescript
// src/lib/websocket/client.ts
const ws = new WebSocket('ws://localhost:3000/api/websocket?roomId=123&displayName=Alice');

ws.onopen = () => {
  setStatus('connected');
  flushQueuedMessages();
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  addMessage(message);
};

ws.onclose = () => {
  setStatus('disconnected');
  setTimeout(() => reconnect(), 3000);
};
```

**Server Side**:
```typescript
// src/lib/websocket/server.ts
export function handleWebSocketConnection(socket, roomId, displayName) {
  const userId = uuid.v4();
  addUserToRoom(roomId, userId, displayName);
  
  socket.on('message', (data) => {
    const message = JSON.parse(data);
    
    // Validate
    if (isProfane(message.content)) {
      socket.send(JSON.stringify({ error: 'Profanity detected' }));
      return;
    }
    
    if (!checkRateLimit(userId)) {
      socket.send(JSON.stringify({ error: 'Rate limit exceeded' }));
      return;
    }
    
    // Save and broadcast
    saveMessage(message);
    broadcastToRoom(roomId, message);
  });
  
  socket.on('close', () => {
    setTimeout(() => removeUserFromRoom(roomId, userId), 5000);
  });
}
```

### Message State Management

```typescript
// src/hooks/useMessages.ts
export function useMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [queue, setQueue] = useState<Message[]>([]);
  const { isConnected, sendMessage } = useWebSocket();
  
  const send = (content: string) => {
    const message = {
      id: uuid.v4(),
      roomId,
      content,
      timestamp: Date.now(),
      status: isConnected ? 'sending' : 'sending'
    };
    
    if (isConnected) {
      sendMessage(message);
    } else {
      setQueue([...queue, message]);
    }
    
    setMessages([...messages, message]);
  };
  
  useEffect(() => {
    if (isConnected && queue.length > 0) {
      queue.forEach(msg => sendMessage(msg));
      setQueue([]);
    }
  }, [isConnected]);
  
  return { messages, send };
}
```

### Rate Limiting

```typescript
// src/lib/rate-limiter.ts
const userMessageCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = userMessageCounts.get(userId);
  
  if (!entry || entry.resetAt < now) {
    userMessageCounts.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (entry.count >= 10) {
    return false; // Rate limit exceeded
  }
  
  entry.count++;
  return true;
}
```

### Profanity Filter

```typescript
// src/lib/profanity-filter.ts
const blocklist = ['badword1', 'badword2', 'badword3'];

export function isProfane(text: string): boolean {
  const lower = text.toLowerCase();
  return blocklist.some(word => lower.includes(word));
}
```

## 🧪 Validation Checklist

### User Story 1: Send/Receive Messages
- [ ] Open two browser windows
- [ ] Send message from window 1
- [ ] Verify message appears in both windows within 1 second
- [ ] Disconnect network in one window
- [ ] Send message, verify "sending..." status appears
- [ ] Reconnect network, verify message auto-sends
- [ ] Send 11 messages rapidly, verify 11th is rate-limited
- [ ] Send message with profanity, verify blocked with error message

### User Story 2: Create/Join Rooms
- [ ] Access homepage, see list of existing rooms
- [ ] Create new room "Test Room"
- [ ] Navigate back to homepage, verify "Test Room" appears in list
- [ ] Click on "Test Room", verify room loads
- [ ] Send 60 messages in room
- [ ] Refresh page, verify only last 50 messages are displayed
- [ ] Try creating duplicate room name, verify 409 Conflict error

### User Story 3: Identify Users
- [ ] Join chat room without entering username
- [ ] Verify username prompt appears
- [ ] Enter username "Alice"
- [ ] Send message, verify "Alice" appears next to message
- [ ] Refresh page, verify username "Alice" is remembered
- [ ] Open second browser with username "Alice"
- [ ] Verify second user gets "Alice-1" or similar unique name

### User Story 4: See Active Users
- [ ] Open two browser windows with usernames "Alice" and "Bob"
- [ ] Both join same chat room
- [ ] Verify both see each other in active users list
- [ ] Verify active users count shows "2"
- [ ] Close Bob's browser
- [ ] Verify Alice sees Bob removed from list within 5 seconds
- [ ] Open third browser with username "Charlie"
- [ ] Verify all users see join notification message

### Polish Features
- [ ] Resize browser to mobile size, verify responsive layout works
- [ ] Toggle dark mode, verify all components styled correctly
- [ ] Send new message, verify chat auto-scrolls to bottom
- [ ] Send message with emoji 🎉, verify displays correctly
- [ ] Hold Enter key in message input, verify only sends once
- [ ] Open same room in two tabs, verify both receive messages
- [ ] Leave browser idle for 2 minutes, verify connection maintained

## 🚨 Important Constraints

### Constitution Compliance

1. **No Testing** ✅ CRITICAL
   - Do NOT create test files (*.test.ts, *.spec.ts)
   - Do NOT install testing frameworks (Jest, Vitest, Mocha, etc.)
   - Do NOT create test configuration files
   - Manual validation only via quickstart.md scenarios

2. **Simplicity First**
   - Use native WebSocket API, NOT Socket.io
   - Use SQLite, NOT PostgreSQL/MongoDB
   - Simple profanity blocklist, NOT ML/API-based filtering
   - No unnecessary abstractions or frameworks

3. **Component-Based Design**
   - React components with clear hierarchy
   - Typed props interfaces for all components
   - Composition over inheritance

4. **Type Safety**
   - TypeScript strict mode enabled
   - Explicit interfaces for all entities
   - No `any` types permitted
   - Type guards for runtime validation

### Performance Requirements

- **Message Latency**: <1 second from send to display
- **Concurrent Users**: Support 100 simultaneous connections
- **Room History**: Load last 50 messages in <2 seconds
- **Connection Recovery**: Auto-reconnect within 3 seconds
- **Rate Limiting**: 10 messages per minute per user

### Data Management

- **Message Limit**: 1000 messages per room maximum
- **Message Retention**: Archive messages older than 7 days
- **Empty Rooms**: Delete rooms with no messages after 24 hours
- **Persistence**: All data survives server restarts (SQLite)

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Access application
open http://localhost:3000
```

## 📝 Progress Tracking

As you complete tasks, mark them in `specs/002-realtime-chat/tasks.md` by changing:
- `- [ ] T001 Create Next.js project` 
- to `- [X] T001 Create Next.js project`

This helps track progress through the 100 tasks.

## 🎉 Success Criteria

Implementation is complete when:

- ✅ All 100 tasks in tasks.md are marked [X] as completed
- ✅ All 4 user stories independently validated and passing
- ✅ No TypeScript errors in strict mode
- ✅ No test files or testing dependencies exist
- ✅ Messages persist across server restarts
- ✅ Real-time message delivery <1s latency confirmed
- ✅ Offline message queueing works correctly
- ✅ Rate limiting (10 msg/min) functional
- ✅ Profanity filtering blocks offensive content
- ✅ Responsive UI works on mobile devices
- ✅ Dark mode toggle functional
- ✅ README.md with setup instructions exists

## 🚀 Next Steps

### Option 1: Use GitHub Copilot Coding Agent

1. Create a GitHub repository:
   ```bash
   git remote add origin https://github.com/dkchkrso/realtime-chat.git
   git push -u origin 002-realtime-chat
   ```

2. Enable GitHub Copilot for the repository in Settings

3. Create an issue with this implementation guide content

4. Assign the issue to @copilot using: `/copilot implement`

### Option 2: Local Implementation

Follow the phases sequentially:

1. **Start with Phase 1 (Setup)**: Initialize project structure
2. **Complete Phase 2 (Foundation)**: CRITICAL - All other work depends on this
3. **Implement User Stories**: Start with P1 (MVP), then P2, P3, P4
4. **Add Polish**: Cross-cutting improvements
5. **Validate**: Test all scenarios from quickstart.md

### Option 3: Hybrid Approach

1. Implement Foundation locally (Phase 1-2)
2. Set up GitHub repository with Copilot
3. Create issues for each user story (P1-P4)
4. Assign to @copilot for parallel implementation

---

**Last Updated**: 2025-12-02  
**Feature Spec**: [specs/002-realtime-chat/spec.md](specs/002-realtime-chat/spec.md)  
**Task Breakdown**: [specs/002-realtime-chat/tasks.md](specs/002-realtime-chat/tasks.md)
