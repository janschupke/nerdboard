import { DashboardContext } from '../../contexts/DashboardContext';
import { Tile } from './Tile';
import { useState, useContext } from 'react';
import { useCryptocurrencyData } from '../../hooks/useCryptocurrencyData';
import { usePreciousMetalsData } from '../../hooks/usePreciousMetalsData';
import { useFederalFundsRateData } from './tiles/federal-funds-rate/hooks/useFederalFundsRateData';
import { useEuriborRateData } from './tiles/euribor-rate/hooks/useEuriborRateData';
import { useWeatherData } from './tiles/weather/hooks/useWeatherData';
import { useGDXETFData } from './tiles/gdx-etf/hooks/useGDXETFData';
import { useTimeData } from './tiles/time/hooks/useTimeData';
import { useUraniumData } from './tiles/uranium/hooks/useUraniumData';
import { TileType } from '../../types/dashboard';

export function TileGrid() {
  const dashboardContext = useContext(DashboardContext);
  if (!dashboardContext) {
    throw new Error('TileGrid must be used within DashboardProvider');
  }

  const { layout, removeTile, addTile } = dashboardContext;
  const { tiles } = layout;
  const [isDragOver, setIsDragOver] = useState(false);

  // Get data from hooks for each tile type
  const cryptocurrencyData = useCryptocurrencyData();
  const preciousMetalsData = usePreciousMetalsData();
  const federalFundsRateData = useFederalFundsRateData();
  const euriborRateData = useEuriborRateData();
  const weatherData = useWeatherData('helsinki'); // Default to Helsinki
  const gdxEtfData = useGDXETFData();
  const timeData = useTimeData('helsinki'); // Default to Helsinki
  const uraniumData = useUraniumData('1Y'); // Default to 1 year

  const getTileData = (tileType: TileType) => {
    switch (tileType) {
      case TileType.CRYPTOCURRENCY:
        return {
          loading: cryptocurrencyData.loading,
          error: cryptocurrencyData.error,
          lastUpdated: cryptocurrencyData.lastUpdated,
          isCached: cryptocurrencyData.isCached,
        };
      case TileType.PRECIOUS_METALS:
        return {
          loading: preciousMetalsData.loading,
          error: preciousMetalsData.error,
          lastUpdated: preciousMetalsData.lastUpdated,
          isCached: preciousMetalsData.isCached,
        };
      case TileType.FEDERAL_FUNDS_RATE:
        return {
          loading: federalFundsRateData.loading,
          error: federalFundsRateData.error,
          lastUpdated: federalFundsRateData.lastUpdated,
          isCached: federalFundsRateData.isCached,
        };
      case TileType.EURIBOR_RATE:
        return {
          loading: euriborRateData.loading,
          error: euriborRateData.error,
          lastUpdated: euriborRateData.lastUpdated,
          isCached: euriborRateData.isCached,
        };
      case TileType.WEATHER_HELSINKI:
      case TileType.WEATHER_PRAGUE:
      case TileType.WEATHER_TAIPEI:
        return {
          loading: weatherData.loading,
          error: weatherData.error,
          lastUpdated: weatherData.lastUpdated,
          isCached: weatherData.isCached,
        };
      case TileType.GDX_ETF:
        return {
          loading: gdxEtfData.loading,
          error: gdxEtfData.error,
          lastUpdated: gdxEtfData.lastUpdated,
          isCached: gdxEtfData.isCached,
        };
      case TileType.TIME_HELSINKI:
      case TileType.TIME_PRAGUE:
      case TileType.TIME_TAIPEI:
        return {
          loading: timeData.loading,
          error: timeData.error,
          lastUpdated: timeData.lastUpdated,
          isCached: timeData.isCached,
        };
      case TileType.URANIUM:
        return {
          loading: uraniumData.loading,
          error: uraniumData.error,
          lastUpdated: uraniumData.lastUpdated,
          isCached: uraniumData.isCached,
        };
      default:
        return {
          loading: false,
          error: null,
          lastUpdated: undefined,
          isCached: false,
        };
    }
  };

  if (tiles.length === 0) {
    return (
      <div className="relative h-full" aria-label="Dashboard grid">
        {/* Welcome Message */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4" role="img" aria-label="Dashboard icon">
              📊
            </div>
            <h2 className="text-xl font-semibold text-theme-primary mb-2">Welcome to Dashboard</h2>
            <p className="text-theme-secondary mb-4">Add tiles from the sidebar to get started</p>
            <div className="text-sm text-theme-tertiary">
              Click the menu button to open the sidebar
            </div>
          </div>
        </div>

        {/* Full-size drag target overlay */}
        <div
          className="absolute inset-0 z-10"
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
              e.preventDefault();
              setIsDragOver(true);
            }
          }}
          onDrop={(e) => {
            setIsDragOver(false);
            const tileType = e.dataTransfer.getData('application/nerdboard-tile-type');
            if (tileType) {
              addTile(tileType as import('../../types/dashboard').TileType);
            }
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          {isDragOver && (
            <div className="absolute inset-0 bg-accent-muted opacity-30 pointer-events-none z-10 rounded-lg ring-4 ring-accent-primary" />
          )}
        </div>
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/nerdboard-tile-type')) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    const tileType = e.dataTransfer.getData('application/nerdboard-tile-type');
    if (tileType) {
      addTile(tileType as import('../../types/dashboard').TileType);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div
      className={`h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 auto-rows-min relative ${isDragOver ? 'ring-4 ring-accent-primary' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      role="grid"
      aria-label="Dashboard tiles grid"
      aria-describedby={tiles.length > 0 ? 'tiles-description' : undefined}
    >
      {tiles.length > 0 && (
        <div id="tiles-description" className="sr-only">
          Dashboard grid containing {tiles.length} tile{tiles.length !== 1 ? 's' : ''}
        </div>
      )}
      {tiles.map((tile) => {
        const tileData = getTileData(tile.type);
        return (
          <Tile
            key={tile.id}
            tile={tile}
            onRemove={removeTile}
            loading={tileData.loading}
            error={tileData.error}
            lastUpdated={tileData.lastUpdated || undefined}
            isCached={tileData.isCached}
          />
        );
      })}
      {isDragOver && (
        <div
          className="absolute inset-0 bg-accent-muted opacity-30 pointer-events-none z-10 rounded-lg"
          aria-hidden="true"
          role="presentation"
        />
      )}
    </div>
  );
}
