'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Message } from '@/types/message';
import type { WebSocketMessage } from '@/types/websocket';

export function useMessages(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Update when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Check if message already exists
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: Message['status']) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status } : m))
    );
  }, []);

  const addQueuedMessage = useCallback((content: string, senderName: string, roomId: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      roomId,
      senderName,
      content,
      timestamp: Date.now(),
      status: 'sending',
    };
    addMessage(message);
    return message;
  }, [addMessage]);

  const handleWebSocketMessage = useCallback(
    (wsMessage: WebSocketMessage) => {
      switch (wsMessage.type) {
        case 'chat_message':
          addMessage({
            id: wsMessage.payload.id!,
            roomId: wsMessage.payload.roomId!,
            senderName: wsMessage.payload.senderName!,
            content: wsMessage.payload.content,
            timestamp: wsMessage.payload.timestamp,
            status: 'sent',
          });
          break;
        case 'message_sent':
          addMessage({
            id: wsMessage.payload.id,
            roomId: wsMessage.payload.roomId,
            senderName: wsMessage.payload.senderName,
            content: wsMessage.payload.content,
            timestamp: wsMessage.payload.timestamp,
            status: 'sent',
          });
          break;
        default:
          break;
      }
    },
    [addMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    updateMessageStatus,
    addQueuedMessage,
    handleWebSocketMessage,
    clearMessages,
  };
}
