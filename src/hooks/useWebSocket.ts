'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatWebSocket } from '@/lib/websocket/client';
import type { WebSocketMessage } from '@/types/websocket';
import type { ConnectionStatus } from '@/types/session';

interface UseWebSocketOptions {
  roomId: string;
  userName: string;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket({ roomId, userName, onMessage }: UseWebSocketOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<ChatWebSocket | null>(null);

  const handleStateChange = useCallback((state: ConnectionStatus) => {
    setConnectionStatus(state);
  }, []);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      if (onMessage) {
        onMessage(message);
      }
    },
    [onMessage]
  );

  const handleError = useCallback((error: Error) => {
    console.error('[useWebSocket] Error:', error);
  }, []);

  useEffect(() => {
    if (!roomId || !userName) {
      return;
    }

    const ws = new ChatWebSocket({
      roomId,
      userName,
      onMessage: handleMessage,
      onStateChange: handleStateChange,
      onError: handleError,
    });

    ws.connect();
    wsRef.current = ws;

    return () => {
      ws.disconnect();
      wsRef.current = null;
    };
  }, [roomId, userName, handleMessage, handleStateChange, handleError]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current) {
      wsRef.current.sendMessage(content);
    }
  }, []);

  const switchRoom = useCallback((newRoomId: string) => {
    if (wsRef.current) {
      wsRef.current.switchRoom(newRoomId);
    }
  }, []);

  return {
    connectionStatus,
    sendMessage,
    switchRoom,
    sessionId: wsRef.current?.getSessionId() || null,
  };
}
