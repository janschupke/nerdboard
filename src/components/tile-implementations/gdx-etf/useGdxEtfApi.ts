import type { GDXETFData } from '../gdx-etf/types';
import { useCallback } from 'react';
import { YAHOO_FINANCE_CHART_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { YahooFinanceChartParams } from '../../../services/apiEndpoints';

/**
 * Yahoo Finance endpoint is currently broken (proxy disabled).
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for Yahoo Finance chart endpoint
 * @returns Promise<GDXETFData>
 */
export function useGdxEtfApi() {
  const getGDXETF = useCallback(
    async (tileId: string, params: YahooFinanceChartParams): Promise<GDXETFData> => {
      buildApiUrl(YAHOO_FINANCE_CHART_ENDPOINT, params);
      throw new Error('Yahoo Finance endpoint is currently not implemented.');
    },
    [],
  );
  return { getGDXETF };
}
