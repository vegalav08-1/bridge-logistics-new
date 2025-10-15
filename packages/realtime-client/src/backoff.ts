/**
 * Exponential backoff with jitter for reconnection attempts
 */

export interface BackoffConfig {
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  maxAttempts: number; // Maximum number of attempts
  jitter: boolean; // Add random jitter to prevent thundering herd
}

export class ExponentialBackoff {
  private attempt = 0;
  private config: BackoffConfig;

  constructor(config: Partial<BackoffConfig> = {}) {
    this.config = {
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      maxAttempts: 10,
      jitter: true,
      ...config,
    };
  }

  /**
   * Get the next delay in milliseconds
   */
  next(): number | null {
    if (this.attempt >= this.config.maxAttempts) {
      return null; // No more attempts
    }

    const delay = Math.min(
      this.config.baseDelay * Math.pow(2, this.attempt),
      this.config.maxDelay
    );

    let finalDelay = delay;
    if (this.config.jitter) {
      // Add ±25% jitter
      const jitterRange = delay * 0.25;
      finalDelay = delay + (Math.random() * 2 - 1) * jitterRange;
    }

    this.attempt++;
    return Math.max(0, Math.floor(finalDelay));
  }

  /**
   * Reset the backoff counter
   */
  reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  getAttempt(): number {
    return this.attempt;
  }

  /**
   * Check if we've reached max attempts
   */
  isExhausted(): boolean {
    return this.attempt >= this.config.maxAttempts;
  }
}




