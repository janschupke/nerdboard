import type { FederalFundsRateApiResponseWithIndex } from './dataMapper';
import type { FederalFundsRateTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import { FRED_SERIES_OBSERVATIONS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { FredSeriesObservationsParams } from '../../../services/apiEndpoints';
import { TileApiCallTitle, TileType } from '../../../types/tile';

/**
 * Fetches Federal Funds Rate data from FRED.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for FRED endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<FederalFundsRateTileData>
 */
export function useFederalFundsApi() {
  const getFederalFundsRate = useCallback(
    async (tileId: string, params: FredSeriesObservationsParams, forceRefresh = false) => {
      const url = buildApiUrl(FRED_SERIES_OBSERVATIONS_ENDPOINT, params);
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        TileType.FEDERAL_FUNDS_RATE,
        { apiCall: TileApiCallTitle.FEDERAL_FUNDS_RATE, forceRefresh },
      );
    },
    [],
  );
  return { getFederalFundsRate };
}
