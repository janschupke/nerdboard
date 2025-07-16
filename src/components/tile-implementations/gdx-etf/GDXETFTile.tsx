import React, { useState, useEffect } from 'react';
import { GenericTile, type TileMeta } from '../../tile/GenericTile';
import type { DragboardTileData } from '../../dragboard/dragboardTypes';
import { useGdxEtfApi } from './useGdxEtfApi';
import type { GdxEtfTileData } from './types';

function useGdxEtfTileData(
  tileId: string,
  refreshKey?: number,
): { loading: boolean; error: string | null; hasData: boolean; data?: GdxEtfTileData } {
  const { getGDXETF } = useGdxEtfApi();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GdxEtfTileData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setData(undefined);
    setError(null);
    getGDXETF(tileId)
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
  }, [tileId, getGDXETF, refreshKey]);
  return { loading, error, hasData: !!data, data };
}

export const GDXETFTile = React.memo(
  ({
    tile,
    meta,
    refreshKey,
    ...rest
  }: {
    tile: DragboardTileData;
    meta: TileMeta;
    refreshKey?: number;
  }) => {
    const tileData = useGdxEtfTileData(tile.id, refreshKey);
    return <GenericTile tile={tile} meta={meta} tileData={tileData} {...rest} />;
  },
  (prev, next) => prev.tile.id === next.tile.id && prev.refreshKey === next.refreshKey,
);

GDXETFTile.displayName = 'GDXETFTile';
