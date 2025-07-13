import { TIME_CONFIG, BUSINESS_STATUS } from '../constants';
import type { TimeData, CityConfig } from '../types';

export class TimezoneService {
  private static instance: TimezoneService;

  private constructor() {}

  public static getInstance(): TimezoneService {
    if (!TimezoneService.instance) {
      TimezoneService.instance = new TimezoneService();
    }
    return TimezoneService.instance;
  }

  public getTimeData(cityConfig: CityConfig): TimeData {
    try {
      const now = new Date();
      const cityTime = new Date(now.toLocaleString('en-US', { timeZone: cityConfig.timezone }));

      const timeData = this.calculateTimeData(cityTime, cityConfig);
      const businessStatus = this.calculateBusinessStatus(cityTime, cityConfig.businessHours);

      return {
        ...timeData,
        isBusinessHours: businessStatus === BUSINESS_STATUS.OPEN,
        businessStatus,
        timeUntilNextDay: this.calculateTimeUntilNextDay(cityTime, cityConfig.businessHours),
        lastUpdate: now.toISOString(),
      };
    } catch (error) {
      console.error('Error calculating time data:', error);
      throw new Error('Unable to calculate time data for this timezone');
    }
  }

  private calculateTimeData(
    cityTime: Date,
    cityConfig: CityConfig,
  ): Omit<TimeData, 'isBusinessHours' | 'businessStatus' | 'timeUntilNextDay' | 'lastUpdate'> {
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: cityConfig.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    const currentTime = cityTime.toLocaleTimeString('en-US', timeOptions);
    const dayOfWeek = cityTime.toLocaleDateString('en-US', { weekday: 'long' });
    const date = cityTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Calculate timezone offset
    const utcTime = new Date();
    const cityTimeMs = cityTime.getTime();
    const utcTimeMs = utcTime.getTime();
    const offsetMs = cityTimeMs - utcTimeMs;
    const offsetHours = Math.floor(offsetMs / (1000 * 60 * 60));
    const offsetMinutes = Math.floor((offsetMs % (1000 * 60 * 60)) / (1000 * 60));

    const offset = `${offsetHours >= 0 ? '+' : ''}${offsetHours}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`;

    return {
      currentTime,
      timezone: cityConfig.timezone,
      abbreviation: cityConfig.abbreviation,
      offset,
      dayOfWeek,
      date,
    };
  }

  private calculateBusinessStatus(
    cityTime: Date,
    businessHours: { start: number; end: number },
  ): 'open' | 'closed' | 'opening soon' | 'closing soon' {
    const currentHour = cityTime.getHours();
    const currentMinute = cityTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = businessHours.start * 60;
    const endTimeInMinutes = businessHours.end * 60;

    // Check if it's a weekday (Monday = 1, Sunday = 0)
    const dayOfWeek = cityTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return BUSINESS_STATUS.CLOSED;
    }

    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
      // Check if closing soon (within 30 minutes)
      if (currentTimeInMinutes >= endTimeInMinutes - 30) {
        return BUSINESS_STATUS.CLOSING;
      }
      return BUSINESS_STATUS.OPEN;
    } else if (currentTimeInMinutes < startTimeInMinutes) {
      // Check if opening soon (within 30 minutes)
      if (currentTimeInMinutes >= startTimeInMinutes - 30) {
        return BUSINESS_STATUS.SOON;
      }
      return BUSINESS_STATUS.CLOSED;
    } else {
      return BUSINESS_STATUS.CLOSED;
    }
  }

  private calculateTimeUntilNextDay(
    cityTime: Date,
    businessHours: { start: number; end: number },
  ): string {
    const currentHour = cityTime.getHours();
    const currentMinute = cityTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = businessHours.start * 60;

    let minutesUntilNextDay = 0;

    if (currentTimeInMinutes < startTimeInMinutes) {
      // Same day, before business hours
      minutesUntilNextDay = startTimeInMinutes - currentTimeInMinutes;
    } else {
      // Next business day
      const minutesInDay = 24 * 60;
      minutesUntilNextDay = minutesInDay - currentTimeInMinutes + startTimeInMinutes;
    }

    const hours = Math.floor(minutesUntilNextDay / 60);
    const minutes = minutesUntilNextDay % 60;

    return `${hours}h ${minutes}m`;
  }

  public getCityConfig(city: 'helsinki' | 'prague' | 'taipei'): CityConfig {
    switch (city) {
      case 'helsinki':
        return TIME_CONFIG.CITIES.HELSINKI;
      case 'prague':
        return TIME_CONFIG.CITIES.PRAGUE;
      case 'taipei':
        return TIME_CONFIG.CITIES.TAIPEI;
      default:
        throw new Error(`Unsupported city: ${city}`);
    }
  }

  public formatTime(time: string, format: '12-hour' | '24-hour'): string {
    if (format === '24-hour') {
      return time;
    }

    // Convert 24-hour to 12-hour format
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
  }
}
