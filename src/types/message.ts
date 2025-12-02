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
