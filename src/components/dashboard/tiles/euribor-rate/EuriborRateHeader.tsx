import React from 'react';
import { EURIBOR_RATE_UI_CONFIG } from './constants';

interface EuriborRateHeaderProps {
  currentRate?: number;
  lastUpdate?: Date;
  loading?: boolean;
}

export const EuriborRateHeader: React.FC<EuriborRateHeaderProps> = ({
  currentRate,
  loading = false,
}) => {
  const formatRate = (rate: number): string => {
    return `${rate.toFixed(EURIBOR_RATE_UI_CONFIG.RATE_DECIMAL_PLACES)}%`;
  };


  return (
    <div className="euribor-rate-header">
      <div className="header-content">
        <div className="rate-display">
          <h3 className="rate-title">Euribor 12M</h3>
          <div className="rate-value">
            {loading ? (
              <div className="loading-rate">Loading...</div>
            ) : currentRate !== undefined ? (
              <span className="current-rate">{formatRate(currentRate)}</span>
            ) : (
              <span className="no-rate">N/A</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
