import type { WebSocketMessage } from '@/types/websocket';
import type { Message } from '@/types/message';

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface WebSocketClientOptions {
  roomId: string;
  userName: string;
  onMessage?: (message: WebSocketMessage) => void;
  onStateChange?: (state: ConnectionState) => void;
  onError?: (error: Error) => void;
}

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private messageQueue: Message[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  private options: WebSocketClientOptions;
  private sessionId: string | null = null;

  constructor(options: WebSocketClientOptions) {
    this.options = options;
  }

  connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') {
      return;
    }

    this.updateState('connecting');
    
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
    const url = `${protocol}//${host}/api/websocket?room=${encodeURIComponent(this.options.roomId)}&userName=${encodeURIComponent(this.options.userName)}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.updateState('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();
      };

      this.ws.onclose = () => {
        this.updateState('disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = (event) => {
        console.error('[WebSocket] Connection error', event);
        if (this.options.onError) {
          this.options.onError(new Error('WebSocket connection error'));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Store sessionId from connection_ack
          if (message.type === 'connection_ack') {
            this.sessionId = message.payload.sessionId;
          }

          if (this.options.onMessage) {
            this.options.onMessage(message);
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message', error);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create WebSocket', error);
      this.updateState('disconnected');
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.maxReconnectAttempts = 0; // Prevent reconnection
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState('disconnected');
  }

  sendMessage(content: string): void {
    const message: WebSocketMessage = {
      type: 'chat_message',
      payload: {
        content,
        timestamp: Date.now(),
      },
    };

    if (this.state === 'connected' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue for later
      const queuedMessage: Message = {
        id: crypto.randomUUID(),
        roomId: this.options.roomId,
        senderName: this.options.userName,
        content,
        timestamp: Date.now(),
        status: 'sending',
      };
      this.messageQueue.push(queuedMessage);
    }
  }

  switchRoom(roomId: string): void {
    const message: WebSocketMessage = {
      type: 'switch_room',
      payload: {
        roomId,
        timestamp: Date.now(),
      },
    };

    if (this.state === 'connected' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      this.options.roomId = roomId;
    }
  }

  getState(): ConnectionState {
    return this.state;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  private updateState(newState: ConnectionState): void {
    this.state = newState;
    if (this.options.onStateChange) {
      this.options.onStateChange(newState);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.updateState('reconnecting');
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.sendMessage(message.content);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const ping: WebSocketMessage = {
          type: 'ping',
          payload: {
            timestamp: Date.now(),
          },
        };
        this.ws.send(JSON.stringify(ping));
      }
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
