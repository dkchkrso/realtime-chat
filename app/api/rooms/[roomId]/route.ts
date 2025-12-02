import { NextResponse } from 'next/server';
import { getRoomById } from '@/lib/storage/rooms';
import { getMessagesByRoom } from '@/lib/storage/messages';
import { getActiveUsers, getActiveUserCount } from '@/lib/websocket/server';
import { logger } from '@/lib/logger';

// GET /api/rooms/[roomId] - Get room details with messages and active users
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const activeUserCount = getActiveUserCount(roomId);
    const room = getRoomById(roomId, activeUserCount);

    if (!room) {
      return NextResponse.json(
        {
          error: 'Room not found',
          roomId,
        },
        { status: 404 }
      );
    }

    const messages = getMessagesByRoom(roomId, 50);
    const activeUsers = getActiveUsers(roomId);

    return NextResponse.json({
      room,
      messages,
      activeUsers,
    });
  } catch (error) {
    const { roomId } = await params;
    logger.error('Failed to fetch room details', { error, roomId });
    return NextResponse.json(
      { error: 'Failed to fetch room details' },
      { status: 500 }
    );
  }
}
