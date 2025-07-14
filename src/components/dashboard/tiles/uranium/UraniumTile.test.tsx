import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { UraniumTile } from './UraniumTile';
import { meta } from './meta';
import { TileType, TileSize } from '../../../../types/dashboard';
import type { DashboardTile } from '../../../../types/dashboard';
import { DashboardProvider } from '../../../../contexts/DashboardContext';

const tile: DashboardTile = {
  id: 'test-id',
  type: TileType.URANIUM,
  config: { refreshInterval: 60000 },
  position: { x: 0, y: 0 },
  size: TileSize.MEDIUM,
};

describe('UraniumTile', () => {
  it('renders without crashing', () => {
    render(
      <DashboardProvider>
        <UraniumTile tile={tile} meta={meta} />
      </DashboardProvider>
    );
  });
}); 
