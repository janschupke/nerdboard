// Grid and tile sizing configuration for the dashboard (app-owned)

export const DASHBOARD_GRID_CONFIG = {
  columns: 8,
  rows: 12,
  tileSizes: {
    small: { colSpan: 2, rowSpan: 1 },
    medium: { colSpan: 2, rowSpan: 1 },
    large: { colSpan: 4, rowSpan: 1 },
  },
};

export type TileSize = 'small' | 'medium' | 'large';

export function getTileSpan(size: TileSize) {
  return DASHBOARD_GRID_CONFIG.tileSizes[size] || DASHBOARD_GRID_CONFIG.tileSizes.medium;
}
