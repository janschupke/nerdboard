import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { setupGlobalErrorHandling } from './services/apiErrorInterceptor';
import { DataServicesContext } from './contexts/DataServicesContext';
import { DataParserRegistry } from './services/dataParser';
import { DataMapperRegistry } from './services/dataMapper';
import { DataFetcher } from './services/dataFetcher';
import { TileType } from './types/tile';
import { CryptocurrencyDataMapper } from './components/tile-implementations/cryptocurrency/dataMapper';
import { PreciousMetalsDataMapper } from './components/tile-implementations/precious-metals/dataMapper';
import { FederalFundsRateDataMapper } from './components/tile-implementations/federal-funds-rate/dataMapper';
import { TimeDataMapper } from './components/tile-implementations/time/dataMapper';
import { WeatherDataMapper } from './components/tile-implementations/weather/dataMapper';
import { gdxEtfDataMapper } from './components/tile-implementations/gdx-etf/dataMapper';
import { ecbEuriborDataMapper } from './components/tile-implementations/euribor-rate/dataMapper';
import { earthquakeDataMapper } from './components/tile-implementations/earthquake/dataMapper';
import { TyphoonDataMapper } from './components/tile-implementations/typhoon/dataMapper';

setupGlobalErrorHandling();

// Instantiate registries and fetcher
const parserRegistry = new DataParserRegistry();
const mapperRegistry = new DataMapperRegistry();
const dataFetcher = new DataFetcher(mapperRegistry, parserRegistry);

// Register all mappers
mapperRegistry.register(TileType.CRYPTOCURRENCY, new CryptocurrencyDataMapper());
mapperRegistry.register(TileType.PRECIOUS_METALS, new PreciousMetalsDataMapper());
mapperRegistry.register(TileType.FEDERAL_FUNDS_RATE, new FederalFundsRateDataMapper());
mapperRegistry.register(TileType.TIME_HELSINKI, new TimeDataMapper());
mapperRegistry.register(TileType.TIME_PRAGUE, new TimeDataMapper());
mapperRegistry.register(TileType.TIME_TAIPEI, new TimeDataMapper());
mapperRegistry.register(TileType.WEATHER_HELSINKI, new WeatherDataMapper());
mapperRegistry.register(TileType.WEATHER_PRAGUE, new WeatherDataMapper());
mapperRegistry.register(TileType.WEATHER_TAIPEI, new WeatherDataMapper());
mapperRegistry.register(TileType.GDX_ETF, gdxEtfDataMapper);
mapperRegistry.register(TileType.EURIBOR_RATE, ecbEuriborDataMapper);
mapperRegistry.register(TileType.EARTHQUAKE, earthquakeDataMapper);
mapperRegistry.register(TileType.TYPHOON, new TyphoonDataMapper());

const dataServices = { parserRegistry, mapperRegistry, dataFetcher };

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <DataServicesContext.Provider value={dataServices}>
        <App />
      </DataServicesContext.Provider>
    </ThemeProvider>
  </React.StrictMode>,
);
