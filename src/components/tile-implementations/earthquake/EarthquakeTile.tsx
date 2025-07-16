import React, { useState, useEffect } from 'react';
import { GenericTile, type GenericTileDataHook, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useEarthquakeApi } from './useEarthquakeApi';
import type { EarthquakeTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useEarthquakeTileData(tileId: string): ReturnType<GenericTileDataHook<EarthquakeTileData[]>> {
  const { getEarthquakes } = useEarthquakeApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EarthquakeTileData[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getEarthquakes(tileId, {}, isForceRefresh)
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
  }, [tileId, getEarthquakes, isForceRefresh]);
  return { loading, error, hasData: !!data && data.length > 0, data };
}

export const EarthquakeTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta }) => {
    const tileData = useEarthquakeTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id,
); 
