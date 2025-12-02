import { getDatabase } from './database';
import type { Message } from '@/types/message';

export interface MessageRow {
  id: string;
  room_id: string;
  sender_name: string;
  content: string;
  timestamp: number;
  created_at: number;
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    roomId: row.room_id,
    senderName: row.sender_name,
    content: row.content,
    timestamp: row.timestamp,
  };
}

export function createMessage(message: Omit<Message, 'status'>): Message {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO messages (id, room_id, sender_name, content, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    message.id,
    message.roomId,
    message.senderName,
    message.content,
    message.timestamp
  );

  return message;
}

export function getMessagesByRoom(roomId: string, limit = 50): Message[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM messages
    WHERE room_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `);

  const rows = stmt.all(roomId, limit) as MessageRow[];
  return rows.reverse().map(rowToMessage);
}

export function getMessageById(messageId: string): Message | null {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM messages
    WHERE id = ?
  `);

  const row = stmt.get(messageId) as MessageRow | undefined;
  return row ? rowToMessage(row) : null;
}

export function getMessageCount(roomId: string): number {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM messages
    WHERE room_id = ?
  `);

  const result = stmt.get(roomId) as { count: number };
  return result.count;
}

export function deleteOldMessages(maxAgeMs: number): number {
  const db = getDatabase();
  const cutoffTimestamp = Date.now() - maxAgeMs;
  
  const stmt = db.prepare(`
    DELETE FROM messages
    WHERE timestamp < ?
  `);

  const result = stmt.run(cutoffTimestamp);
  return result.changes;
}

export function deleteOldMessagesInRoom(roomId: string, keepCount = 1000): number {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    DELETE FROM messages
    WHERE room_id = ?
    AND id NOT IN (
      SELECT id FROM messages
      WHERE room_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    )
  `);

  const result = stmt.run(roomId, roomId, keepCount);
  return result.changes;
}
