import { describe, it, expect } from 'vitest';
import { TileStatus } from '../types/tileStatus';
import { determineTileStatus, createTileStatusData, getStatusDisplayInfo } from './tileStatusUtils';

describe('determineTileStatus', () => {
  it('should return OK when request is successful and data exists', () => {
    expect(determineTileStatus('success', true)).toBe(TileStatus.OK);
  });

  it('should return STALE when request fails but local data exists', () => {
    expect(determineTileStatus('error', true)).toBe(TileStatus.STALE);
    expect(determineTileStatus('failure', true)).toBe(TileStatus.STALE);
  });

  it('should return ERROR when request fails and no local data', () => {
    expect(determineTileStatus('error', false)).toBe(TileStatus.ERROR);
    expect(determineTileStatus('failure', false)).toBe(TileStatus.ERROR);
  });

  it('should return ERROR when no request result and no local data', () => {
    expect(determineTileStatus(null, false)).toBe(TileStatus.ERROR);
  });

  it('should return ERROR when no request result but local data exists', () => {
    expect(determineTileStatus(null, true)).toBe(TileStatus.ERROR);
  });
});

describe('createTileStatusData', () => {
  it('should create status data with correct values', () => {
    const result = createTileStatusData('success', true, 'Test error');

    expect(result.status).toBe(TileStatus.OK);
    expect(result.lastRequestResult).toBe('success');
    expect(result.hasLocalData).toBe(true);
    expect(result.errorMessage).toBe('Test error');
    expect(result.lastUpdate).toBeInstanceOf(Date);
  });

  it('should create status data without error message', () => {
    const result = createTileStatusData('error', false);

    expect(result.status).toBe(TileStatus.ERROR);
    expect(result.lastRequestResult).toBe('error');
    expect(result.hasLocalData).toBe(false);
    expect(result.errorMessage).toBeUndefined();
    expect(result.lastUpdate).toBeInstanceOf(Date);
  });

  it('should create stale status data', () => {
    const result = createTileStatusData('failure', true);

    expect(result.status).toBe(TileStatus.STALE);
    expect(result.lastRequestResult).toBe('failure');
    expect(result.hasLocalData).toBe(true);
  });
});

describe('getStatusDisplayInfo', () => {
  it('should return correct display info for OK status', () => {
    const result = getStatusDisplayInfo(TileStatus.OK);

    expect(result.color).toBe('var(--color-success-500)');
    expect(result.message).toBe('Data is fresh and reliable');
    expect(result.icon).toBe('✓');
  });

  it('should return correct display info for STALE status', () => {
    const result = getStatusDisplayInfo(TileStatus.STALE);

    expect(result.color).toBe('var(--color-warning-500)');
    expect(result.message).toBe('Data may be outdated');
    expect(result.icon).toBe('⚠');
  });

  it('should return correct display info for ERROR status', () => {
    const result = getStatusDisplayInfo(TileStatus.ERROR);

    expect(result.color).toBe('var(--color-error-500)');
    expect(result.message).toBe('Data unavailable');
    expect(result.icon).toBe('✗');
  });

  it('should return default display info for unknown status', () => {
    const result = getStatusDisplayInfo('UNKNOWN' as TileStatus);

    expect(result.color).toBe('var(--color-theme-secondary)');
    expect(result.message).toBe('Status unknown');
    expect(result.icon).toBe('?');
  });
});
