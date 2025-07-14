import type { FederalFundsRateData } from '../federal-funds-rate/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';
import { useCallback } from 'react';
import { FRED_SERIES_OBSERVATIONS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { FredSeriesObservationsParams } from '../../../services/apiEndpoints';

/**
 * Fetches Federal Funds Rate data from FRED.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for FRED series observations endpoint
 * @returns Promise<FederalFundsRateData>
 */
export function useFederalFundsApi() {
  const getFederalFundsRate = useCallback(async (tileId: string, params: FredSeriesObservationsParams): Promise<FederalFundsRateData> => {
    const url = buildApiUrl(FRED_SERIES_OBSERVATIONS_ENDPOINT, params);
    try {
      const result = await DataFetcher.fetchWithRetry<FederalFundsRateData>(
        () => fetch(url).then(res => res.json()),
        tileId
      );
      storageManager.setTileConfig(tileId, {
        data: result.data as unknown as Record<string, unknown>,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: !result.error,
      });
      if (result.error) throw new Error(result.error);
      return result.data as FederalFundsRateData;
    } catch (error) {
      storageManager.setTileConfig(tileId, {
        data: null,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      });
      throw error;
    }
  }, []);
  return { getFederalFundsRate };
} 
