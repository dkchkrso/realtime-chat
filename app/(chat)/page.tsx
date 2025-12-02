import { getAllRooms } from '@/lib/storage/rooms';
import { getAllRoomUserCounts } from '@/lib/websocket/server';
import { RoomList } from '@/components/rooms/RoomList';
import { CreateRoom } from '@/components/rooms/CreateRoom';

interface HomePageProps {
  searchParams: Promise<{
    userName?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { userName } = await searchParams;
  
  // Fetch all rooms with active user counts
  const activeUserCounts = getAllRoomUserCounts();
  const rooms = getAllRooms(activeUserCounts);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Real-Time Chat</h1>
          <p className="text-text-secondary">
            Join a room or create your own to start chatting
            {userName && (
              <span className="text-primary font-medium"> as {userName}</span>
            )}
          </p>
        </div>

        {/* Create Room Section */}
        <div className="mb-8">
          <CreateRoom userName={userName} />
        </div>

        {/* Available Rooms */}
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Available Rooms ({rooms.length})
          </h2>
          <RoomList initialRooms={rooms} userName={userName} />
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Real-Time Chat - Home',
  description: 'Join or create chat rooms for real-time conversations',
};
