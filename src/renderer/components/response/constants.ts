// Size thresholds for when to enable optimized rendering
export const LARGE_RESPONSE_THRESHOLD = 50000; // ~50KB
export const VERY_LARGE_RESPONSE_THRESHOLD = 500000; // ~500KB
export const MASSIVE_RESPONSE_THRESHOLD = 2000000; // ~2MB

// Render configurations
export const MAX_ITEMS_TO_RENDER = 50; // Maximum number of items to render initially
export const MAX_STRING_LENGTH = 250; // Maximum length for string values
export const VIRTUALIZED_CHUNK_SIZE = 100; // Number of lines to render at once in virtualized mode

// Style configurations
export const lineNumberStyle = {
  display: 'inline-block',
  width: '30px',
  textAlign: 'left' as const,
  paddingLeft: '2px',
  marginRight: '8px',
  color: 'rgba(255, 255, 255, 0.4)',
  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  userSelect: 'none' as const,
};

export const lineStyle = {
  display: 'flex',
  lineHeight: '1.5em',
}; 