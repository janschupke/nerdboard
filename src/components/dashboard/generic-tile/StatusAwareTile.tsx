import React from 'react';
import { TileStatus } from '../../types/tileStatus';

interface StatusAwareTileProps {
  status: TileStatus;
  children: React.ReactNode;
  className?: string;
}

export const StatusAwareTile: React.FC<StatusAwareTileProps> = ({
  status,
  children,
  className = '',
}) => {
  const getStatusClasses = () => {
    const baseClasses = 'rounded-lg border-2 transition-all duration-200';

    switch (status) {
      case TileStatus.ERROR:
        return `${baseClasses} border-error-500 bg-error-50 dark:bg-error-900/20`;
      case TileStatus.STALE:
        return `${baseClasses} border-warning-500 bg-warning-50 dark:bg-warning-900/20`;
      case TileStatus.OK:
      default:
        return `${baseClasses} border-theme-tertiary bg-theme-surface`;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case TileStatus.ERROR:
        return (
          <div className="absolute top-2 right-2 text-error-500">
            <span role="img" aria-label="Error" className="text-lg">
              ✗
            </span>
          </div>
        );
      case TileStatus.STALE:
        return (
          <div className="absolute top-2 right-2 text-warning-500">
            <span role="img" aria-label="Warning" className="text-lg">
              ⚠
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative ${getStatusClasses()} ${className}`}
      role="region"
      aria-label={`Tile with ${status.toLowerCase()} status`}
    >
      {getStatusIcon()}
      {children}
    </div>
  );
};
