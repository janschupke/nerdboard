# Tile Implementation Pattern

This document describes the new tile implementation pattern after the refactoring of `GenericTile` and `Tile` components.

## Overview

The refactoring separates concerns between generic tile functionality and tile-specific content rendering:

- **GenericTile**: Handles common tile functionality (error boundaries, header, close button, etc.)
- **Tile**: Handles unknown tile types and lazy loading
- **Individual Tile Implementations**: Handle their own data fetching and content rendering

## New Pattern

### 1. GenericTile Component

The `GenericTile` component now acts as a wrapper that provides:

- Error boundary wrapping
- Tile header with icon and title
- Close button
- Common styling and layout
- Drag handle functionality

```tsx
<GenericTile tile={tile} meta={meta} onRemove={onRemove} dragHandleProps={dragHandleProps}>
  {/* Tile-specific content goes here */}
</GenericTile>
```

### 2. Tile Component

The `Tile` component handles:

- Unknown tile type error display
- Lazy loading with Suspense
- Fallback loading states

### 3. Individual Tile Implementation Pattern

Each tile implementation should follow this pattern:

```tsx
import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { Icon } from '../../ui/Icon';
import type { TileStatus } from '../../tile/tileStatus';
import { useYourApi } from './useYourApi';
import type { YourTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

// 1. Data hook that returns TileStatus & data
function useYourTileData(tileId: string): TileStatus & { data?: YourTileData } {
  const { getYourData } = useYourApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<YourTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getYourData(tileId, params, isForceRefresh)
      .then((result) => {
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setData(undefined);
        setError(err?.message || 'Error');
        setLoading(false);
      });
  }, [tileId, getYourData, isForceRefresh]);

  return { loading, error, hasData: !!data, data };
}

// 2. Content component that handles all rendering states
const YourTileContent = ({ tileData }: { tileData: TileStatus & { data?: YourTileData } }) => {
  const { loading, error, hasData, data } = tileData;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="loading" size="lg" className="text-theme-status-info" />
      </div>
    );
  }

  if (error && !hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="close" size="lg" className="text-theme-status-error" />
        <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
      </div>
    );
  }

  if (error && hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="warning" size="lg" className="text-theme-status-warning" />
        <p className="text-theme-status-warning text-sm text-center">Data may be outdated</p>
      </div>
    );
  }

  if (hasData && data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        {/* Your tile-specific content */}
        <div className="text-2xl font-bold text-theme-text-primary">{data.yourValue}</div>
        <div className="text-sm text-theme-text-secondary">{data.yourDescription}</div>
      </div>
    );
  }

  return null;
};

// 3. Main tile component that uses GenericTile as wrapper
export const YourTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useYourTileData(tile.id);

    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <YourTileContent tileData={tileData} />
      </GenericTile>
    );
  },
  (prev, next) => prev.tile.id === next.tile.id,
);

YourTile.displayName = 'YourTile';
```

## Benefits of the New Pattern

1. **Separation of Concerns**: Generic tile functionality is separate from tile-specific content
2. **Consistent Error Handling**: All tiles get the same error boundary and error states
3. **Reusable Components**: The content rendering logic can be reused across different states
4. **Type Safety**: Strong typing for tile data and status
5. **Maintainability**: Easier to update common functionality without touching individual tiles

## Migration Guide

To migrate existing tiles to the new pattern:

1. Remove the old `GenericTileDataHook` import
2. Import `TileStatus` from `../../tile/tileStatus`
3. Update your data hook to return `TileStatus & { data?: YourDataType }`
4. Create a content component that handles all rendering states
5. Update your main tile component to use `GenericTile` as a wrapper
6. Remove the `tileData` prop from `GenericTile` usage

## Status States

The `TileStatus` interface includes:

- `loading`: boolean - whether data is being fetched
- `error`: string | null - error message if any
- `hasData`: boolean - whether valid data is available

These states should be used to determine what to render in your content component.
