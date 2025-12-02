'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ChatRoom } from '@/types/room';

interface RoomListProps {
  initialRooms: ChatRoom[];
  userName?: string;
}

export function RoomList({ initialRooms, userName }: RoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
  const [loading, setLoading] = useState(false);

  const refreshRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-bg-secondary rounded-lg p-6 h-32" />
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted text-lg mb-4">No chat rooms available yet.</p>
        <p className="text-text-secondary">Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={userName ? `/${room.id}?userName=${encodeURIComponent(userName)}` : `/join?room=${room.id}`}
          className="group block bg-bg-secondary hover:bg-bg-chat border border-border rounded-lg p-6 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
              {room.name}
            </h3>
            {room.activeUserCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                {room.activeUserCount} online
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mb-3">#{room.id}</p>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>{room.messageCount} messages</span>
            <span className="text-primary group-hover:underline">Join →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
