'use client';

import type { ActiveUser } from '@/types/session';

interface UserPresenceProps {
  users: ActiveUser[];
  currentUserName: string;
}

export function UserPresence({ users, currentUserName }: UserPresenceProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-text-muted text-sm">No active users</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Active Users
        </h3>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success text-xs font-bold">
          {users.length}
        </span>
      </div>
      
      <div className="space-y-1">
        {users.map((user) => {
          const isCurrentUser = user.userName === currentUserName;
          
          return (
            <div
              key={user.sessionId}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-chat transition-colors"
            >
              {/* Avatar with initials */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isCurrentUser ? 'bg-primary text-white' : 'bg-secondary/20 text-secondary'
              }`}>
                {user.userName.substring(0, 2).toUpperCase()}
              </div>
              
              {/* User name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isCurrentUser ? 'text-primary' : 'text-text-primary'
                }`}>
                  {user.userName}
                  {isCurrentUser && ' (You)'}
                </p>
              </div>

              {/* Online indicator */}
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-success" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
