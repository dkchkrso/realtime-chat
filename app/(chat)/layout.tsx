import Link from 'next/link';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {children}
    </div>
  );
}
