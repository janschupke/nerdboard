import type { TileSize } from '../../dragboard/dashboard';
import type { TileDataType } from '../../../services/storageManager';

export interface TimeData extends TileDataType {
  currentTime: string;
  timezone: string;
  abbreviation: string;
  offset: string;
  dayOfWeek: string;
  date: string;
  isBusinessHours: boolean;
  businessStatus: 'open' | 'closed' | 'opening soon' | 'closing soon';
  timeUntilNextDay?: string;
  lastUpdate: string;
}

export interface CityConfig {
  name: string;
  timezone: string;
  abbreviation: string;
  businessHours: {
    start: number;
    end: number;
  };
}

export interface TimeTileConfig {
  city: 'helsinki' | 'prague' | 'taipei';
  timeFormat?: '12-hour' | '24-hour';
  showBusinessHours?: boolean;
  refreshInterval?: number;
}

export interface TimeTileProps {
  id: string;
  size: TileSize;
  config: TimeTileConfig;
}

export interface TimeDisplayProps {
  timeData: TimeData;
  timeFormat: '12-hour' | '24-hour';
  size: TileSize;
}

export interface TimezoneInfoProps {
  timeData: TimeData;
  size: TileSize;
}

export interface BusinessHoursProps {
  timeData: TimeData;
  size: TileSize;
}

export type TimeFormat = '12-hour' | '24-hour';
