import { TileStatus } from '../components/dashboard/generic-tile/tileStatus';
import type { TileStatusData } from '../components/dashboard/generic-tile/tileStatus';

/**
 * Determines the tile status based on request result and data availability
 * @param lastRequestResult - The result of the last API request
 * @param hasLocalData - Whether local data is available
 * @returns The determined tile status
 */
export const determineTileStatus = (
  lastRequestResult: 'success' | 'error' | 'failure' | null,
  hasLocalData: boolean,
): TileStatus => {
  if (lastRequestResult === 'success' && hasLocalData) {
    return TileStatus.OK;
  }

  if (lastRequestResult === 'error' || lastRequestResult === 'failure') {
    return hasLocalData ? TileStatus.STALE : TileStatus.ERROR;
  }

  return TileStatus.ERROR;
};

/**
 * Creates tile status data with the given parameters
 * @param lastRequestResult - The result of the last API request
 * @param hasLocalData - Whether local data is available
 * @param errorMessage - Optional error message
 * @returns Tile status data object
 */
export const createTileStatusData = (
  lastRequestResult: 'success' | 'error' | 'failure' | null,
  hasLocalData: boolean,
  errorMessage?: string,
): TileStatusData => {
  const status = determineTileStatus(lastRequestResult, hasLocalData);

  return {
    status,
    lastRequestResult,
    hasLocalData,
    lastUpdate: new Date(),
    errorMessage,
  };
};

/**
 * Gets display information for a tile status
 * @param status - The tile status
 * @returns Display information including color, message, and icon
 */
export const getStatusDisplayInfo = (status: TileStatus) => {
  switch (status) {
    case TileStatus.OK:
      return {
        color: 'var(--color-success-500)',
        message: 'Data is fresh and reliable',
        icon: '✓',
      };
    case TileStatus.STALE:
      return {
        color: 'var(--color-warning-500)',
        message: 'Data may be outdated',
        icon: '⚠',
      };
    case TileStatus.ERROR:
      return {
        color: 'var(--color-error-500)',
        message: 'Data unavailable',
        icon: '✗',
      };
    default:
      return {
        color: 'var(--color-theme-secondary)',
        message: 'Status unknown',
        icon: '?',
      };
  }
};
