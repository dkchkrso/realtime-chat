// Token bucket rate limiter
// Default: 10 messages per minute per session

export class RateLimiter {
  private limits: Map<string, number[]> = new Map();
  private maxMessages: number;
  private windowMs: number;

  constructor(maxMessages = 10, windowMs = 60000) {
    this.maxMessages = maxMessages;
    this.windowMs = windowMs;
  }

  checkLimit(sessionId: string): boolean {
    const now = Date.now();
    const timestamps = this.limits.get(sessionId) || [];

    // Remove timestamps older than the window
    const recentTimestamps = timestamps.filter(t => now - t < this.windowMs);

    if (recentTimestamps.length >= this.maxMessages) {
      return false; // Rate limit exceeded
    }

    recentTimestamps.push(now);
    this.limits.set(sessionId, recentTimestamps);
    return true;
  }

  getRemainingMessages(sessionId: string): number {
    const now = Date.now();
    const timestamps = this.limits.get(sessionId) || [];
    const recentTimestamps = timestamps.filter(t => now - t < this.windowMs);
    return Math.max(0, this.maxMessages - recentTimestamps.length);
  }

  getRetryAfter(sessionId: string): number {
    const timestamps = this.limits.get(sessionId) || [];
    if (timestamps.length === 0) return 0;

    const now = Date.now();
    const oldestTimestamp = timestamps[0];
    if (!oldestTimestamp) return 0;
    
    const retryAfter = this.windowMs - (now - oldestTimestamp);
    return Math.max(0, retryAfter);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, timestamps] of this.limits.entries()) {
      const recentTimestamps = timestamps.filter(t => now - t < this.windowMs);
      if (recentTimestamps.length === 0) {
        this.limits.delete(sessionId);
      } else {
        this.limits.set(sessionId, recentTimestamps);
      }
    }
  }
}
