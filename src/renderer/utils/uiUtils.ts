import { HttpMethod } from '../types';

const COLLECTION_COLORS = [
  '#0A84FF', // blue
  '#00A699', // green
  '#FFCC00', // yellow
  '#FF9500', // orange
  '#AF52DE', // purple
  '#FF6B8A', // pink
  '#5AC8FA', // cyan
  '#FF3B30', // red
];

/**
 * Hash a collection name to a consistent color from the palette.
 */
export const getCollectionColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLLECTION_COLORS.length;
  return COLLECTION_COLORS[index];
};

/**
 * Get color based on HTTP method
 */
export const getMethodColor = (method: HttpMethod): string => {
  switch (method) {
    case 'GET':
      return '#61affe';
    case 'POST':
      return '#49cc90';
    case 'PUT':
      return '#fca130';
    case 'DELETE':
      return '#f93e3e';
    case 'PATCH':
      return '#50e3c2';
    case 'OPTIONS':
      return '#9012fe';
    case 'HEAD':
      return '#9012fe';
    default:
      return '#9012fe';
  }
}; 