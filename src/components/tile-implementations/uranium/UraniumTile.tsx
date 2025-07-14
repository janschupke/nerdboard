import React, { useEffect, useState } from 'react';
import { GenericTile } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import type { TileMeta } from '../../tile/GenericTile';
import { useUraniumApi } from './useUraniumApi';
import { LoadingSkeleton } from '../../ui/LoadingSkeleton';
import { Icon } from '../../ui/Icon';

export const UraniumTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const { getUraniumPrice } = useUraniumApi();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      setError(null);
      setHasData(false);
      getUraniumPrice(tile.id, {})
        .then((data) => {
          if (!mounted) return;
          setHasData(!!data && typeof data.spotPrice === 'number');
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
    }, [tile.id, getUraniumPrice]);

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

UraniumTile.displayName = 'UraniumTile';
