// Grid configuration
export const GRID_CONFIG = {
  columns: 8,
  rows: 12,
  gap: '1rem',
} as const;

// Tile size configuration
export const TILE_SIZE_CONFIG = {
  small: { colSpan: 2, rowSpan: 1 },
  medium: { colSpan: 2, rowSpan: 1 },
  large: { colSpan: 4, rowSpan: 1 },
} as const;

export type TileSizeKey = keyof typeof TILE_SIZE_CONFIG;

// Helper functions
export function getTileSpan(size: string | undefined): { colSpan: number; rowSpan: number } {
  if (!size || !(size in TILE_SIZE_CONFIG)) return TILE_SIZE_CONFIG.medium;
  return TILE_SIZE_CONFIG[size as TileSizeKey];
}

export function calculateGridPosition(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  tileSize: 'small' | 'medium' | 'large' = 'medium',
): { x: number; y: number } {
  const { colSpan, rowSpan } = getTileSpan(tileSize);
  const gridCellWidth = rect.width / GRID_CONFIG.columns;
  const gridCellHeight = rect.height / GRID_CONFIG.rows;

  const rawX = (clientX - rect.left) / gridCellWidth;
  const rawY = (clientY - rect.top) / gridCellHeight;

  // For new tiles, snap to tile-sized grid positions
  const x = Math.floor(rawX / colSpan) * colSpan;
  const y = Math.floor(rawY / rowSpan) * rowSpan;

  return { x, y };
}

export function calculateExistingTilePosition(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  tileSize: 'small' | 'medium' | 'large' = 'medium',
): { x: number; y: number } {
  const { colSpan, rowSpan } = getTileSpan(tileSize);
  const gridCellWidth = rect.width / GRID_CONFIG.columns;
  const gridCellHeight = rect.height / GRID_CONFIG.rows;

  const rawX = (clientX - rect.left) / gridCellWidth;
  const rawY = (clientY - rect.top) / gridCellHeight;

  // For existing tiles, snap to tile-sized grid positions (same as new tiles)
  const x = Math.floor(rawX / colSpan) * colSpan;
  const y = Math.floor(rawY / rowSpan) * rowSpan;

  return { x, y };
}

export function calculateDropZoneStyle(
  position: { x: number; y: number },
  tileSize: 'small' | 'medium' | 'large' = 'medium',
  rowCount?: number,
): React.CSSProperties {
  const { colSpan, rowSpan } = getTileSpan(tileSize);
  const rows = rowCount ?? GRID_CONFIG.rows;

  return {
    left: `${position.x * (100 / GRID_CONFIG.columns)}%`,
    top: `${position.y * (100 / rows)}%`,
    width: `${(100 / GRID_CONFIG.columns) * colSpan}%`,
    height: `${(100 / rows) * rowSpan}%`,
  };
}

export function isPositionValid(
  position: { x: number; y: number },
  tileSize: 'small' | 'medium' | 'large' = 'medium',
): boolean {
  const { colSpan, rowSpan } = getTileSpan(tileSize);

  return (
    position.x >= 0 &&
    position.x <= GRID_CONFIG.columns - colSpan &&
    position.y >= 0 &&
    position.y <= GRID_CONFIG.rows - rowSpan
  );
}

export function getGridTemplateStyle(rowCount?: number): React.CSSProperties {
  const rows = rowCount ?? GRID_CONFIG.rows;
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_CONFIG.columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, auto)`,
    gap: GRID_CONFIG.gap,
    minHeight: '100%',
    height: 'auto',
  };
}
