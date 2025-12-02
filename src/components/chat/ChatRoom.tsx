'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Message } from '@/types/message';
import type { ActiveUser } from '@/types/session';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { UserPresence } from './UserPresence';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  userName: string;
  initialMessages: Message[];
  initialActiveUsers?: ActiveUser[];
}

export function ChatRoom({ roomId, roomName, userName, initialMessages, initialActiveUsers = [] }: ChatRoomProps) {
  const [error, setError] = useState<string | null>(null);
  
  const { messages, handleWebSocketMessage, addQueuedMessage } = useMessages(initialMessages);
  const { activeUsers, handlePresenceUpdate } = usePresence();

  const handleMessage = useCallback(
    (wsMessage: any) => {
      if (wsMessage.type === 'error') {
        setError(wsMessage.payload.message);
        setTimeout(() => setError(null), 5000);
      }
      handleWebSocketMessage(wsMessage);
      handlePresenceUpdate(wsMessage);
    },
    [handleWebSocketMessage, handlePresenceUpdate]
  );

  const { connectionStatus, sendMessage } = useWebSocket({
    roomId,
    userName,
    onMessage: handleMessage,
  });

  const handleSendMessage = useCallback(
    (content: string) => {
      if (connectionStatus === 'connected') {
        sendMessage(content);
      } else {
        addQueuedMessage(content, userName, roomId);
        sendMessage(content); // Will be queued by WebSocket client
      }
    },
    [connectionStatus, sendMessage, addQueuedMessage, userName, roomId]
  );

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-bg-secondary px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{roomName}</h1>
              <p className="text-sm text-text-muted">#{roomId}</p>
            </div>
            <ConnectionStatus status={connectionStatus} userName={userName} />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-error/10 border-b border-error px-6 py-3">
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Messages */}
        <MessageList messages={messages} currentUserName={userName} />

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={connectionStatus === 'disconnected'}
        />
      </div>

      {/* Sidebar - Active Users */}
      <div className="hidden md:block w-64 lg:w-80 border-l border-border bg-bg-secondary p-4 overflow-y-auto">
        <UserPresence users={activeUsers} currentUserName={userName} />
      </div>
    </div>
  );
}
