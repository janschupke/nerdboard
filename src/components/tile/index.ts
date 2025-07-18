// Core tile component
export { GenericTile } from './GenericTile';
export type { GenericTileProps, TileMeta } from './GenericTile';
export { Tile } from './Tile';
export type { TileProps } from './Tile';
export { TileErrorBoundary } from './TileErrorBoundary';

// Tile factory registry
export { TILE_CATALOG, getLazyTileComponent, getTileMeta } from './TileFactoryRegistry';
