import { createContext, useContext } from 'react';
import { DataParserRegistry } from '../services/dataParser';
import { DataMapperRegistry } from '../services/dataMapper';
import { DataFetcher } from '../services/dataFetcher';

export interface DataServices {
  parserRegistry: DataParserRegistry;
  mapperRegistry: DataMapperRegistry;
  dataFetcher: DataFetcher;
}

export const DataServicesContext = createContext<DataServices | undefined>(undefined);

export const useDataServices = () => {
  const ctx = useContext(DataServicesContext);
  if (!ctx) throw new Error('useDataServices must be used within a DataServicesContext.Provider');
  return ctx;
};
