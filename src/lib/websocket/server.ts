import type { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type { ActiveUser } from '@/types/session';
import type { WebSocketMessage } from '@/types/websocket';
import { RateLimiter } from '../rate-limiter';
import { filterMessage } from '../profanity-filter';
import { createMessage } from '../storage/messages';
import { logger } from '../logger';

interface WebSocketClient {
  ws: WebSocket;
  sessionId: string;
  userName: string;
  roomId: string;
  joinedAt: number;
  lastActiveAt: number;
}

// Global state
const clients = new Map<string, WebSocketClient>();
const roomClients = new Map<string, Set<string>>();
const rateLimiter = new RateLimiter(10, 60000);

export function handleConnection(
  ws: WebSocket,
  roomId: string,
  userName: string
): string {
  const sessionId = uuidv4();
  const now = Date.now();

  const client: WebSocketClient = {
    ws,
    sessionId,
    userName,
    roomId,
    joinedAt: now,
    lastActiveAt: now,
  };

  clients.set(sessionId, client);

  if (!roomClients.has(roomId)) {
    roomClients.set(roomId, new Set());
  }
  roomClients.get(roomId)!.add(sessionId);

  // Send connection acknowledgment
  sendToClient(ws, {
    type: 'connection_ack',
    payload: {
      sessionId,
      userName,
      roomId,
      timestamp: now,
    },
  });

  // Broadcast user joined
  broadcastToRoom(roomId, {
    type: 'user_joined',
    payload: {
      userName,
      roomId,
      timestamp: now,
    },
  }, sessionId);

  // Send presence update
  broadcastPresenceUpdate(roomId);

  logger.info('User connected', { sessionId, userName, roomId });

  return sessionId;
}

export function handleDisconnection(sessionId: string): void {
  const client = clients.get(sessionId);
  if (!client) return;

  const { roomId, userName } = client;

  // Remove from clients
  clients.delete(sessionId);

  // Remove from room
  const roomSet = roomClients.get(roomId);
  if (roomSet) {
    roomSet.delete(sessionId);
    if (roomSet.size === 0) {
      roomClients.delete(roomId);
    }
  }

  // Broadcast user left
  broadcastToRoom(roomId, {
    type: 'user_left',
    payload: {
      userName,
      roomId,
      timestamp: Date.now(),
    },
  });

  // Send presence update
  broadcastPresenceUpdate(roomId);

  logger.info('User disconnected', { sessionId, userName, roomId });
}

export function handleMessage(
  sessionId: string,
  message: WebSocketMessage
): void {
  const client = clients.get(sessionId);
  if (!client) return;

  client.lastActiveAt = Date.now();

  switch (message.type) {
    case 'chat_message':
      handleChatMessage(client, message.payload.content);
      break;
    case 'ping':
      handlePing(client);
      break;
    case 'switch_room':
      handleSwitchRoom(client, message.payload.roomId);
      break;
    default:
      logger.warn('Unknown message type', { type: (message as { type: string }).type });
  }
}

function handleChatMessage(client: WebSocketClient, content: string): void {
  // Rate limiting
  if (!rateLimiter.checkLimit(client.sessionId)) {
    const retryAfter = rateLimiter.getRetryAfter(client.sessionId);
    sendToClient(client.ws, {
      type: 'error',
      payload: {
        message: 'Rate limit exceeded. Maximum 10 messages per minute.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
        timestamp: Date.now(),
      },
    });
    return;
  }

  // Profanity filter
  const filterResult = filterMessage(content);
  if (!filterResult.allowed) {
    sendToClient(client.ws, {
      type: 'error',
      payload: {
        message: filterResult.reason || 'Message blocked',
        code: 'PROFANITY_DETECTED',
        timestamp: Date.now(),
      },
    });
    return;
  }

  // Create and persist message
  const messageId = uuidv4();
  const timestamp = Date.now();
  
  const messageData = {
    id: messageId,
    roomId: client.roomId,
    senderName: client.userName,
    content,
    timestamp,
  };

  try {
    createMessage(messageData);

    // Send confirmation to sender
    sendToClient(client.ws, {
      type: 'message_sent',
      payload: {
        ...messageData,
        status: 'sent' as const,
      },
    });

    // Broadcast to all clients in room
    broadcastToRoom(client.roomId, {
      type: 'chat_message',
      payload: messageData,
    });

    logger.debug('Message sent', { messageId, roomId: client.roomId, sender: client.userName });
  } catch (error) {
    logger.error('Failed to save message', { error, sessionId: client.sessionId });
    sendToClient(client.ws, {
      type: 'error',
      payload: {
        message: 'Failed to send message',
        code: 'INTERNAL_ERROR',
        timestamp: Date.now(),
      },
    });
  }
}

function handlePing(client: WebSocketClient): void {
  sendToClient(client.ws, {
    type: 'pong',
    payload: {
      timestamp: Date.now(),
    },
  });
}

function handleSwitchRoom(client: WebSocketClient, newRoomId: string): void {
  const oldRoomId = client.roomId;

  // Remove from old room
  const oldRoomSet = roomClients.get(oldRoomId);
  if (oldRoomSet) {
    oldRoomSet.delete(client.sessionId);
    if (oldRoomSet.size === 0) {
      roomClients.delete(oldRoomId);
    }
  }

  // Add to new room
  if (!roomClients.has(newRoomId)) {
    roomClients.set(newRoomId, new Set());
  }
  roomClients.get(newRoomId)!.add(client.sessionId);

  client.roomId = newRoomId;

  // Send confirmation
  sendToClient(client.ws, {
    type: 'room_switched',
    payload: {
      previousRoom: oldRoomId,
      newRoom: newRoomId,
      timestamp: Date.now(),
    },
  });

  // Broadcast leave to old room
  broadcastToRoom(oldRoomId, {
    type: 'user_left',
    payload: {
      userName: client.userName,
      roomId: oldRoomId,
      timestamp: Date.now(),
    },
  });

  // Broadcast join to new room
  broadcastToRoom(newRoomId, {
    type: 'user_joined',
    payload: {
      userName: client.userName,
      roomId: newRoomId,
      timestamp: Date.now(),
    },
  }, client.sessionId);

  // Update presence in both rooms
  broadcastPresenceUpdate(oldRoomId);
  broadcastPresenceUpdate(newRoomId);
}

function sendToClient(ws: WebSocket, message: WebSocketMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcastToRoom(
  roomId: string,
  message: WebSocketMessage,
  excludeSessionId?: string
): void {
  const roomSet = roomClients.get(roomId);
  if (!roomSet) return;

  for (const sessionId of roomSet) {
    if (sessionId === excludeSessionId) continue;

    const client = clients.get(sessionId);
    if (client && client.ws.readyState === client.ws.OPEN) {
      sendToClient(client.ws, message);
    }
  }
}

function broadcastPresenceUpdate(roomId: string): void {
  const users = getActiveUsers(roomId);
  
  broadcastToRoom(roomId, {
    type: 'presence_update',
    payload: {
      roomId,
      users,
      count: users.length,
      timestamp: Date.now(),
    },
  });
}

export function getActiveUsers(roomId: string): ActiveUser[] {
  const roomSet = roomClients.get(roomId);
  if (!roomSet) return [];

  const users: ActiveUser[] = [];
  for (const sessionId of roomSet) {
    const client = clients.get(sessionId);
    if (client) {
      users.push({
        userName: client.userName,
        sessionId: client.sessionId,
        roomId: client.roomId,
        joinedAt: client.joinedAt,
        lastActiveAt: client.lastActiveAt,
      });
    }
  }

  return users;
}

export function getActiveUserCount(roomId: string): number {
  const roomSet = roomClients.get(roomId);
  return roomSet ? roomSet.size : 0;
}

export function getAllRoomUserCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const [roomId, roomSet] of roomClients.entries()) {
    counts.set(roomId, roomSet.size);
  }
  return counts;
}

// Cleanup old rate limiter data periodically
setInterval(() => {
  rateLimiter.cleanup();
}, 60000);
