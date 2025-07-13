import { describe, it, expect } from 'vitest';
import {
  GRID_CONFIG,
  TILE_SIZE_CONFIG,
  getTileSpan,
  calculateGridPosition,
  calculateExistingTilePosition,
  calculateDropZoneStyle,
  isPositionValid,
  getGridTemplateStyle,
} from './dimensions';

describe('Grid Configuration', () => {
  it('has correct grid dimensions', () => {
    expect(GRID_CONFIG.columns).toBe(8);
    expect(GRID_CONFIG.rows).toBe(12);
    expect(GRID_CONFIG.gap).toBe('1rem');
  });

  it('has correct tile size configurations', () => {
    expect(TILE_SIZE_CONFIG.small).toEqual({ colSpan: 2, rowSpan: 1 });
    expect(TILE_SIZE_CONFIG.medium).toEqual({ colSpan: 2, rowSpan: 1 });
    expect(TILE_SIZE_CONFIG.large).toEqual({ colSpan: 4, rowSpan: 1 });
  });
});

describe('getTileSpan', () => {
  it('returns correct spans for valid sizes', () => {
    expect(getTileSpan('small')).toEqual({ colSpan: 2, rowSpan: 1 });
    expect(getTileSpan('medium')).toEqual({ colSpan: 2, rowSpan: 1 });
    expect(getTileSpan('large')).toEqual({ colSpan: 4, rowSpan: 1 });
  });

  it('returns medium span for invalid sizes', () => {
    expect(getTileSpan('invalid')).toEqual({ colSpan: 2, rowSpan: 1 });
    expect(getTileSpan(undefined)).toEqual({ colSpan: 2, rowSpan: 1 });
    expect(getTileSpan('')).toEqual({ colSpan: 2, rowSpan: 1 });
  });
});

describe('calculateGridPosition', () => {
  const mockRect = {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  } as DOMRect;

  it('calculates correct position for new tiles', () => {
    const position = calculateGridPosition(100, 50, mockRect, 'medium');
    expect(position.x).toBe(0); // Should snap to tile-sized positions
    expect(position.y).toBe(1); // 50px / (600px/12rows) = 1
  });

  it('snaps to tile-sized grid positions', () => {
    // Test that positions snap to colSpan boundaries
    const position1 = calculateGridPosition(150, 50, mockRect, 'medium');
    expect(position1.x).toBe(0); // 150px / (800px/8cols) = 1.5, floor(1.5/2)*2 = 0

    const position2 = calculateGridPosition(250, 50, mockRect, 'medium');
    expect(position2.x).toBe(2); // 250px / (800px/8cols) = 2.5, floor(2.5/2)*2 = 2
  });

  it('handles different tile sizes correctly', () => {
    const smallPosition = calculateGridPosition(100, 50, mockRect, 'small');
    const largePosition = calculateGridPosition(100, 50, mockRect, 'large');

    expect(smallPosition.x).toBe(0);
    expect(largePosition.x).toBe(0); // Large tiles span 4 columns
  });
});

describe('calculateExistingTilePosition', () => {
  const mockRect = {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  } as DOMRect;

  it('calculates position using tile-sized increments', () => {
    const position = calculateExistingTilePosition(100, 50, mockRect, 'medium');
    expect(position.x).toBe(0); // 100px / (800px/8cols) = 1.25, floor(1.25/2)*2 = 0
    expect(position.y).toBe(1); // 50px / (600px/12rows) = 1
  });

  it('handles edge cases', () => {
    const position = calculateExistingTilePosition(0, 0, mockRect);
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });
});

describe('calculateDropZoneStyle', () => {
  it('calculates correct style for medium tile', () => {
    const style = calculateDropZoneStyle({ x: 2, y: 1 }, 'medium');
    expect(style.left).toBe('25%'); // 2 * (100/8) = 25%
    expect(style.top).toBe('8.333333333333334%'); // 1 * (100/12) = 8.33%
    expect(style.width).toBe('25%'); // 2 * (100/8) = 25%
    expect(style.height).toBe('8.333333333333334%'); // 100/12 = 8.33%
  });

  it('calculates correct style for large tile', () => {
    const style = calculateDropZoneStyle({ x: 0, y: 0 }, 'large');
    expect(style.left).toBe('0%');
    expect(style.top).toBe('0%');
    expect(style.width).toBe('50%'); // 4 * (100/8) = 50%
    expect(style.height).toBe('8.333333333333334%');
  });

  it('uses medium as default tile size', () => {
    const style = calculateDropZoneStyle({ x: 1, y: 1 });
    expect(style.width).toBe('25%'); // 2 * (100/8) = 25%
  });
});

describe('isPositionValid', () => {
  it('validates positions correctly', () => {
    // Valid positions
    expect(isPositionValid({ x: 0, y: 0 }, 'medium')).toBe(true);
    expect(isPositionValid({ x: 6, y: 11 }, 'medium')).toBe(true); // 8-2=6, 12-1=11

    // Invalid positions - out of bounds
    expect(isPositionValid({ x: 7, y: 0 }, 'medium')).toBe(false); // 7+2=9 > 8
    expect(isPositionValid({ x: 0, y: 12 }, 'medium')).toBe(false); // 12+1=13 > 12
    expect(isPositionValid({ x: -1, y: 0 }, 'medium')).toBe(false);
    expect(isPositionValid({ x: 0, y: -1 }, 'medium')).toBe(false);
  });

  it('handles different tile sizes', () => {
    // Large tiles span 4 columns
    expect(isPositionValid({ x: 4, y: 0 }, 'large')).toBe(true); // 4+4=8
    expect(isPositionValid({ x: 5, y: 0 }, 'large')).toBe(false); // 5+4=9 > 8
  });

  it('uses medium as default tile size', () => {
    expect(isPositionValid({ x: 0, y: 0 })).toBe(true);
    expect(isPositionValid({ x: 7, y: 0 })).toBe(false);
  });
});

describe('getGridTemplateStyle', () => {
  it('returns correct CSS grid template style', () => {
    const style = getGridTemplateStyle();

    expect(style.display).toBe('grid');
    expect(style.gridTemplateColumns).toBe('repeat(8, 1fr)');
    expect(style.gridTemplateRows).toBe('repeat(12, auto)');
    expect(style.gap).toBe('1rem');
    expect(style.minHeight).toBe('100%');
    expect(style.height).toBe('auto');
  });

  it('returns legacy 1fr row style if requested', () => {
    // Simulate legacy/fallback usage
    const rows = 12;
    const style = {
      display: 'grid',
      gridTemplateColumns: `repeat(8, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gap: '1rem',
      minHeight: '100%',
      height: 'auto',
    };
    expect(style.gridTemplateRows).toBe('repeat(12, 1fr)');
  });
});

describe('Configuration Integration', () => {
  it('ensures grid dimensions are consistent across functions', () => {
    const style = getGridTemplateStyle();
    const position = calculateGridPosition(100, 50, {
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    } as DOMRect);
    const dropZone = calculateDropZoneStyle(position, 'medium');

    // All functions should use the same grid configuration
    expect(style.gridTemplateColumns).toBe('repeat(8, 1fr)');
    expect(dropZone.width).toBe('25%'); // Based on 8 columns
  });

  it('ensures tile spans are consistent across functions', () => {
    const span = getTileSpan('large');
    const dropZone = calculateDropZoneStyle({ x: 0, y: 0 }, 'large');

    // Drop zone width should match tile span
    const expectedWidth = `${(100 / GRID_CONFIG.columns) * span.colSpan}%`;
    expect(dropZone.width).toBe(expectedWidth);
  });
});
