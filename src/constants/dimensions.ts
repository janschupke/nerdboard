export const DIMENSIONS = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  tileSizes: {
    small: { width: 200, height: 150 },
    medium: { width: 300, height: 200 },
    large: { width: 400, height: 250 },
  },
  sidebar: {
    width: '250px',
    collapsedWidth: '60px',
  },
  header: {
    height: '60px',
  },
} as const;

export type Dimensions = typeof DIMENSIONS;

// Shared tile size config for dashboard tiles
export const tileSizeConfig = {
  small: { colSpan: 2, rowSpan: 1 },
  medium: { colSpan: 2, rowSpan: 1 },
  large: { colSpan: 4, rowSpan: 1 },
};

export type TileSizeKey = keyof typeof tileSizeConfig;

export function getTileSpan(size: string | undefined): { colSpan: number; rowSpan: number } {
  if (!size || !(size in tileSizeConfig)) return tileSizeConfig.medium;
  return tileSizeConfig[size as TileSizeKey];
}
