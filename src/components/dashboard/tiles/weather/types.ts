export interface WeatherData {
  city: string;
  country: string;
  temperature: {
    current: number;
    feels_like: number;
    min: number;
    max: number;
  };
  conditions: {
    main: string;
    description: string;
    icon: string;
  };
  humidity: number;
  wind: {
    speed: number;
    direction: number;
  };
  pressure: number;
  visibility: number;
  timestamp: number;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  conditions: {
    main: string;
    description: string;
    icon: string;
  };
  humidity: number;
  wind: {
    speed: number;
  };
}

export interface WeatherTileProps {
  size?: 'small' | 'medium' | 'large';
  config: {
    city: string;
    country: string;
    refreshInterval?: number;
  };
}

export interface WeatherHeaderProps {
  city: string;
  country: string;
  conditions: WeatherData['conditions'];
  timestamp: number;
}

export interface WeatherCurrentProps {
  temperature: WeatherData['temperature'];
  conditions: WeatherData['conditions'];
  humidity: number;
  wind: WeatherData['wind'];
}

export interface WeatherForecastProps {
  forecast: WeatherForecast[];
}

export interface WeatherIconProps {
  condition: string;
  size?: 'sm' | 'md' | 'lg';
}

export type WeatherApiResponse = {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    pressure: number;
    visibility: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    dt: number;
  };
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  timezone: string;
};

export type WeatherError = {
  message: string;
  code?: string;
  retryable: boolean;
}; 
