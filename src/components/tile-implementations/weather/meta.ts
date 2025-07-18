import type { TileCategory } from '../../../types/tileCategories';
import type { TileMeta } from '../../tile/GenericTile';
export const weatherTileMeta = (city: string): TileMeta => {
  let title = 'Weather';
  switch (city.toLowerCase()) {
    case 'helsinki':
      title = 'Helsinki Weather';
      break;
    case 'prague':
      title = 'Prague Weather';
      break;
    case 'taipei':
      title = 'Taipei Weather';
      break;
    default:
      title = 'Weather';
  }
  return { title, icon: 'weather', category: 'Weather' as TileCategory };
};
