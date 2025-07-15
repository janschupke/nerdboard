export const timeTileMeta = (city: string) => {
  let title = 'Time';
  switch (city.toLowerCase()) {
    case 'helsinki':
      title = 'Helsinki Time';
      break;
    case 'prague':
      title = 'Prague Time';
      break;
    case 'taipei':
      title = 'Taipei Time';
      break;
    default:
      title = 'Time';
  }
  return { title, icon: 'clock' };
};
export const meta = timeTileMeta('Helsinki');
