# Tasks: Real-Time Chat Website

**Input**: Design documents from `/specs/002-realtime-chat/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Per constitution principle IV (No Testing), this project MUST NOT include any test tasks, testing infrastructure, or testing dependencies.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Using Next.js 14 App Router structure with integrated frontend + backend:
- `app/` - Next.js pages and API routes
- `src/` - Shared code (components, lib, types, hooks)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js 14 project with TypeScript and App Router at repository root
- [ ] T002 Install core dependencies (next, react, react-dom, typescript, tailwindcss, better-sqlite3, ws, uuid)
- [ ] T003 [P] Configure Tailwind CSS with @theme directive in app/globals.css
- [ ] T004 [P] Setup TypeScript configuration in tsconfig.json with strict mode
- [ ] T005 [P] Create project folder structure (app/, src/components/, src/lib/, src/types/, src/hooks/, data/)
- [ ] T006 [P] Configure Next.js for WebSocket support in next.config.js
- [ ] T007 Create root layout in app/layout.tsx with globals.css import

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create TypeScript type definitions for Message interface in src/types/message.ts
- [ ] T009 [P] Create TypeScript type definitions for ChatRoom interface in src/types/room.ts
- [ ] T010 [P] Create TypeScript type definitions for UserSession and ActiveUser interfaces in src/types/session.ts
- [ ] T011 [P] Create TypeScript type definitions for WebSocket message types (discriminated unions) in src/types/websocket.ts
- [ ] T012 Create SQLite database initialization module in src/lib/storage/database.ts
- [ ] T013 Create message persistence layer with CRUD operations in src/lib/storage/messages.ts
- [ ] T014 [P] Create room persistence layer with CRUD operations in src/lib/storage/rooms.ts
- [ ] T015 [P] Create profanity filter with blocklist in src/lib/profanity-filter.ts
- [ ] T016 Create server WebSocket handler with connection upgrade logic in src/lib/websocket/server.ts
- [ ] T017 Create rate limiter utility (10 msg/min per user) in src/lib/rate-limiter.ts
- [ ] T018 Create REST API route for listing rooms (GET /api/rooms) in app/api/rooms/route.ts
- [ ] T019 Create REST API route for creating rooms (POST /api/rooms) in app/api/rooms/route.ts
- [ ] T020 Create REST API route for room details (GET /api/rooms/[roomId]) in app/api/rooms/[roomId]/route.ts
- [ ] T021 Create WebSocket API route with upgrade handler in app/api/websocket/route.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Send and Receive Messages (Priority: P1) 🎯 MVP

**Goal**: Users can send messages in a chat room and see them appear instantly in real-time for all participants

**Independent Validation**: Open two browser windows, join the same chat room, send a message from one window, verify it appears immediately in both windows without page refresh

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create client WebSocket manager with connection/reconnection logic in src/lib/websocket/client.ts
- [ ] T023 [P] [US1] Create useWebSocket custom hook for WebSocket connection state in src/hooks/useWebSocket.ts
- [ ] T024 [P] [US1] Create useMessages custom hook for message state management in src/hooks/useMessages.ts
- [ ] T025 [US1] Implement server-side message broadcast logic in src/lib/websocket/server.ts
- [ ] T026 [US1] Add message validation (content length, profanity filter) in src/lib/websocket/server.ts
- [ ] T027 [US1] Add rate limiting enforcement in src/lib/websocket/server.ts
- [ ] T028 [US1] Create MessageList component to display messages with sender and timestamp in src/components/chat/MessageList.tsx
- [ ] T029 [P] [US1] Create MessageInput component with send functionality and Enter key handler in src/components/chat/MessageInput.tsx
- [ ] T030 [P] [US1] Create ConnectionStatus component showing online/offline indicator in src/components/ui/ConnectionStatus.tsx
- [ ] T031 [US1] Create ChatRoom container component integrating WebSocket, messages, and input in src/components/chat/ChatRoom.tsx
- [ ] T032 [US1] Create chat room page with ChatRoom component in app/(chat)/[roomId]/page.tsx
- [ ] T033 [US1] Add offline message queueing logic with "sending..." status in src/hooks/useMessages.ts
- [ ] T034 [US1] Add automatic message retry on reconnection in src/lib/websocket/client.ts
- [ ] T035 [US1] Add message persistence on server (save to SQLite on receipt) in src/lib/websocket/server.ts
- [ ] T036 [US1] Add timestamp formatting utility for message display in src/lib/utils.ts
- [ ] T037 [US1] Style MessageList component with Tailwind using @theme colors in src/components/chat/MessageList.tsx
- [ ] T038 [US1] Style MessageInput component with character counter (max 1000) in src/components/chat/MessageInput.tsx
- [ ] T039 [US1] Add empty state message for rooms with no messages in src/components/chat/MessageList.tsx
- [ ] T040 [US1] Add error handling for profanity-blocked messages with user-friendly error in src/components/chat/MessageInput.tsx
- [ ] T041 [US1] Add error handling for rate limit exceeded with retry countdown in src/components/chat/MessageInput.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can send and receive real-time messages with offline support, profanity filtering, and rate limiting

---

## Phase 4: User Story 2 - Create and Join Chat Rooms (Priority: P2)

**Goal**: Users can view existing rooms, create new rooms, join rooms, and see message history

**Independent Validation**: Access the website, view list of available rooms, create a new room, click on an existing room, verify it loads with previous messages visible

### Implementation for User Story 2

- [ ] T042 [P] [US2] Create RoomList component fetching and displaying available rooms in src/components/rooms/RoomList.tsx
- [ ] T043 [P] [US2] Create CreateRoom component with room name form and validation in src/components/rooms/CreateRoom.tsx
- [ ] T044 [US2] Create homepage with RoomList and CreateRoom components in app/(chat)/page.tsx
- [ ] T045 [US2] Create chat layout wrapper for navigation in app/(chat)/layout.tsx
- [ ] T046 [US2] Add room slug generation utility (name → id conversion) in src/lib/utils.ts
- [ ] T047 [US2] Add room name validation (3-50 chars, alphanumeric + spaces) in src/lib/storage/rooms.ts
- [ ] T048 [US2] Load last 50 messages on room join in app/api/rooms/[roomId]/route.ts
- [ ] T049 [US2] Add room metadata display (active users count) in src/components/rooms/RoomList.tsx
- [ ] T050 [US2] Add navigation between room list and chat room pages with Next.js routing
- [ ] T051 [US2] Add duplicate room name handling (409 Conflict response) in app/api/rooms/route.ts
- [ ] T052 [US2] Style RoomList component with Tailwind @theme colors showing room cards in src/components/rooms/RoomList.tsx
- [ ] T053 [US2] Style CreateRoom form with validation feedback in src/components/rooms/CreateRoom.tsx
- [ ] T054 [US2] Add loading states for room list fetch in src/components/rooms/RoomList.tsx
- [ ] T055 [US2] Add empty state for no available rooms in src/components/rooms/RoomList.tsx
- [ ] T056 [US2] Add room creation success feedback and redirect to new room in src/components/rooms/CreateRoom.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can create/join rooms and send/receive messages

---

## Phase 5: User Story 3 - Identify Users (Priority: P3)

**Goal**: Users provide display names that appear alongside their messages for identification

**Independent Validation**: Enter a username when joining, send messages, verify the username appears next to each message

### Implementation for User Story 3

- [ ] T057 [P] [US3] Create display name prompt modal/form component in src/components/chat/UserNamePrompt.tsx
- [ ] T058 [US3] Add display name validation (2-30 chars) in src/lib/utils.ts
- [ ] T059 [US3] Add display name uniqueness check within room (append numbers if duplicate) in src/lib/websocket/server.ts
- [ ] T060 [US3] Store display name in browser session storage for persistence in src/hooks/useSession.ts
- [ ] T061 [US3] Add display name to WebSocket connection query params in src/lib/websocket/client.ts
- [ ] T062 [US3] Create useSession custom hook for managing user session state in src/hooks/useSession.ts
- [ ] T063 [US3] Add display name extraction from WebSocket connection in src/lib/websocket/server.ts
- [ ] T064 [US3] Update MessageList to display sender names prominently in src/components/chat/MessageList.tsx
- [ ] T065 [US3] Add visual distinction for user's own messages vs others in src/components/chat/MessageList.tsx
- [ ] T066 [US3] Style UserNamePrompt modal with validation feedback in src/components/chat/UserNamePrompt.tsx
- [ ] T067 [US3] Add display name change option (requires reconnection) in src/components/chat/ChatRoom.tsx
- [ ] T068 [US3] Show display name in connection status indicator in src/components/ui/ConnectionStatus.tsx

**Checkpoint**: All three priority stories (P1, P2, P3) should now work together - users can create rooms, identify themselves, and send/receive messages

---

## Phase 6: User Story 4 - See Active Users (Priority: P4)

**Goal**: Users see a list of other users currently online in the chat room

**Independent Validation**: Open multiple browser sessions with different usernames in the same room, verify each session shows all active users in a list

### Implementation for User Story 4

- [ ] T069 [P] [US4] Create user presence tracking system in src/lib/websocket/server.ts
- [ ] T070 [P] [US4] Create usePresence custom hook for active users state in src/hooks/usePresence.ts
- [ ] T071 [US4] Add user join event broadcast to all room participants in src/lib/websocket/server.ts
- [ ] T072 [US4] Add user leave event broadcast with 5-second timeout in src/lib/websocket/server.ts
- [ ] T073 [US4] Implement heartbeat/ping-pong mechanism for connection monitoring in src/lib/websocket/server.ts
- [ ] T074 [US4] Create UserPresence component displaying active users list in src/components/chat/UserPresence.tsx
- [ ] T075 [US4] Add active user count display in room list in src/components/rooms/RoomList.tsx
- [ ] T076 [US4] Integrate UserPresence component into ChatRoom layout in src/components/chat/ChatRoom.tsx
- [ ] T077 [US4] Add join/leave notification messages in chat in src/components/chat/MessageList.tsx
- [ ] T078 [US4] Style UserPresence component with user avatars/initials in src/components/chat/UserPresence.tsx
- [ ] T079 [US4] Add total active users count badge in src/components/chat/UserPresence.tsx

**Checkpoint**: All user stories (P1-P4) should be independently functional and integrated

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T080 [P] Add responsive mobile layout for chat interface across all components
- [ ] T081 [P] Add dark mode support using Tailwind @theme dark variant in app/globals.css
- [ ] T082 [P] Add smooth scroll behavior for message list in src/components/chat/MessageList.tsx
- [ ] T083 [P] Add message sound notification on receipt (optional, user preference) in src/hooks/useMessages.ts
- [ ] T084 [P] Add keyboard shortcuts documentation (Enter to send, Esc to close modal)
- [ ] T085 Add automatic scrolling to latest message on new message receipt in src/components/chat/MessageList.tsx
- [ ] T086 Add message grouping by sender (consecutive messages) in src/components/chat/MessageList.tsx
- [ ] T087 Add database cleanup job for old messages (>7 days) in src/lib/storage/messages.ts
- [ ] T088 Add empty room cleanup job (no messages after 24hrs) in src/lib/storage/rooms.ts
- [ ] T089 Add comprehensive error logging with context in src/lib/logger.ts
- [ ] T090 Add connection error handling with user-friendly messages in src/components/ui/ConnectionStatus.tsx
- [ ] T091 Create shared Button component for consistent styling in src/components/ui/Button.tsx
- [ ] T092 Add loading skeletons for room list and message history in src/components/rooms/RoomList.tsx
- [ ] T093 Add emoji support validation and display testing across components
- [ ] T094 Add special character handling validation in message input
- [ ] T095 Add simultaneous message ordering test scenario validation
- [ ] T096 Add multiple tab handling verification (same user, different tabs)
- [ ] T097 Create README.md with setup instructions based on quickstart.md
- [ ] T098 Validate all quickstart.md scenarios work correctly
- [ ] T099 Performance optimization: WebSocket message batching for high-frequency updates
- [ ] T100 Performance optimization: Virtual scrolling for long message histories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Send/Receive Messages**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2) - Create/Join Rooms**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3) - Identify Users**: Can start after Foundational (Phase 2) - Enhances US1 but US1 can work without it
- **User Story 4 (P4) - Active Users**: Can start after Foundational (Phase 2) - Enhances social experience but independent feature

### Within Each User Story

- **US1**: Client WebSocket + hooks → Server handlers → Components → Styling → Error handling
- **US2**: API routes → Components → Validation → Styling
- **US3**: Session management → WebSocket auth → Display updates
- **US4**: Presence tracking → Heartbeat → UI display

### Parallel Opportunities

**Phase 1 (Setup)**: T003, T004, T005 can run in parallel after T002

**Phase 2 (Foundational)**: After T008-T011 (types), the following can run in parallel:
- T012-T014 (storage layer)
- T015 (profanity filter)
- T017 (rate limiter)
- T018-T020 (REST API routes - different files)

**Phase 3 (US1)**: After T022-T024 (WebSocket foundation):
- T028, T029, T030 (UI components - different files)
- T037, T038 (styling tasks - different files)

**Phase 4 (US2)**: T042 and T043 can start in parallel (different components)

**Phase 5 (US3)**: T057 and T058 can start in parallel

**Phase 6 (US4)**: T069 and T070 can start in parallel

**Phase 7 (Polish)**: T080, T081, T082, T083, T084 can all run in parallel (different concerns)

**Cross-Phase**: Once Foundational is complete, ALL user stories (US1, US2, US3, US4) can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

After completing WebSocket infrastructure (T022-T024), these tasks can run in parallel:

```bash
# Launch UI components together (different files):
T028: "Create MessageList component in src/components/chat/MessageList.tsx"
T029: "Create MessageInput component in src/components/chat/MessageInput.tsx"
T030: "Create ConnectionStatus component in src/components/ui/ConnectionStatus.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Complete Phase 1: Setup** (T001-T007) - ~2 hours
2. **Complete Phase 2: Foundational** (T008-T021) - ~6 hours (CRITICAL - blocks all stories)
3. **Complete Phase 3: User Story 1** (T022-T041) - ~8 hours
4. **STOP and VALIDATE**: Open two browsers, send messages, verify real-time delivery, test offline queueing
5. Deploy/demo basic chat functionality

