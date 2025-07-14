export const TileStatus = {
  OK: 'OK',
  STALE: 'STALE',
  ERROR: 'ERROR',
} as const;

export type TileStatus = (typeof TileStatus)[keyof typeof TileStatus];

export interface TileStatusData {
  status: TileStatus;
  lastRequestResult: 'success' | 'error' | 'failure' | null;
  hasLocalData: boolean;
  lastUpdate: Date;
  errorMessage?: string;
}

export interface TileStatusContext {
  status: TileStatus;
  statusData: TileStatusData;
  updateStatus: (status: TileStatus, data?: Partial<TileStatusData>) => void;
  getStatusDisplayInfo: () => {
    color: string;
    message: string;
    icon?: string;
  };
}
