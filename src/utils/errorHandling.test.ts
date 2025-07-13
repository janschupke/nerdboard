import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler, withRetry } from './errorHandling';

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.clearErrors();
  });

  describe('addError', () => {
    it('should add an error with generated id and timestamp', () => {
      const error = {
        message: 'Test error',
        type: 'api' as const,
        severity: 'high' as const,
      };

      const errorId = ErrorHandler.addError(error);
      const errors = ErrorHandler.getErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Test error',
        type: 'api',
        severity: 'high',
      });
      expect(errors[0].id).toBeDefined();
      expect(errors[0].timestamp).toBeDefined();
      expect(errorId).toBe(errors[0].id);
    });

    it('should generate unique ids for different errors', () => {
      const error1 = { message: 'Error 1', type: 'api' as const, severity: 'high' as const };
      const error2 = { message: 'Error 2', type: 'api' as const, severity: 'high' as const };

      const id1 = ErrorHandler.addError(error1);
      const id2 = ErrorHandler.addError(error2);

      expect(id1).not.toBe(id2);
    });
  });

  describe('getErrors', () => {
    it('should return a copy of errors array', () => {
      const error = { message: 'Test', type: 'api' as const, severity: 'high' as const };
      ErrorHandler.addError(error);

      const errors1 = ErrorHandler.getErrors();
      const errors2 = ErrorHandler.getErrors();

      expect(errors1).toEqual(errors2);
      expect(errors1).not.toBe(errors2); // Should be different references
    });

    it('should return empty array when no errors', () => {
      const errors = ErrorHandler.getErrors();
      expect(errors).toEqual([]);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const error = { message: 'Test', type: 'api' as const, severity: 'high' as const };
      ErrorHandler.addError(error);

      expect(ErrorHandler.getErrors()).toHaveLength(1);

      ErrorHandler.clearErrors();

      expect(ErrorHandler.getErrors()).toHaveLength(0);
    });
  });

  describe('addListener', () => {
    it('should add a listener and return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = ErrorHandler.addListener(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call listener when error is added', () => {
      const listener = vi.fn();
      ErrorHandler.addListener(listener);

      const error = { message: 'Test', type: 'api' as const, severity: 'high' as const };
      ErrorHandler.addError(error);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test',
          type: 'api',
          severity: 'high',
        }),
      );
    });

    it('should allow unsubscribing from listener', () => {
      const listener = vi.fn();
      const unsubscribe = ErrorHandler.addListener(listener);

      const error = { message: 'Test', type: 'api' as const, severity: 'high' as const };
      ErrorHandler.addError(error);

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      ErrorHandler.addError({ message: 'Test 2', type: 'api' as const, severity: 'high' as const });

      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should handle listener errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      ErrorHandler.addListener(errorListener);

      const error = { message: 'Test', type: 'api' as const, severity: 'high' as const };
      ErrorHandler.addError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Error in error listener:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('console logging', () => {
    it('should log errors in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock development environment
      vi.stubEnv('DEV', true);

      const error = { message: 'Test', type: 'api' as const, severity: 'high' as const };
      ErrorHandler.addError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining(error));

      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });
});

describe('withRetry', () => {
  it('should resolve immediately on success', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    const result = await withRetry(fn, 3, 10);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should reject after max retries', async () => {
    const error = new Error('Permanent failure');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, 2, 10)).rejects.toThrow('Permanent failure');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should use default retry parameters', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Failure'));

    await expect(withRetry(fn)).rejects.toThrow('Failure');
    expect(fn).toHaveBeenCalledTimes(3); // Default maxRetries is 3
  });

  it('should increase delay between retries', async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    const startTime = Date.now();
    await withRetry(fn, 3, 50);
    const endTime = Date.now();

    // Should have some delay between retries
    expect(endTime - startTime).toBeGreaterThan(50);
  });
});