**Total MVP Time**: ~16 hours
**Deliverable**: Working real-time chat in a single room

### Incremental Delivery

1. **Foundation** (Phase 1 + 2) → Database, WebSocket, REST API ready
2. **+ User Story 1** (Phase 3) → Real-time messaging works → **Deploy MVP** ✅
3. **+ User Story 2** (Phase 4) → Multi-room support → **Deploy v0.2** ✅
4. **+ User Story 3** (Phase 5) → User identification → **Deploy v0.3** ✅
5. **+ User Story 4** (Phase 6) → Active users list → **Deploy v1.0** ✅
6. **+ Polish** (Phase 7) → Production-ready → **Deploy v1.1** ✅

Each increment adds value and is independently verifiable.

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

- **Developer A**: User Story 1 (Core messaging) - P1 priority
- **Developer B**: User Story 2 (Rooms) + User Story 3 (Names) - P2, P3 priority
- **Developer C**: User Story 4 (Presence) - P4 priority

Stories integrate cleanly due to independent design.

---

## Task Summary

- **Total Tasks**: 100
- **Setup Phase**: 7 tasks
- **Foundational Phase**: 14 tasks (CRITICAL PATH)
- **User Story 1 (P1)**: 20 tasks (MVP core)
- **User Story 2 (P2)**: 15 tasks
- **User Story 3 (P3)**: 12 tasks
- **User Story 4 (P4)**: 11 tasks
- **Polish Phase**: 21 tasks

