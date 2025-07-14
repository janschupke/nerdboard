import type { DashboardTile } from './dashboard';
import { getTileSpan, DASHBOARD_GRID_CONFIG } from '../overlay/gridConfig';

export function rearrangeTiles(tiles: DashboardTile[]): DashboardTile[] {
  if (tiles.length === 0) return tiles;
  const sortedTiles = [...tiles].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const GRID_ROWS = DASHBOARD_GRID_CONFIG.rows;
  const GRID_COLUMNS = DASHBOARD_GRID_CONFIG.columns;
  const grid = Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLUMNS).fill(false));
  const rearrangedTiles: DashboardTile[] = [];
  for (const tile of sortedTiles) {
    const size = typeof tile.size === 'string' ? tile.size : 'medium';
    const { colSpan, rowSpan } = getTileSpan(size);
    let newPosition = { x: 0, y: 0 };
    let found = false;
    outer: for (let y = 0; y <= GRID_ROWS - rowSpan; y++) {
      for (let x = 0; x <= GRID_COLUMNS - colSpan; x++) {
        let canPlace = true;
        for (let i = y; i < y + rowSpan; i++) {
          for (let j = x; j < x + colSpan; j++) {
            if (grid[i] && grid[i][j]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        if (canPlace) {
          newPosition = { x, y };
          found = true;
          break outer;
        }
      }
    }
    if (found) {
      for (let i = newPosition.y; i < newPosition.y + rowSpan; i++) {
        for (let j = newPosition.x; j < newPosition.x + colSpan; j++) {
          if (grid[i] && grid[i][j] !== undefined) {
            grid[i][j] = true;
          }
        }
      }
      rearrangedTiles.push({ ...tile, position: newPosition });
    }
  }
  return rearrangedTiles;
} 
