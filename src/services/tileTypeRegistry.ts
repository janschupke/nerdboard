import { TileType } from '../types/tile';
// Data mappers
import { TyphoonDataMapper } from '../components/tile-implementations/typhoon/dataMapper';
import { WeatherDataMapper } from '../components/tile-implementations/weather/dataMapper';
import { TimeDataMapper } from '../components/tile-implementations/time/dataMapper';
import { gdxEtfDataMapper } from '../components/tile-implementations/gdx-etf/dataMapper';
import { CryptocurrencyDataMapper } from '../components/tile-implementations/cryptocurrency/dataMapper';
import { FederalFundsRateDataMapper } from '../components/tile-implementations/federal-funds-rate/dataMapper';
import { ecbEuriborDataMapper } from '../components/tile-implementations/euribor-rate/dataMapper';
import { PreciousMetalsDataMapper } from '../components/tile-implementations/precious-metals/dataMapper';
import { earthquakeDataMapper } from '../components/tile-implementations/earthquake/dataMapper';
// Data parsers
import { UraniumHtmlDataParser } from '../components/tile-implementations/uranium/dataParser';

export const tileDataMappers = {
  [TileType.TYPHOON]: () => new TyphoonDataMapper(),
  [TileType.WEATHER_HELSINKI]: () => new WeatherDataMapper(),
  [TileType.WEATHER_PRAGUE]: () => new WeatherDataMapper(),
  [TileType.WEATHER_TAIPEI]: () => new WeatherDataMapper(),
  [TileType.TIME_HELSINKI]: () => new TimeDataMapper(),
  [TileType.TIME_PRAGUE]: () => new TimeDataMapper(),
  [TileType.TIME_TAIPEI]: () => new TimeDataMapper(),
  [TileType.GDX_ETF]: () => gdxEtfDataMapper,
  [TileType.CRYPTOCURRENCY]: () => new CryptocurrencyDataMapper(),
  [TileType.FEDERAL_FUNDS_RATE]: () => new FederalFundsRateDataMapper(),
  [TileType.EURIBOR_RATE]: () => ecbEuriborDataMapper,
  [TileType.PRECIOUS_METALS]: () => new PreciousMetalsDataMapper(),
  [TileType.EARTHQUAKE]: () => earthquakeDataMapper,
};

export const tileDataParsers = {
  [TileType.URANIUM]: () => new UraniumHtmlDataParser(),
}; 
