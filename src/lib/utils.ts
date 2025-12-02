export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
  
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  if (isToday) {
    return timeString;
  } else if (isYesterday) {
    return `Yesterday ${timeString}`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}

export function validateDisplayName(name: string): { valid: boolean; error?: string } {
  if (name.length < 2) {
    return { valid: false, error: 'Display name must be at least 2 characters' };
  }
  if (name.length > 30) {
    return { valid: false, error: 'Display name must not exceed 30 characters' };
  }
  if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return { valid: false, error: 'Display name can only contain letters, numbers, spaces, and hyphens' };
  }
  return { valid: true };
}

export function generateRoomSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
