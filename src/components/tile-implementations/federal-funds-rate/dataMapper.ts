import { BaseDataMapper } from '../../../services/dataMapper';
import type { FederalFundsRateData, FredApiResponse } from './types';

// Extend FredApiResponse to satisfy BaseApiResponse constraint
interface ExtendedFredApiResponse extends FredApiResponse {
  [key: string]: unknown;
}

export class FederalFundsRateDataMapper extends BaseDataMapper<
  ExtendedFredApiResponse,
  FederalFundsRateData
> {
  map(apiResponse: ExtendedFredApiResponse): FederalFundsRateData {
    const observations = apiResponse.observations;
    const latestObservation = observations[observations.length - 1];

    return {
      currentRate: parseFloat(latestObservation.value),
      lastUpdate: new Date(latestObservation.date),
      historicalData: observations.map((obs) => ({
        date: new Date(obs.date),
        rate: parseFloat(obs.value),
      })),
    };
  }

  validate(apiResponse: unknown): apiResponse is ExtendedFredApiResponse {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    // Check for required fields
    if (!response.observations || !Array.isArray(response.observations)) {
      return false;
    }

    const observations = response.observations as Array<Record<string, unknown>>;

    if (observations.length === 0) {
      return false;
    }

    // Check required fields for each observation
    const requiredFields = ['realtime_start', 'realtime_end', 'date', 'value'];

    for (const observation of observations) {
      for (const field of requiredFields) {
        if (!(field in observation)) {
          return false;
        }
      }
    }

    // Validate data types for the first observation
    const firstObs = observations[0];
    return (
      typeof firstObs.realtime_start === 'string' &&
      typeof firstObs.realtime_end === 'string' &&
      typeof firstObs.date === 'string' &&
      typeof firstObs.value === 'string'
    );
  }

  createDefault(): FederalFundsRateData {
    return {
      currentRate: 0,
      lastUpdate: new Date(),
      historicalData: [],
    };
  }
}

// Register the mapper
import { DataMapperRegistry } from '../../../services/dataMapper';

DataMapperRegistry.register('federal-funds-rate', new FederalFundsRateDataMapper());
