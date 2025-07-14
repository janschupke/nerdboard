import React, { useEffect, useState } from 'react';
import { GenericTile } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import type { TileMeta } from '../../tile/GenericTile';
import { useGdxEtfApi } from './useGdxEtfApi';
import { LoadingSkeleton } from '../../ui/LoadingSkeleton';
import { Icon } from '../../ui/Icon';

export const GDXETFTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const { getGDXETF } = useGdxEtfApi();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      setError(null);
      setHasData(false);
      // For demo, use fixed symbol; in real use, get from tile.config
      getGDXETF(tile.id, { symbol: 'GDX' })
        .then((data) => {
          if (!mounted) return;
          setHasData(!!data);
          setLoading(false);
        })
        .catch((err) => {
          if (!mounted) return;
          setError(err.message || 'Error');
          setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }, [tile.id, getGDXETF]);

    let content;
    if (loading) {
      content = <LoadingSkeleton tileSize={tile.size || 'medium'} />;
    } else if (error) {
      content = <Icon name="close" size="lg" className="text-red-600" />;
    } else if (hasData) {
      content = <Icon name="check" size="lg" className="text-green-600" />;
    } else {
      content = <Icon name="close" size="lg" className="text-red-600" />;
    }

    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        <div className="flex items-center justify-center h-full w-full">{content}</div>
      </GenericTile>
    );
  },
);
