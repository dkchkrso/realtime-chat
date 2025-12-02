# Implementation Plan: Real-Time Chat Website

**Branch**: `002-realtime-chat` | **Date**: 2024-12-02 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-realtime-chat/spec.md`

**Status**: Phase 0 & Phase 1 Complete - Ready for Phase 2 (task breakdown)

## Summary

Build a real-time chat website where users can send messages instantly across multiple chat rooms without authentication. Users provide display names only and can create rooms on-demand. The application uses Next.js 14 with TypeScript, native WebSocket API for real-time bidirectional communication, SQLite for message persistence, and Tailwind CSS with @theme directive for customizable colors. Key features include automatic reconnection, offline message queueing, basic profanity filtering, rate limiting (10 messages/minute), and user presence tracking. The system supports 100 concurrent users with <1 second message delivery latency.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14+ (App Router)  
**Primary Dependencies**: Next.js, React 18+, Tailwind CSS 3+, Native WebSocket API, better-sqlite3  
**Storage**: SQLite with better-sqlite3 for message persistence  
**Target Platform**: Web (Node.js 18+ LTS server, modern browsers with WebSocket support)  
**Project Type**: Web application (frontend + backend integrated in Next.js)  
**Performance Goals**: <1s message delivery, support 100 concurrent users, <2s room history load  
**Constraints**: Real-time bidirectional communication required, offline message queueing, rate limiting (10 msg/min per user)  
**Scale/Scope**: Demo site with 100 concurrent users, multiple chat rooms, 1000 messages per room max  
**Styling Approach**: Tailwind CSS with @theme for color customization (user requirement)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

### I. Simplicity First ✅
- **Status**: PASS
- **Rationale**: Feature is focused on core chat functionality with minimal feature scope. No over-engineering detected. YAGNI principles applied (no unnecessary features like file uploads, advanced formatting, or complex authentication).

### II. Component-Based Design ✅
- **Status**: PASS
- **Rationale**: React component architecture with Tailwind CSS aligns perfectly. Components will include: ChatRoom, MessageList, MessageInput, RoomList, UserPresence, ConnectionStatus. Clear composition patterns with typed props.

### III. Type Safety ✅
- **Status**: PASS
- **Rationale**: TypeScript required throughout. All entities (Message, ChatRoom, UserSession, ActiveUser) will have explicit type definitions. No `any` types permitted.

### IV. No Testing ✅
- **Status**: PASS
- **Rationale**: No testing infrastructure, test files, or testing frameworks will be added. Demo site scope does not justify testing overhead.

**Initial Constitution Alignment**: All principles satisfied. No violations to justify.

---

### Post-Design Re-evaluation (Phase 1 Complete)

### I. Simplicity First ✅
- **Status**: PASS (Reconfirmed)
- **Design Review**: 
  - Native WebSocket chosen over Socket.io (removes 60KB+ dependency)
  - SQLite chosen over PostgreSQL (no Docker/external database required)
  - Simple profanity blocklist instead of ML/API-based filtering
  - No unnecessary abstractions or frameworks added
- **Verdict**: Design maintains simplicity principle

### II. Component-Based Design ✅
- **Status**: PASS (Reconfirmed)
- **Design Review**:
  - 9 React components defined (ChatRoom, MessageList, MessageInput, UserPresence, ConnectionStatus, RoomList, CreateRoom, Button)
  - Clear component hierarchy with typed props interfaces
  - Tailwind @theme used for consistent styling across components
  - Server Components for initial load, Client Components for real-time features
- **Verdict**: Component-based design properly implemented

### III. Type Safety ✅
- **Status**: PASS (Reconfirmed)
- **Design Review**:
  - 8 TypeScript interfaces defined (Message, ChatRoom, UserSession, ActiveUser, etc.)
  - Discriminated unions for WebSocket messages
  - Type guards for runtime validation
  - No `any` types in contracts or data model
  - Zod suggested as optional runtime validator (maintains type safety)
- **Verdict**: Full type safety maintained throughout design

### IV. No Testing ✅
- **Status**: PASS (Reconfirmed)
- **Design Review**:
  - No test files in project structure
  - No testing dependencies in tech stack
  - WebSocket events contract includes "Testing Checklist" for manual testing only
  - Focus on working features rather than test infrastructure
- **Verdict**: No testing principle respected

**Final Constitution Alignment**: All principles satisfied after design phase. No new violations introduced. Ready to proceed to Phase 2 (task breakdown via `/speckit.tasks` command).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js 14 App Router structure (integrated frontend + backend)
app/
├── (chat)/                    # Route group for chat pages
│   ├── page.tsx              # Room list/homepage
│   ├── [roomId]/
│   │   └── page.tsx          # Chat room page
│   └── layout.tsx            # Chat layout wrapper
├── api/
│   ├── rooms/
│   │   └── route.ts          # REST: GET/POST rooms
│   └── websocket/
│       └── route.ts          # WebSocket upgrade handler
├── layout.tsx                # Root layout
└── globals.css               # Tailwind imports + @theme config

src/
├── components/
│   ├── chat/
│   │   ├── ChatRoom.tsx      # Main chat container
│   │   ├── MessageList.tsx   # Message display
│   │   ├── MessageInput.tsx  # Send message form
│   │   └── UserPresence.tsx  # Active users list
│   ├── rooms/
│   │   ├── RoomList.tsx      # Available rooms
│   │   └── CreateRoom.tsx    # New room form
│   └── ui/
│       ├── ConnectionStatus.tsx  # Online/offline indicator
│       └── Button.tsx        # Shared button component
├── lib/
│   ├── websocket/
│   │   ├── client.ts         # Client WebSocket manager
│   │   └── server.ts         # Server WebSocket handler
│   ├── storage/
│   │   └── messages.ts       # Message persistence layer
│   ├── profanity-filter.ts   # Content moderation
│   ├── rate-limiter.ts       # Rate limiting utility
│   └── logger.ts             # Structured logging utility
├── types/
│   ├── message.ts            # Message type definitions
│   ├── room.ts               # ChatRoom types
│   └── session.ts            # UserSession types
└── hooks/
    ├── useWebSocket.ts       # WebSocket connection hook
    ├── useMessages.ts        # Message state management
    └── usePresence.ts        # Active users tracking

public/
└── (static assets)

tailwind.config.ts            # Tailwind + @theme configuration
```

**Structure Decision**: Using Next.js 14 App Router with integrated frontend and backend. This is a web application but uses Next.js's unified structure rather than separate backend/frontend folders. WebSocket handling will be implemented via API routes with upgrade capability. The App Router's file-based routing naturally organizes chat rooms and room lists.

## Complexity Tracking

**No violations detected**. All constitution principles satisfied. No complexity justification required.
