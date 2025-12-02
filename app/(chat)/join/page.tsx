import { UserNamePrompt } from '@/components/chat/UserNamePrompt';

interface JoinPageProps {
  searchParams: Promise<{
    room?: string;
  }>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { room } = await searchParams;

  return <UserNamePrompt roomId={room} />;
}

export const metadata = {
  title: 'Join - Real-Time Chat',
  description: 'Enter your display name to join the chat',
};
