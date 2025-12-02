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
