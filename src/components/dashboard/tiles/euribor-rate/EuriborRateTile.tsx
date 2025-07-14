import React from 'react';
import { useEuriborRateData } from './hooks/useEuriborRateData';
import { EuriborRateHeader } from './EuriborRateHeader';
import { EuriborRateChart } from './EuriborRateChart';
import { EuriborRateControls } from './EuriborRateControls';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { GenericTile } from '../GenericTile';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../GenericTile';
import { EURIBOR_RATE_ERROR_MESSAGES } from './constants';

export const EuriborRateTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const { data, loading, error, timeRange, setTimeRange } = useEuriborRateData();

    let content: React.ReactNode = null;
    if (loading && !data) {
      content = (
        <div className="tile euribor-rate-tile">
          <LoadingSkeleton />
        </div>
      );
    } else if (error) {
      content = (
        <div className="tile euribor-rate-tile">
          <div className="tile-error">
            <div className="error-message">{error || EURIBOR_RATE_ERROR_MESSAGES.FETCH_FAILED}</div>
            <button
              onClick={() => {}} // Placeholder for refreshData
              className="retry-button"
              aria-label="Retry loading Euribor rate data"
            >
              Retry
            </button>
          </div>
        </div>
      );
    } else if (!data) {
      content = (
        <div className="tile euribor-rate-tile">
          <div className="tile-error">{EURIBOR_RATE_ERROR_MESSAGES.NO_DATA}</div>
        </div>
      );
    } else {
      content = (
        <div className="tile euribor-rate-tile">
          <EuriborRateHeader
            currentRate={data?.currentRate}
            lastUpdate={data?.lastUpdate}
            loading={loading}
          />
          <EuriborRateChart data={data?.historicalData} timeRange={timeRange} loading={loading} />
          <EuriborRateControls
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            onRefresh={() => {}} // Placeholder for refreshData
            loading={loading}
          />
        </div>
      );
    }

    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        {content}
      </GenericTile>
    );
  },
);
