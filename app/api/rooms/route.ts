import { NextResponse } from 'next/server';
import {
  getAllRooms,
  createRoom,
  generateRoomId,
  validateRoomName,
  getRoomByName,
} from '@/lib/storage/rooms';
import { getAllRoomUserCounts } from '@/lib/websocket/server';
import { logger } from '@/lib/logger';

// GET /api/rooms - List all chat rooms
export async function GET() {
  try {
    const activeUserCounts = getAllRoomUserCounts();
    const rooms = getAllRooms(activeUserCounts);

    return NextResponse.json({
      rooms,
      total: rooms.length,
    });
  } catch (error) {
    logger.error('Failed to fetch rooms', { error });
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new chat room
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    // Validate room name
    const validation = validateRoomName(name);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid room name',
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // Check if room already exists
    const existingRoom = getRoomByName(name);
    if (existingRoom) {
      return NextResponse.json(
        {
          error: 'Room already exists',
          roomId: existingRoom.id,
        },
        { status: 409 }
      );
    }

    // Create room
    const roomId = generateRoomId(name);
    const room = createRoom(roomId, name);

    logger.info('Room created', { roomId, name });

    return NextResponse.json(
      { room },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to create room', { error });
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
