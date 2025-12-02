'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { validateDisplayName } from '@/lib/utils';

interface UserNamePromptProps {
  roomId?: string;
}

export function UserNamePrompt({ roomId }: UserNamePromptProps) {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      
      const trimmed = userName.trim();
      if (!trimmed) return;

      const validation = validateDisplayName(trimmed);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }

      setLoading(true);
      setError(null);

      // Save to session storage
      sessionStorage.setItem('chat_user_name', trimmed);

      // Redirect to room or home
      if (roomId) {
        router.push(`/${roomId}?userName=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/?userName=${encodeURIComponent(trimmed)}`);
      }
    },
    [userName, roomId, router]
  );

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-bg-secondary border border-border rounded-lg p-8 shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome to Real-Time Chat
            </h1>
            <p className="text-text-secondary">
              Choose a display name to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-text-secondary mb-2">
                Display Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your name..."
                maxLength={30}
                required
                autoFocus
                disabled={loading}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-text-muted">
                2-30 characters, letters, numbers, spaces, and hyphens
              </p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error rounded-lg p-3">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !userName.trim()}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium text-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Joining...' : roomId ? 'Join Room' : 'Continue'}
            </button>
          </form>

          {roomId && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-secondary text-center">
                Joining room: <span className="font-medium text-text-primary">#{roomId}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
