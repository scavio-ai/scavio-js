export class RateLimiter {
  private readonly maxPerSecond: number;
  private readonly timestamps: number[] = [];
  private pending: Promise<void> = Promise.resolve();

  constructor(maxPerSecond: number) {
    this.maxPerSecond = maxPerSecond;
  }

  async wait(): Promise<void> {
    const ticket = this.pending.then(() => this.acquire());
    this.pending = ticket;
    return ticket;
  }

  private async acquire(): Promise<void> {
    this.cleanup();
    if (this.timestamps.length >= this.maxPerSecond) {
      const sleepMs = 1000 - (Date.now() - this.timestamps[0]!);
      if (sleepMs > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, sleepMs));
      }
      this.cleanup();
    }
    this.timestamps.push(Date.now());
  }

  private cleanup(): void {
    const now = Date.now();
    while (this.timestamps.length > 0 && now - this.timestamps[0]! >= 1000) {
      this.timestamps.shift();
    }
  }
}
