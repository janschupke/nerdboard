import React from 'react';
import { TileStatus } from '../../../types/tileStatus';

interface StatusMessageProps {
  status: TileStatus;
  message?: string;
  showIcon?: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  status,
  message,
  showIcon = true,
}) => {
  const getMessageConfig = () => {
    switch (status) {
      case TileStatus.ERROR:
        return {
          text: message || 'Data unavailable',
          icon: '✗',
          className: 'text-error-600 bg-error-100 dark:bg-error-900/30',
        };
      case TileStatus.STALE:
        return {
          text: message || 'Data may be outdated',
          icon: '⚠',
          className: 'text-warning-600 bg-warning-100 dark:bg-warning-900/30',
        };
      default:
        return {
          text: message || 'Data is fresh',
          icon: '✓',
          className: 'text-success-600 bg-success-100 dark:bg-success-900/30',
        };
    }
  };

  const config = getMessageConfig();

  return (
    <div className={`flex items-center justify-center p-4 rounded-lg ${config.className}`}>
      {showIcon && (
        <span className="mr-2 text-lg" role="img" aria-label={`${status.toLowerCase()} status`}>
          {config.icon}
        </span>
      )}
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
};
