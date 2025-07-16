import type { FederalFundsRateApiResponseWithIndex } from './dataMapper';
import type { FederalFundsRateTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { FRED_SERIES_OBSERVATIONS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { FredSeriesObservationsParams } from '../../../services/apiEndpoints';

/**
 * Fetches Federal Funds Rate data from FRED.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for FRED endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<FederalFundsRateTileData>
 */
export function useFederalFundsApi() {
  const getFederalFundsRate = useCallback(
    async (
      tileId: string,
      params: FredSeriesObservationsParams,
      forceRefresh = false,
    ): Promise<FederalFundsRateTileData> => {
      const url = buildApiUrl(FRED_SERIES_OBSERVATIONS_ENDPOINT, params);
      const result = await DataFetcher.fetchAndMap<
        'federal-funds-rate',
        FederalFundsRateApiResponseWithIndex,
        FederalFundsRateTileData
      >(() => fetch(url).then((res) => res.json()), tileId, 'federal-funds-rate', { forceRefresh });
      if (result.error || !result.data) throw new Error(result.error || 'No data');
      return result.data;
    },
    [],
  );
  return { getFederalFundsRate };
}
