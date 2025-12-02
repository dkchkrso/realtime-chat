'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface CreateRoomProps {
  userName?: string;
}

export function CreateRoom({ userName }: CreateRoomProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      
      const trimmedName = name.trim();
      if (!trimmedName) return;

      if (trimmedName.length < 3) {
        setError('Room name must be at least 3 characters');
        return;
      }

      if (trimmedName.length > 50) {
        setError('Room name must not exceed 50 characters');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: trimmedName }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            setError('A room with this name already exists');
            // Redirect to existing room
            if (userName) {
              router.push(`/${data.roomId}?userName=${encodeURIComponent(userName)}`);
            } else {
              router.push(`/join?room=${data.roomId}`);
            }
            return;
          }
          setError(data.message || data.error || 'Failed to create room');
          return;
        }

        // Success - redirect to new room
        if (userName) {
          router.push(`/${data.room.id}?userName=${encodeURIComponent(userName)}`);
        } else {
          router.push(`/join?room=${data.room.id}`);
        }
        router.refresh();
      } catch (err) {
        console.error('Failed to create room:', err);
        setError('Failed to create room. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [name, userName, router]
  );

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Create New Room</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-text-secondary mb-2">
            Room Name
          </label>
          <input
            id="roomName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., General Discussion"
            maxLength={50}
            required
            disabled={loading}
            className="w-full px-4 py-2 border border-border rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-text-muted">
            3-50 characters, letters, numbers, spaces, and hyphens
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
}
