import { BaseDataMapper, type BaseApiResponse } from '../../../services/dataMapper';
import type { TimeData } from './types';

// API response type from WorldTimeAPI
export interface WorldTimeApiResponse extends BaseApiResponse {
  datetime: string;
  timezone: string;
  utc_datetime: string;
  utc_offset: string;
  day_of_week: number;
  day_of_year: number;
  week_number: number;
  abbreviation: string;
  client_ip: string;
}

export class TimeDataMapper extends BaseDataMapper<WorldTimeApiResponse, TimeData> {
  map(apiResponse: WorldTimeApiResponse): TimeData {
    const date = new Date(apiResponse.datetime);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      currentTime: date.toLocaleTimeString(),
      timezone: apiResponse.timezone,
      abbreviation: apiResponse.abbreviation,
      offset: apiResponse.utc_offset,
      dayOfWeek: dayNames[apiResponse.day_of_week],
      date: date.toLocaleDateString(),
      isBusinessHours: this.isBusinessHours(date),
      businessStatus: this.getBusinessStatus(date),
      lastUpdate: new Date().toISOString(),
    };
  }

  validate(apiResponse: unknown): apiResponse is WorldTimeApiResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check for required fields
    const requiredFields = [
      'datetime',
      'timezone',
      'utc_datetime',
      'utc_offset',
      'day_of_week',
      'day_of_year',
      'week_number',
      'abbreviation',
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        return false;
      }
    }

    // Validate data types
    return (
      typeof response.datetime === 'string' &&
      typeof response.timezone === 'string' &&
      typeof response.utc_datetime === 'string' &&
      typeof response.utc_offset === 'string' &&
      typeof response.day_of_week === 'number' &&
      typeof response.day_of_year === 'number' &&
      typeof response.week_number === 'number' &&
      typeof response.abbreviation === 'string'
    );
  }

  createDefault(): TimeData {
    return {
      currentTime: '--:--:--',
      timezone: 'Europe/Helsinki',
      abbreviation: 'EET',
      offset: '+02:00',
      dayOfWeek: 'Unknown',
      date: 'Unknown',
      isBusinessHours: false,
      businessStatus: 'closed',
      lastUpdate: new Date().toISOString(),
    };
  }

  private isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 9 && hour < 17; // 9 AM to 5 PM
  }

  private getBusinessStatus(date: Date): 'open' | 'closed' | 'opening soon' | 'closing soon' {
    const hour = date.getHours();
    const minute = date.getMinutes();

    if (hour >= 9 && hour < 17) {
      if (hour === 16 && minute >= 45) {
        return 'closing soon';
      }
      return 'open';
    } else if (hour === 8 && minute >= 45) {
      return 'opening soon';
    } else {
      return 'closed';
    }
  }
}

// Register the mapper
import { DataMapperRegistry } from '../../../services/dataMapper';

DataMapperRegistry.register('time', new TimeDataMapper());
