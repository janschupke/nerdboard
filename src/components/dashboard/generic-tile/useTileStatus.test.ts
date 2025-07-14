import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TileStatus } from '../../../types/tileStatus';
import { useTileStatus } from './useTileStatus';

describe('useTileStatus', () => {
  it('should initialize with correct status for successful request with data', () => {
    const { result } = renderHook(() => useTileStatus('success', true, 'Test error'));

    expect(result.current.status).toBe(TileStatus.OK);
    expect(result.current.statusData.lastRequestResult).toBe('success');
    expect(result.current.statusData.hasLocalData).toBe(true);
    expect(result.current.statusData.errorMessage).toBe('Test error');
    expect(result.current.displayInfo.message).toBe('Data is fresh and reliable');
  });

  it('should initialize with STALE status for failed request with local data', () => {
    const { result } = renderHook(() => useTileStatus('error', true));

    expect(result.current.status).toBe(TileStatus.STALE);
    expect(result.current.statusData.lastRequestResult).toBe('error');
    expect(result.current.statusData.hasLocalData).toBe(true);
    expect(result.current.displayInfo.message).toBe('Data may be outdated');
  });

  it('should initialize with ERROR status for failed request without local data', () => {
    const { result } = renderHook(() => useTileStatus('failure', false));

    expect(result.current.status).toBe(TileStatus.ERROR);
    expect(result.current.statusData.lastRequestResult).toBe('failure');
    expect(result.current.statusData.hasLocalData).toBe(false);
    expect(result.current.displayInfo.message).toBe('Data unavailable');
  });

  it('should update status when updateStatus is called', () => {
    const { result } = renderHook(() => useTileStatus('success', true));

    expect(result.current.status).toBe(TileStatus.OK);

    act(() => {
      result.current.updateStatus(TileStatus.ERROR, { errorMessage: 'New error' });
    });

    expect(result.current.statusData.status).toBe(TileStatus.ERROR);
    expect(result.current.statusData.errorMessage).toBe('New error');
    expect(result.current.statusData.lastUpdate).toBeInstanceOf(Date);
  });

  it('should update status data when updateStatus is called with partial data', () => {
    const { result } = renderHook(() => useTileStatus('error', false));

    const originalUpdateTime = result.current.statusData.lastUpdate;

    act(() => {
      result.current.updateStatus(TileStatus.STALE, {
        lastRequestResult: 'success',
        hasLocalData: true,
      });
    });

    expect(result.current.statusData.status).toBe(TileStatus.STALE);
    expect(result.current.statusData.lastRequestResult).toBe('success');
    expect(result.current.statusData.hasLocalData).toBe(true);
    expect(result.current.statusData.lastUpdate).toBeInstanceOf(Date);
    expect(result.current.statusData.lastUpdate).not.toBe(originalUpdateTime);
  });

  it('should return correct display info for different statuses', () => {
    const { result: okResult } = renderHook(() => useTileStatus('success', true));

    expect(okResult.current.displayInfo.color).toBe('var(--color-success-500)');
    expect(okResult.current.displayInfo.icon).toBe('✓');

    const { result: staleResult } = renderHook(() => useTileStatus('error', true));

    expect(staleResult.current.displayInfo.color).toBe('var(--color-warning-500)');
    expect(staleResult.current.displayInfo.icon).toBe('⚠');

    const { result: errorResult } = renderHook(() => useTileStatus('failure', false));

    expect(errorResult.current.displayInfo.color).toBe('var(--color-error-500)');
    expect(errorResult.current.displayInfo.icon).toBe('✗');
  });

  it('should memoize status and display info', () => {
    const { result, rerender } = renderHook(() => useTileStatus('success', true));

    const initialStatus = result.current.status;
    const initialDisplayInfo = result.current.displayInfo;

    // Rerender with same props
    rerender();

    expect(result.current.status).toBe(initialStatus);
    expect(result.current.displayInfo).toBe(initialDisplayInfo);
  });
});
