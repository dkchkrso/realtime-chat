# Real-Time Chat Website

A modern real-time chat application built with Next.js 14, TypeScript, and WebSocket for instant messaging across multiple chat rooms.

## Features

- ✨ **Real-time messaging** with <1s latency
- 💬 **Multiple chat rooms** - Create and join different conversations
- 👤 **User identification** - Display names for all participants
- 👥 **Active user presence** - See who's online in each room
- 📱 **Responsive design** - Works on desktop and mobile
- 🌙 **Dark mode support** - Built with Tailwind CSS theme system
- 💾 **Message persistence** - All messages saved to SQLite database
- 🔄 **Offline queueing** - Messages sent when reconnected
- 🛡️ **Rate limiting** - 10 messages per minute per user
- 🔒 **Profanity filter** - Basic content moderation
- 🎨 **Customizable theme** - Easy color customization via CSS variables

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3+ with custom theme
- **Real-time**: Native WebSocket API
- **Database**: SQLite with better-sqlite3
- **Runtime**: Node.js 18+ LTS

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realtime-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

The WebSocket server will be available at `ws://localhost:3000/api/websocket`

### Environment Variables

Create a `.env.local` file (optional):

```bash
# Database path (default: ./data/chat.db)
DATABASE_PATH=./data/chat.db

# Server port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=development
```

## Usage

### Creating a Room

1. Go to homepage
2. Enter a room name (3-50 characters)
3. Click "Create Room"
4. Share the room link with others

### Joining a Room

1. Access the room link
2. Enter your display name (2-30 characters)
3. Start chatting!

### Sending Messages

- Type in the message input box
- Press Enter or click Send
- Messages appear instantly for all users in the room
- Maximum 1000 characters per message

## Project Structure

```
realtime-chat/
├── app/                      # Next.js App Router
│   ├── (chat)/              # Chat route group
│   │   ├── [roomId]/        # Dynamic room page
│   │   ├── join/            # Username prompt page
│   │   └── page.tsx         # Homepage (room list)
│   ├── api/
│   │   └── rooms/           # REST API for rooms
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles + theme
│
├── src/
│   ├── components/
│   │   ├── chat/            # Chat components
│   │   ├── rooms/           # Room components
│   │   └── ui/              # Shared UI components
│   ├── hooks/               # React hooks
│   ├── lib/
│   │   ├── websocket/       # WebSocket client & server
│   │   ├── storage/         # Database layer
│   │   ├── profanity-filter.ts
│   │   ├── rate-limiter.ts
│   │   └── utils.ts
│   └── types/               # TypeScript types
│
├── data/
│   └── chat.db              # SQLite database (auto-created)
│
├── server.js                # Custom server with WebSocket support
└── specs/                   # Feature specifications
```

## API Documentation

### REST API

#### GET /api/rooms
List all chat rooms with metadata

**Response:**
```json
{
  "rooms": [
    {
      "id": "general",
      "name": "General Discussion",
      "createdAt": 1733155200000,
      "messageCount": 42,
      "activeUserCount": 5
    }
  ],
  "total": 1
}
```

#### POST /api/rooms
Create a new chat room

**Request:**
```json
{
  "name": "Tech Talk"
}
```

**Response:**
```json
{
  "room": {
    "id": "tech-talk",
    "name": "Tech Talk",
    "createdAt": 1733166100000,
    "messageCount": 0,
    "activeUserCount": 0
  }
}
```

#### GET /api/rooms/[roomId]
Get room details with recent messages and active users

**Response:**
```json
{
  "room": { /* ChatRoom */ },
  "messages": [ /* Last 50 messages */ ],
  "activeUsers": [ /* Active users */ ]
}
```

### WebSocket API

#### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/api/websocket?room=general&userName=Alice');
```

#### Client → Server Events
- `chat_message` - Send a message
- `ping` - Heartbeat
- `switch_room` - Change rooms

#### Server → Client Events
- `connection_ack` - Connection confirmed
- `chat_message` - New message broadcast
- `user_joined` - User joined room
- `user_left` - User left room
- `presence_update` - Active users list update
- `error` - Error notification

See `specs/002-realtime-chat/contracts/` for complete API documentation.

## Development

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Run production server
npm start
```

### Database

The SQLite database is automatically created at `./data/chat.db` on first run.

**Inspect database:**
```bash
sqlite3 data/chat.db

# List tables
.tables

# View messages
SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10;

# View rooms
SELECT * FROM rooms;
```

## Testing Scenarios

### Real-Time Messaging (User Story 1)
1. Open two browser windows
2. Join the same room with different usernames
3. Send a message from one window
4. Verify it appears in both windows within 1 second

### Room Management (User Story 2)
1. Create a new room from homepage
2. Navigate back and verify room appears in list
3. Click room to join
4. Verify last 50 messages load

### User Identity (User Story 3)
1. Access a room without username
2. Enter username on prompt page
3. Send messages and verify username appears
4. Refresh page - username should persist

### Active Users (User Story 4)
1. Open multiple browsers with different usernames
2. Join same room
3. Verify all users appear in sidebar
4. Close one browser
5. Verify user removed from list within 5 seconds

## Customization

### Theme Colors

Edit `app/globals.css`:

```css
:root {
  --color-primary: #3b82f6;        /* Primary blue */
  --color-bg-primary: #ffffff;      /* Background */
  --color-text-primary: #0f172a;    /* Text color */
  /* ... more colors */
}

.dark {
  --color-bg-primary: #0f172a;      /* Dark background */
  --color-text-primary: #f8fafc;    /* Dark text */
  /* ... dark mode colors */
}
```

Changes hot-reload automatically in development.

### Rate Limiting

Edit `src/lib/rate-limiter.ts`:

```typescript
const rateLimiter = new RateLimiter(
  10,     // Max messages
  60000   // Per 60 seconds
);
```

### Profanity Filter

Edit `src/lib/profanity-filter.ts`:

```typescript
const BLOCKED_WORDS = [
  'word1',
  'word2',
  // Add or remove words
];
```

## Performance

- **Concurrent Users**: Supports 100+ simultaneous connections
- **Message Latency**: <1 second delivery under normal conditions
- **Database**: Handles 10,000+ messages efficiently
- **Memory**: ~50MB for server with active connections
- **Bundle Size**: ~200KB gzipped (client JavaScript)

## Limitations

- No authentication system (intentional for demo)
- Single server instance (no clustering support)
- No end-to-end encryption
- Basic profanity filter (word list based)
- Messages limited to 1000 characters
- Rooms keep last 1000 messages only

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### WebSocket Connection Failed
- Check firewall settings
- Verify port 3000 is accessible
- Ensure no proxy blocking WebSocket upgrades
- Try disabling browser extensions

### Database Locked
```bash
# Stop server and remove database
rm data/chat.db

# Restart server (will recreate database)
npm run dev
```

## License

ISC

## Contributing

This is a demonstration project. For production use, consider:
- Adding authentication
- Implementing end-to-end encryption
- Using a scalable message broker (Redis, RabbitMQ)
- Adding message pagination
- Implementing file uploads
- Adding typing indicators
- Improving profanity filter with ML

## Support

For questions or issues, refer to:
- Feature specification: `specs/002-realtime-chat/spec.md`
- API contracts: `specs/002-realtime-chat/contracts/`
- Implementation guide: `IMPLEMENTATION_GUIDE.md`
