import type { Message } from './message';
import type { ActiveUser } from './session';

// Discriminated union for WebSocket messages
export type WebSocketMessage =
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

export interface ConnectionAckPayload {
  sessionId: string;
  userName: string;
  roomId: string;
  timestamp: number;
}

export interface ChatMessagePayload {
  id?: string;
  roomId?: string;
  senderName?: string;
  content: string;
  timestamp: number;
}

export interface MessageSentPayload {
  id: string;
  roomId: string;
  senderName: string;
  content: string;
  timestamp: number;
  status: 'sent';
}

export interface UserEventPayload {
  userName: string;
  roomId: string;
  timestamp: number;
}

export interface PresenceUpdatePayload {
  roomId: string;
  users: ActiveUser[];
  count: number;
  timestamp: number;
}

export interface ConnectionStatusPayload {
  status: 'connected' | 'disconnected' | 'reconnecting';
  message: string;
  timestamp: number;
}

export interface ErrorPayload {
  message: string;
  code: string;
  timestamp?: number;
  retryAfter?: number;
}

export interface PingPayload {
  timestamp: number;
}

export interface PongPayload {
  timestamp: number;
}

export interface SwitchRoomPayload {
  roomId: string;
  timestamp: number;
}

export interface RoomSwitchedPayload {
  previousRoom: string;
  newRoom: string;
  timestamp: number;
}

// Type guard for runtime validation
export function isWebSocketMessage(data: unknown): data is WebSocketMessage {
  if (typeof data !== 'object' || data === null) return false;
  if (!('type' in data) || !('payload' in data)) return false;
  
  const validTypes = [
    'connection_ack',
    'chat_message',
    'message_sent',
    'user_joined',
    'user_left',
    'presence_update',
    'connection_status',
    'error',
    'ping',
    'pong',
    'switch_room',
    'room_switched',
  ];
  return validTypes.includes((data as { type: string }).type);
}
