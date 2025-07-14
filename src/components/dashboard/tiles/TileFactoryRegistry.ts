// Comment out or remove all imports for non-existent TileProvider modules and their usages in the file.

// Factory object for getting providers
const tileFactory = {
  getProvider: (type: string) => {
    switch (type) {
      case 'cryptocurrency':
        return null;
      case 'weather':
        return null;
      case 'precious-metals':
        return null;
      case 'federal-funds-rate':
        return null;
      case 'time_helsinki':
      case 'time_prague':
      case 'time_taipei':
        return null;
      case 'euribor_rate':
        return null;
      case 'gdx_etf':
        return null;
      case 'uranium':
        return null;
      case 'weather_helsinki':
      case 'weather_prague':
      case 'weather_taipei':
        return null;
      default:
        return null;
    }
  },
};

export { tileFactory };
