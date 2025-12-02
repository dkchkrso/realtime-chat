import type { Message } from './message';

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
