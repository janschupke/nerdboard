import type { AppError } from '../types/errors';

export class ErrorHandler {
  private static errors: AppError[] = [];
  private static listeners: ((error: AppError) => void)[] = [];

  static addError(error: Omit<AppError, 'id' | 'timestamp'>): string {
    const appError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    this.errors.push(appError);
    this.notifyListeners(appError);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Application Error:', appError);
    }

    return appError.id;
  }

  static getErrors(): AppError[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static addListener(listener: (error: AppError) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
}

// Error retry utility
export function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        attempts++;

        if (attempts >= maxRetries) {
          reject(error);
          return;
        }

        setTimeout(attempt, delay * attempts);
      }
    };

    attempt();
  });
}
