import type { TileDataType } from '../../../services/storageManager';
import type { BaseApiResponse } from '../../../services/dataMapper';

// CWB Typhoon API response structure
export interface TyphoonApiResponse extends BaseApiResponse {
  success: string;
  result: {
    resource_id: string;
    fields: Array<{
      id: string;
      type: string;
    }>;
  };
  records: {
    datasetDescription: string;
    location: Array<{
      locationName: string;
      geocode: Array<{
        value: string;
        geocodeName: string;
      }>;
      weatherElement: Array<{
        elementName: string;
        description: string;
        time: Array<{
          startTime: string;
          endTime: string;
          parameter: Array<{
            parameterName: string;
            parameterValue: string;
            parameterUnit: string;
          }>;
        }>;
      }>;
    }>;
  };
}

// Mapped tile data structure for display
export interface TyphoonTileData extends TileDataType {
  typhoons: Array<{
    name: string;
    category: string;
    position: {
      lat: number;
      lon: number;
    };
    forecast: Array<{
      time: string;
      lat: number;
      lon: number;
      windSpeed: number;
    }>;
  }>;
  lastUpdated: string;
}
