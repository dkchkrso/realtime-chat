'use client';

import type { ConnectionStatus as Status } from '@/types/session';

interface ConnectionStatusProps {
  status: Status;
  userName?: string;
}

export function ConnectionStatus({ status, userName }: ConnectionStatusProps) {
  const config = {
    connecting: {
      color: 'bg-warning',
      text: 'Connecting...',
      pulse: true,
    },
    connected: {
      color: 'bg-success',
      text: 'Connected',
      pulse: false,
    },
    disconnected: {
      color: 'bg-error',
      text: 'Disconnected',
      pulse: false,
    },
    reconnecting: {
      color: 'bg-warning',
      text: 'Reconnecting...',
      pulse: true,
    },
  };

  const { color, text, pulse } = config[status];

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-lg">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        {pulse && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${color} animate-ping opacity-75`} />
        )}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary">{text}</span>
        {userName && status === 'connected' && (
          <span className="text-text-primary font-medium">• {userName}</span>
        )}
      </div>
    </div>
  );
}
