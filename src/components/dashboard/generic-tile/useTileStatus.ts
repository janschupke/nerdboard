import { useState, useCallback, useMemo } from 'react';
import { TileStatus } from './tileStatus';
import type { TileStatusData } from './tileStatus';
import {
  determineTileStatus,
  createTileStatusData,
  getStatusDisplayInfo,
} from '../../../services/tileStatusUtils';

/**
 * Custom hook for managing tile status
 * @param lastRequestResult - The result of the last API request
 * @param hasLocalData - Whether local data is available
 * @param errorMessage - Optional error message
 * @returns Status management object with status, data, display info, and update function
 */
export const useTileStatus = (
  lastRequestResult: TileStatus | null,
  hasLocalData: boolean,
  errorMessage?: string,
) => {
  const [statusData, setStatusData] = useState<TileStatusData>(() =>
    createTileStatusData(lastRequestResult, hasLocalData, errorMessage),
  );

  const updateStatus = useCallback((newStatus: TileStatus, data?: Partial<TileStatusData>) => {
    setStatusData((prev) => ({
      ...prev,
      ...data,
      status: newStatus,
      lastUpdate: new Date(),
    }));
  }, []);

  const status = useMemo(
    () => determineTileStatus(lastRequestResult, hasLocalData),
    [lastRequestResult, hasLocalData],
  );

  const displayInfo = useMemo(() => getStatusDisplayInfo(status), [status]);

  return {
    status,
    statusData,
    displayInfo,
    updateStatus,
  };
};
