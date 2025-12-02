import { getDatabase } from './database';
import type { ChatRoom } from '@/types/room';
import { getMessageCount } from './messages';

export interface RoomRow {
  id: string;
  name: string;
  created_at: number;
}

function rowToRoom(row: RoomRow, messageCount: number, activeUserCount: number): ChatRoom {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    messageCount,
    activeUserCount,
  };
}

export function createRoom(id: string, name: string): ChatRoom {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO rooms (id, name, created_at)
    VALUES (?, ?, ?)
  `);

  const createdAt = Date.now();
  stmt.run(id, name, createdAt);

  return {
    id,
    name,
    createdAt,
    messageCount: 0,
    activeUserCount: 0,
  };
}

export function getRoomById(roomId: string, activeUserCount = 0): ChatRoom | null {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM rooms
    WHERE id = ?
  `);

  const row = stmt.get(roomId) as RoomRow | undefined;
  if (!row) return null;

  const messageCount = getMessageCount(roomId);
  return rowToRoom(row, messageCount, activeUserCount);
}

export function getRoomByName(name: string, activeUserCount = 0): ChatRoom | null {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM rooms
    WHERE name = ?
  `);

  const row = stmt.get(name) as RoomRow | undefined;
  if (!row) return null;

  const messageCount = getMessageCount(row.id);
  return rowToRoom(row, messageCount, activeUserCount);
}

export function getAllRooms(activeUserCounts: Map<string, number> = new Map()): ChatRoom[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM rooms
    ORDER BY created_at DESC
  `);

  const rows = stmt.all() as RoomRow[];
  
  return rows.map(row => {
    const messageCount = getMessageCount(row.id);
    const activeUserCount = activeUserCounts.get(row.id) || 0;
    return rowToRoom(row, messageCount, activeUserCount);
  });
}

export function roomExists(roomId: string): boolean {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT 1 FROM rooms
    WHERE id = ?
  `);

  return stmt.get(roomId) !== undefined;
}

export function deleteEmptyRooms(): number {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    DELETE FROM rooms
    WHERE id NOT IN (
      SELECT DISTINCT room_id FROM messages
    )
  `);

  const result = stmt.run();
  return result.changes;
}

export function validateRoomName(name: string): { valid: boolean; error?: string } {
  if (name.length < 3) {
    return { valid: false, error: 'Room name must be at least 3 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Room name must not exceed 50 characters' };
  }
  if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return { valid: false, error: 'Room name can only contain letters, numbers, spaces, and hyphens' };
  }
  return { valid: true };
}

export function generateRoomId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);
}
