/**
 * retryPolicy.ts
 * -------------------------------------------------
 * Phase 10 (Continuation): Retry Policy Engine
 *
 * Determines retry behavior for failed event execution.
 */

export type RetryContext = {
  eventId: string;
  attempt: number;
  error: any;
};

export class RetryPolicy {
  private maxRetries: number;

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  /**
   * Determine if event should be retried
   */
  shouldRetry(ctx: RetryContext): boolean {
    return ctx.attempt < this.maxRetries;
  }

  /**
   * Exponential backoff delay
   */
  getDelayMs(attempt: number): number {
    const base = 200;
    return Math.min(base * Math.pow(2, attempt), 5000);
  }
}