**Parallel Opportunities**: 35+ tasks marked [P] can run concurrently
**Independent Stories**: All 4 user stories can be developed in parallel after Foundation
**MVP Scope**: Setup + Foundational + US1 = 41 tasks for basic working chat

---

## Validation Criteria (Per quickstart.md)

### User Story 1 Validation
- [ ] Open two browser windows
- [ ] Send message from window 1
- [ ] Verify message appears in both windows within 1 second
- [ ] Disconnect network, send message, verify "sending..." status
- [ ] Reconnect network, verify message auto-sends

### User Story 2 Validation
- [ ] Access homepage, see list of rooms
- [ ] Create new room "Test Room"
- [ ] Navigate back to homepage, verify "Test Room" appears
- [ ] Click on room, verify last 50 messages load

### User Story 3 Validation
- [ ] Join room without username, verify prompt appears
- [ ] Enter username "Alice"
- [ ] Send message, verify "Alice" appears next to message
- [ ] Refresh page, verify username persists

### User Story 4 Validation
- [ ] Open two browsers with usernames "Alice" and "Bob"
- [ ] Both join same room
- [ ] Verify both see each other in active users list
- [ ] Close Bob's browser
- [ ] Verify Alice sees Bob removed within 5 seconds

---

## Notes

- **[P] tasks**: Different files, no shared dependencies, safe to parallelize
- **[Story] labels**: Track which user story each task serves for independent delivery
- **Constitution compliance**: No test files or testing dependencies included
- **Next.js structure**: Uses App Router with integrated API routes for WebSocket
- **WebSocket**: Native WebSocket API (no Socket.io dependency per research.md)
- **Database**: SQLite with better-sqlite3 (no Docker required per research.md)
- **Styling**: Tailwind CSS with @theme directive per user requirement
- **Real-time**: WebSocket for bidirectional communication (<1s latency per spec)
- **Persistence**: All messages and rooms survive server restarts (FR-030)

**Commit Strategy**: Commit after each task or logical group (e.g., all types in Phase 2)
**Stop Points**: Any checkpoint allows for independent validation and deployment
**Avoid**: Vague tasks, same-file conflicts, cross-story dependencies that break independence
