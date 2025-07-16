import type { TileSize } from '../../../types/tile';
import type { TileDataType } from '../../../services/storageManager';
import type { BaseApiResponse } from '../../../services/dataMapper';

export interface TimeTileData extends TileDataType {
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

export interface TimeApiResponse extends BaseApiResponse {
  datetime: string;
  timezone: string;
  utc_datetime: string;
  utc_offset: string;
  day_of_week: number;
  day_of_year: number;
  week_number: number;
  abbreviation: string;
  client_ip: string;
  [key: string]: unknown;
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
  timeData: TimeTileData;
  timeFormat: '12-hour' | '24-hour';
  size: TileSize;
}

export interface TimezoneInfoProps {
  timeData: TimeTileData;
  size: TileSize;
}

export interface BusinessHoursProps {
  timeData: TimeTileData;
  size: TileSize;
}

export type TimeFormat = '12-hour' | '24-hour';
