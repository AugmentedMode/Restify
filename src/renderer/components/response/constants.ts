import { CSSProperties } from 'react';

// Size thresholds for when to enable optimized rendering
export const LARGE_RESPONSE_THRESHOLD = 50000; // ~50KB
export const VERY_LARGE_RESPONSE_THRESHOLD = 500000; // ~500KB
export const MASSIVE_RESPONSE_THRESHOLD = 2000000; // ~2MB

// Render configurations
export const MAX_ITEMS_TO_RENDER = 50; // Maximum number of items to render initially
export const MAX_STRING_LENGTH = 250; // Maximum length for string values
export const VIRTUALIZED_CHUNK_SIZE = 100; // Number of lines to render at once in virtualized mode

// Style configurations
export const lineNumberStyle: CSSProperties = {
  display: 'block',
  width: '30px',
  textAlign: 'right',
  padding: '2px 8px 2px 0',
  margin: '0 16px 0 0',
  color: 'rgba(255, 255, 255, 0.35)',
  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  userSelect: 'none',
  fontFamily: 'monospace',
  fontSize: '12px',
};

export const lineStyle: CSSProperties = {
  display: 'flex',
  lineHeight: '1.6em',
  padding: '1px 0',
  transition: 'background-color 0.15s ease',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '13px',
  letterSpacing: '0.3px',
};

export const lineHoverStyle: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
};

export const jsonContainerStyle: CSSProperties = {
  backgroundColor: 'rgba(30, 30, 40, 0.4)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  padding: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  overflowX: 'auto',
  maxHeight: '100%',
  transition: 'all 0.3s ease',
}; 