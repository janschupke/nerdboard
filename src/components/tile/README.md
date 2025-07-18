# Tile Implementation Pattern

This document describes the unified tile implementation pattern that provides consistent data fetching and status handling across all tiles.

## Overview

The tile system uses a unified pattern with:

- **GenericTile**: Handles common tile functionality (error boundaries, header, close button, status bar)
- **useTileData**: Unified hook for data fetching that returns `FetchResult<T>`
- **Individual Tile Content**: Handle rendering based on status and data
- **API Hooks**: Return `FetchResult<T>` for consistent error handling

## Unified Pattern

### 1. GenericTile Component

The `GenericTile` component provides:

- Error boundary wrapping
- Tile header with icon and title
- Close button
- Status bar showing last update time and status icon
- Common styling and layout
- Drag handle functionality

```tsx
<GenericTile
  tile={tile}
  meta={meta}
  status={status}
  lastUpdate={lastUpdated?.toISOString()}
  onRemove={onRemove}
  dragHandleProps={dragHandleProps}
>
  {/* Tile-specific content goes here */}
</GenericTile>
```

### 2. useTileData Hook

The unified `useTileData` hook handles all data fetching:

```tsx
const { data, status, lastUpdated, error, isCached } = useTileData(
  apiFunction,
  tileId,
  params,
  forceRefresh,
);
```

Returns `FetchResult<T>` with:

- `data`: The fetched data or null
- `status`: 'loading' | 'success' | 'error' | 'stale'
- `lastUpdated`: Date when data was last updated
- `error`: Error message if any
- `isCached`: Whether data is from cache

### 3. Individual Tile Implementation Pattern

Each tile implementation should follow this pattern:

```tsx
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useYourApi } from './useYourApi';
import type { YourTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';
import { Icon } from '../../ui/Icon';
import { RequestStatus } from '../../../services/dataFetcher';
import { useTileData } from '../../tile/useTileData';

// 1. Content component that handles all rendering states
const YourTileContent = ({
  data,
  status,
}: {
  data: YourTileData | null;
  status: (typeof RequestStatus)[keyof typeof RequestStatus];
}) => {
  if (status === RequestStatus.Loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="loading" size="lg" className="text-theme-status-info" />
      </div>
    );
  }

  if (status === RequestStatus.Error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="close" size="lg" className="text-theme-status-error" />
        <p className="text-theme-status-error text-sm text-center">Data failed to fetch</p>
      </div>
    );
  }

  if (status === RequestStatus.Stale) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <Icon name="warning" size="lg" className="text-theme-status-warning" />
        <p className="text-theme-status-warning text-sm text-center">Data may be outdated</p>
      </div>
    );
  }

  if (status === RequestStatus.Success && data) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2">
        <div className="text-2xl font-bold text-theme-text-primary">{data.yourValue}</div>
        <div className="text-sm text-theme-text-secondary">{data.yourDescription}</div>
      </div>
    );
  }

  return null;
};

// 2. Main tile component that uses GenericTile as wrapper
export const YourTile = ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
  const isForceRefresh = useForceRefreshFromKey();
  const { getYourData } = useYourApi();
  const { data, status, lastUpdated } = useTileData(
    getYourData,
    tile.id,
    { yourParam: 'value' },
    isForceRefresh,
  );

  return (
    <GenericTile
      tile={tile}
      meta={meta}
      status={status}
      lastUpdate={lastUpdated ? lastUpdated.toISOString() : undefined}
      {...rest}
    >
      <YourTileContent data={data} status={status} />
    </GenericTile>
  );
};

YourTile.displayName = 'YourTile';
```

### 4. API Hook Pattern

API hooks should return `FetchResult<T>`:

```tsx
import { DataFetcher, type FetchResult } from '../../../services/dataFetcher';
import { useCallback } from 'react';
import type { YourTileData } from './types';

export function useYourApi() {
  const getYourData = useCallback(
    async (
      tileId: string,
      params: YourParams,
      forceRefresh = false,
    ): Promise<FetchResult<YourTileData>> => {
      return DataFetcher.fetchAndMap(
        () => fetch(url).then((res) => res.json()),
        tileId,
        'your-tile-type',
        { apiCall: 'your-api-call', forceRefresh },
      ) as Promise<FetchResult<YourTileData>>;
    },
    [],
  );

  return { getYourData };
}
```

## Benefits of the Unified Pattern

1. **Consistent Data Fetching**: All tiles use the same `useTileData` hook
2. **Unified Status Handling**: Consistent loading, error, stale, and success states
3. **Centralized Error Handling**: All errors are handled through `DataFetcher`
4. **Type Safety**: Strong typing with `FetchResult<T>` and specific tile data types
5. **Caching**: Built-in caching and background refresh capabilities
6. **Status Bar**: Automatic status display with last update time and status icons
7. **Maintainability**: Easy to update common functionality across all tiles

## Status States

The unified pattern uses these status states:

- `loading`: Data is being fetched
- `success`: Data was successfully fetched and is fresh
- `error`: An error occurred during fetching
- `stale`: Data is available but may be outdated (from cache)

The status bar automatically shows appropriate icons and colors for each state.

## Migration Guide

To migrate existing tiles to the unified pattern:

1. Remove old tile data hooks (e.g., `useTimeTileData`)
2. Update API hooks to return `FetchResult<T>`
3. Use `useTileData` hook instead of custom data fetching
4. Create content component that handles all status states
5. Update main tile component to use `GenericTile` with status props
6. Remove old `TileStatus` imports and usage
