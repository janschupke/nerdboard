import React, { useState, useEffect } from 'react';
import { GenericTile, type GenericTileDataHook, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useGdxEtfApi } from './useGdxEtfApi';
import type { GdxEtfTileData } from './types';
import { useForceRefreshFromKey } from '../../../contexts/RefreshContext';

function useGdxEtfTileData(tileId: string): ReturnType<GenericTileDataHook<GdxEtfTileData>> {
  const { getGDXETF } = useGdxEtfApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GdxEtfTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const isForceRefresh = useForceRefreshFromKey();

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    // Provide required params for AlphaVantage
    const params = { function: 'GLOBAL_QUOTE', symbol: 'GDX', apikey: 'demo' };
    getGDXETF(tileId, params, isForceRefresh)
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
  }, [tileId, getGDXETF, isForceRefresh]);
  return { loading, error, hasData: !!data, data };
}

export const GDXETFTile = React.memo(
  ({ tile, meta, ...rest }: { tile: DragboardTileData; meta: TileMeta; refreshKey?: number }) => {
    const tileData = useGdxEtfTileData(tile.id);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.refreshKey === next.refreshKey,
);

GDXETFTile.displayName = 'GDXETFTile';
