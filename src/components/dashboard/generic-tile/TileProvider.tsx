import React from 'react';
import { useTileStatus } from './useTileStatus';
import { StatusAwareTile } from './StatusAwareTile';
import type { TileStatus } from './tileStatus';
// Comment out or remove the import of TileState from '../../../types/tile' and any usage of TileState in this file.

interface TileProviderProps {
  tileState: unknown; // Use unknown instead of any
  children: React.ReactNode;
}

export const TileProvider: React.FC<TileProviderProps> = ({ tileState, children }) => {
  let lastRequestResult = null;
  let hasLocalData = false;
  let errorMessage = '';
  if (tileState && typeof tileState === 'object' && 'lastRequestResult' in tileState) {
    lastRequestResult = (tileState as { lastRequestResult?: unknown }).lastRequestResult;
    hasLocalData = (tileState as { hasLocalData?: boolean }).hasLocalData ?? false;
    errorMessage = (tileState as { errorMessage?: string }).errorMessage ?? '';
  }
  const { status } = useTileStatus(
    lastRequestResult as TileStatus | null,
    hasLocalData,
    errorMessage,
  );

  return (
    <StatusAwareTile status={status} className="h-full w-full">
      {children}
    </StatusAwareTile>
  );
};
