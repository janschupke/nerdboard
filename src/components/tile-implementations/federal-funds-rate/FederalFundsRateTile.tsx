import React, { useEffect, useState } from 'react';
import { GenericTile } from '../../tile/GenericTile';
import type { DashboardTile } from '../../dragboard/dashboard';
import type { TileMeta } from '../../tile/GenericTile';
import { useFederalFundsApi } from './useFederalFundsApi';
import { LoadingSkeleton } from '../../ui/LoadingSkeleton';
import { Icon } from '../../ui/Icon';

export const FederalFundsRateTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const { getFederalFundsRate } = useFederalFundsApi();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      setError(null);
      setHasData(false);
      getFederalFundsRate(tile.id, { series_id: 'FEDFUNDS', file_type: 'json' })
        .then((data) => {
          if (!mounted) return;
          setHasData(!!data && !!data.currentRate);
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
    }, [tile.id, getFederalFundsRate]);

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

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
