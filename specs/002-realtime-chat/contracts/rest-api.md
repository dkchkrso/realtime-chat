# REST API Contract

**Feature**: 002-realtime-chat  
**Date**: 2024-12-02  
**Base URL**: `http://localhost:3000`

## Endpoints

### 1. List Chat Rooms

**Endpoint**: `GET /api/rooms`

**Description**: Retrieve a list of all available chat rooms with metadata.

**Request**:
```http
GET /api/rooms HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Response** (200 OK):
```json
{
  "rooms": [
    {
      "id": "general",
      "name": "General Discussion",
      "createdAt": 1733155200000,
      "messageCount": 42,
      "activeUserCount": 5
    },
    {
      "id": "tech-talk",
      "name": "Tech Talk",
      "createdAt": 1733158800000,
      "messageCount": 17,
      "activeUserCount": 2
    }
  ],
  "total": 2
}
```

**Response Fields**:
- `rooms`: Array of chat room objects
  - `id`: Unique room identifier (slug format)
  - `name`: Human-readable room name
  - `createdAt`: Unix timestamp (milliseconds)
  - `messageCount`: Number of messages in room
  - `activeUserCount`: Number of users currently online in room
- `total`: Total number of rooms

**Related Requirements**: FR-015, FR-023

---

### 2. Get Chat Room Details

**Endpoint**: `GET /api/rooms/[roomId]`

**Description**: Retrieve detailed information about a specific chat room, including recent messages and active users.

**Request**:
```http
GET /api/rooms/general HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Response** (200 OK):
```json
{
  "room": {
    "id": "general",
    "name": "General Discussion",
    "createdAt": 1733155200000,
    "messageCount": 42,
    "activeUserCount": 5
  },
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "roomId": "general",
      "senderName": "Alice",
      "content": "Hello everyone!",
      "timestamp": 1733166000000
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "roomId": "general",
      "senderName": "Bob",
      "content": "Hi Alice, how are you?",
      "timestamp": 1733166015000
    }
  ],
  "activeUsers": [
    {
      "userName": "Alice",
      "sessionId": "session-123",
      "roomId": "general",
      "joinedAt": 1733165900000,
      "lastActiveAt": 1733166000000
    },
    {
      "userName": "Bob",
      "sessionId": "session-456",
      "roomId": "general",
      "joinedAt": 1733165950000,
      "lastActiveAt": 1733166015000
    }
  ]
}
```

**Response Fields**:
- `room`: Chat room metadata (same as list endpoint)
- `messages`: Array of last 50 messages (newest first)
  - `id`: Unique message identifier (UUID)
  - `roomId`: Room this message belongs to
  - `senderName`: Display name of sender
  - `content`: Message text (max 1000 chars)
  - `timestamp`: Unix timestamp (milliseconds)
- `activeUsers`: Array of currently active users
  - `userName`: User's display name
  - `sessionId`: Session identifier
  - `roomId`: Current room
  - `joinedAt`: When user joined this room
  - `lastActiveAt`: Last activity timestamp

**Error Response** (404 Not Found):
```json
{
  "error": "Room not found",
  "roomId": "nonexistent-room"
}
```

**Related Requirements**: FR-018, FR-020

---

### 3. Create Chat Room

**Endpoint**: `POST /api/rooms`

**Description**: Create a new chat room.

**Request**:
```http
POST /api/rooms HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "Music Lovers"
}
```

**Request Body**:
- `name`: Room name (3-50 characters, alphanumeric + spaces)

**Response** (201 Created):
```json
{
  "room": {
    "id": "music-lovers",
    "name": "Music Lovers",
    "createdAt": 1733166100000,
    "messageCount": 0,
    "activeUserCount": 0
  }
}
```

**Error Responses**:

**400 Bad Request** (Invalid name):
```json
{
  "error": "Invalid room name",
  "message": "Room name must be between 3 and 50 characters"
}
```

**409 Conflict** (Duplicate name):
```json
{
  "error": "Room already exists",
  "roomId": "music-lovers"
}
```

**Related Requirements**: FR-013, FR-014

---

### 4. Validate Display Name

**Endpoint**: `POST /api/validate/username`

**Description**: Check if a display name is valid and available in a specific room.

**Request**:
```http
POST /api/validate/username HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "displayName": "Alice",
  "roomId": "general"
}
```

**Request Body**:
- `displayName`: Proposed display name (2-30 characters)
- `roomId`: Room to check availability in

**Response** (200 OK - Available):
```json
{
  "valid": true,
  "available": true,
  "displayName": "Alice"
}
```

**Response** (200 OK - Taken, suggest alternative):
```json
{
  "valid": true,
  "available": false,
  "suggestedName": "Alice2",
  "message": "Display name 'Alice' is already taken in this room"
}
```

**Error Response** (400 Bad Request - Invalid):
```json
{
  "valid": false,
  "error": "Display name must be between 2 and 30 characters"
}
```

**Related Requirements**: FR-010, FR-011

---

## Common Patterns

### Error Response Format
All error responses follow this structure:
```json
{
  "error": "Brief error category",
  "message": "Detailed user-friendly error message",
  "field": "fieldName (if applicable)",
  "code": "ERROR_CODE (optional)"
}
```

### Timestamps
All timestamps are Unix timestamps in milliseconds (JavaScript `Date.now()` format).

### Pagination
Not implemented in current scope (max 50 messages per room fetch is sufficient).

### Authentication
None required (anonymous chat with display names only - FR-008).

### Rate Limiting
REST endpoints are not rate limited. Rate limiting applies only to WebSocket messages (10 messages/minute per user - FR-025).

---

## Next Steps

See `websocket-events.md` for real-time WebSocket event contracts.
