import React from 'react';
import { useTileStatus } from '../../../hooks/useTileStatus';
import { StatusAwareTile } from '../StatusAwareTile';
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
    lastRequestResult as 'success' | 'error' | 'failure' | null,
    hasLocalData,
    errorMessage,
  );

  return (
    <StatusAwareTile status={status} className="h-full w-full">
      {children}
    </StatusAwareTile>
  );
};
