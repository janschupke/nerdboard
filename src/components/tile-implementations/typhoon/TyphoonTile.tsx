import React, { useState, useEffect } from 'react';
import { GenericTile, type GenericTileDataHook, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useTyphoonApi } from './useTyphoonApi';
import type { TyphoonTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useTyphoonTileData(
  tileId: string,
  apiKey: string,
): ReturnType<GenericTileDataHook<TyphoonTileData>> {
  const { getTyphoonData } = useTyphoonApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TyphoonTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    console.log('[TyphoonTile] useEffect running for tileId:', tileId, 'apiKey:', apiKey);
    setLoading(true);
    setData(undefined);
    setError(null);
    console.log('[TyphoonTile] Calling getTyphoonData for tileId:', tileId);
    getTyphoonData(tileId, apiKey, isForceRefresh)
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
  }, [tileId, apiKey, getTyphoonData, isForceRefresh]);
  return {
    loading,
    error,
    hasData: !!data && Array.isArray(data.typhoons) && data.typhoons.length > 0,
    data,
  };
}

export const TyphoonTile = React.memo(
  ({
    tile,
    meta,
    apiKey = '',
    ...rest
  }: {
    tile: DragboardTileData;
    meta: TileMeta;
    apiKey?: string;
  }) => {
    const tileData = useTyphoonTileData(tile.id, apiKey);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.apiKey === next.apiKey,
);

TyphoonTile.displayName = 'TyphoonTile';
