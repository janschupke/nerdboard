import type { FederalFundsRateData } from '../federal-funds-rate/types';
import { DataFetcher } from '../../../services/dataFetcher';

import { useCallback } from 'react';
import { FRED_SERIES_OBSERVATIONS_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { FredSeriesObservationsParams } from '../../../services/apiEndpoints';

/**
 * Fetches Federal Funds Rate data from FRED.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for FRED endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<FederalFundsRateData>
 */
export function useFederalFundsApi() {
  const getFederalFundsRate = useCallback(
    async (
      tileId: string,
      params: FredSeriesObservationsParams,
      forceRefresh = false,
    ): Promise<FederalFundsRateData> => {
      const url = buildApiUrl(FRED_SERIES_OBSERVATIONS_ENDPOINT, params);
      const result = await DataFetcher.fetchWithRetry<FederalFundsRateData>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        {
          apiCall: 'FRED Federal Funds Rate API',
          forceRefresh,
        },
      );
      if (result.error) throw new Error(result.error);
      return result.data as FederalFundsRateData;
    },
    [],
  );
  return { getFederalFundsRate };
}
