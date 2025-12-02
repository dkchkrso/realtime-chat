import { notFound, redirect } from 'next/navigation';
import { getRoomById } from '@/lib/storage/rooms';
import { getMessagesByRoom } from '@/lib/storage/messages';
import { ChatRoom } from '@/components/chat/ChatRoom';

interface ChatRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
  searchParams: Promise<{
    userName?: string;
  }>;
}

export default async function ChatRoomPage({ params, searchParams }: ChatRoomPageProps) {
  const { roomId } = await params;
  const { userName } = await searchParams;

  // Redirect to username prompt if no username
  if (!userName) {
    redirect(`/join?room=${roomId}`);
  }

  // Fetch room data
  const room = getRoomById(roomId);
  if (!room) {
    notFound();
  }

  // Fetch recent messages
  const messages = getMessagesByRoom(roomId, 50);

  return (
    <ChatRoom
      roomId={roomId}
      roomName={room.name}
      userName={userName}
      initialMessages={messages}
    />
  );
}

export async function generateMetadata({ params }: ChatRoomPageProps) {
  const { roomId } = await params;
  const room = getRoomById(roomId);
  
  return {
    title: room ? `${room.name} - Real-Time Chat` : 'Chat Room',
    description: `Join the ${room?.name || 'chat room'} conversation`,
  };
}
