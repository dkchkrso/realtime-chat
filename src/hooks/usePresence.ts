'use client';

import { useState, useCallback } from 'react';
import type { ActiveUser } from '@/types/session';
import type { WebSocketMessage } from '@/types/websocket';

export function usePresence() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  const handlePresenceUpdate = useCallback((message: WebSocketMessage) => {
    if (message.type === 'presence_update') {
      setActiveUsers(message.payload.users);
    } else if (message.type === 'user_joined') {
      // Optionally handle individual join events
      // but presence_update will provide the full list
    } else if (message.type === 'user_left') {
      // Optionally handle individual leave events
      // but presence_update will provide the full list
    }
  }, []);

  return {
    activeUsers,
    handlePresenceUpdate,
  };
}
