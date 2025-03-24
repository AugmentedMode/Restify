import { HttpMethod } from '../types';

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