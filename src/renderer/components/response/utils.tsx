import React from 'react';
import { JSONValue } from '../../styles/StyledComponents';
import { lineNumberStyle, lineStyle, MAX_ITEMS_TO_RENDER, MAX_STRING_LENGTH } from './constants';

// Format byte values into human-readable format
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / 1024 ** i).toFixed(2))} ${sizes[i]}`;
};

// Get a unique key for array items in JSON viewer
export const getItemKey = (item: any, index: number): string => {
  const type = typeof item;
  if (type === 'string' && item.length < 10) {
    return `item-${item}-${index}`;
  }
  if (type === 'number' || type === 'boolean') {
    return `item-${String(item)}-${index}`;
  }
  return `item-${type}-${index}`;
};

// Helper function to safely truncate and prepare large response data for display
export const getSafeResponseData = (
  data: any, 
  isFullView: boolean,
  isVeryLargeResponse: boolean,
  itemsToShow: number
): any => {
  if (!data || isFullView) return data;

  try {
    // For very large responses, use a more aggressive approach
    if (isVeryLargeResponse) {
      // If it's an array, just take the first few items
      if (Array.isArray(data)) {
        return data.slice(0, itemsToShow).map((item) => {
          if (typeof item === 'object' && item !== null) {
            return typeof item === 'object' && Array.isArray(item)
              ? `[Array(${item.length})]`
              : '{...}';
          }
          if (typeof item === 'string' && item.length > MAX_STRING_LENGTH) {
            return `${item.substring(0, MAX_STRING_LENGTH)}...`;
          }
          return item;
        });
      }

      // If it's an object, take just the first few keys
      if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data).slice(0, itemsToShow);
        const result: Record<string, any> = {};

        keys.forEach((key) => {
          const value = data[key];
          if (typeof value === 'object' && value !== null) {
            result[key] = Array.isArray(value)
              ? `[Array(${value.length})]`
              : '{...}';
          } else if (
            typeof value === 'string' &&
            value.length > MAX_STRING_LENGTH
          ) {
            result[key] = `${value.substring(0, MAX_STRING_LENGTH)}...`;
          } else {
            result[key] = value;
          }
        });

        if (Object.keys(data).length > itemsToShow) {
          result.truncated = `${Object.keys(data).length - itemsToShow} more properties`;
        }

        return result;
      }
    }

    // For regular large responses, use a more detailed approach
    // Deep clone to avoid modifying the original data
    const clonedData = JSON.parse(JSON.stringify(data));

    // Helper function to recursively truncate data
    const truncateData = (obj: any, depth = 0): any => {
      if (depth > 3) return '[Nested object]'; // Reduced max depth from 5 to 3

      if (Array.isArray(obj)) {
        // Truncate arrays to itemsToShow items
        return obj.slice(0, itemsToShow).map((item) => {
          if (typeof item === 'object' && item !== null) {
            return truncateData(item, depth + 1);
          }
          if (typeof item === 'string' && item.length > MAX_STRING_LENGTH) {
            return `${item.substring(0, MAX_STRING_LENGTH)}...`;
          }
          return item;
        });
      }

      if (typeof obj === 'object' && obj !== null) {
        // Process objects
        const result: Record<string, any> = {};
        const keys = Object.keys(obj).slice(0, itemsToShow);

        keys.forEach((key) => {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            result[key] = truncateData(value, depth + 1);
          } else if (
            typeof value === 'string' &&
            value.length > MAX_STRING_LENGTH
          ) {
            result[key] = `${value.substring(0, MAX_STRING_LENGTH)}...`;
          } else {
            result[key] = value;
          }
        });

        if (Object.keys(obj).length > itemsToShow) {
          result.truncated = `${Object.keys(obj).length - itemsToShow} more properties`;
        }

        return result;
      }

      return obj;
    };

    return truncateData(clonedData);
  } catch (error) {
    console.error('Error preparing response data:', error);
    // If we can't process the data, return a simple error object
    return { error: 'Error processing response data' };
  }
};

// Improved function to format JSON with syntax highlighting and size limiting
export const formatJSON = (
  data: any,
  isLargeResponse = false,
  maxItems = MAX_ITEMS_TO_RENDER,
): React.ReactNode => {
  // Counter for line numbers
  let lineCount = 1;

  // Helper function to generate a line with a number
  const createLineWithNumber = (content: React.ReactNode): React.ReactNode => {
    const lineNumber = lineCount;
    lineCount += 1;
    return (
      <div style={lineStyle} key={`line-${lineNumber}`}>
        <span style={lineNumberStyle}>{lineNumber}</span>
        <div>{content}</div>
      </div>
    );
  };

  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <JSONValue type="null">null</JSONValue>;
    }

    if (typeof value === 'string') {
      // For very long strings, truncate them
      if (isLargeResponse && value.length > 1000) {
        return (
          <JSONValue type="string">
            &quot;{value.substring(0, 1000)}...&quot;
            <span style={{ color: 'gray', fontStyle: 'italic' }}>
              {' '}
              (truncated)
            </span>
          </JSONValue>
        );
      }
      return <JSONValue type="string">&quot;{value}&quot;</JSONValue>;
    }

    if (typeof value === 'number') {
      return <JSONValue type="number">{value}</JSONValue>;
    }

    if (typeof value === 'boolean') {
      return <JSONValue type="boolean">{value ? 'true' : 'false'}</JSONValue>;
    }

    // For direct value rendering, return a simple representation
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return '[...]'; // Simplified placeholder
      }
      return '{...}'; // Simplified placeholder
    }

    return <span>{String(value)}</span>;
  };

  const formatComplex = (jsonData: any, depth = 0): React.ReactNode[] => {
    // Limit deep nesting to avoid browser hangs
    const MAX_DEPTH = 10;
    const result: React.ReactNode[] = [];

    // Base indentation for each level
    const getIndent = (level: number) => level * 20;

    if (depth > MAX_DEPTH) {
      result.push(
        createLineWithNumber(
          <span style={{ color: 'gray', fontStyle: 'italic' }}>
            Maximum depth reached, object truncated...
          </span>
        )
      );
      return result;
    }

    if (Array.isArray(jsonData)) {
      // For large arrays, limit the number of items rendered
      const itemsToRender = isLargeResponse
        ? Math.min(jsonData.length, maxItems)
        : jsonData.length;
      const hasMoreItems = jsonData.length > itemsToRender;

      // Opening bracket on its own line
      result.push(createLineWithNumber('['));

      if (jsonData.length > 0) {
        jsonData.slice(0, itemsToRender).forEach((item, i) => {
          if (item !== null && typeof item === 'object') {
            // For object/array items, render the opening bracket first
            const openingBracket = Array.isArray(item) ? '[' : '{';
            result.push(
              createLineWithNumber(
                <span style={{ marginLeft: getIndent(depth + 1) }}>
                  {openingBracket}
                </span>
              )
            );

            // Process nested content with increased indentation
            const nestedContent = formatComplex(item, depth + 2);
            // Skip first and last lines as we handle them separately
            nestedContent.forEach((line, index) => {
              if (index > 0 && index < nestedContent.length - 1) {
                result.push(line);
              }
            });

            // Add closing bracket with comma if needed
            const closingBracket = Array.isArray(item) ? ']' : '}';
            result.push(
              createLineWithNumber(
                <span style={{ marginLeft: getIndent(depth + 1) }}>
                  {closingBracket}
                  {i < itemsToRender - 1 ? ',' : ''}
                </span>
              )
            );
          } else {
            // Simple primitive values
            result.push(
              createLineWithNumber(
                <span style={{ marginLeft: getIndent(depth + 1) }}>
                  {formatValue(item)}
                  {i < itemsToRender - 1 ? ',' : ''}
                </span>
              )
            );
          }
        });

        if (hasMoreItems) {
          result.push(
            createLineWithNumber(
              <span
                style={{
                  marginLeft: getIndent(depth + 1),
                  color: 'gray',
                  fontStyle: 'italic',
                }}
              >
                ... {jsonData.length - itemsToRender} more items
              </span>
            )
          );
        }
      }

      // Closing bracket on its own line
      result.push(createLineWithNumber(']'));
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      const keys = Object.keys(jsonData);
      // For large objects, limit the number of keys rendered
      const keysToRender = isLargeResponse ? keys.slice(0, maxItems) : keys;
      const hasMoreKeys = keys.length > keysToRender.length;

      // Opening brace on its own line
      result.push(createLineWithNumber('{'));

      if (keys.length > 0) {
        keysToRender.forEach((key, i) => {
          const value = jsonData[key];

          if (value !== null && typeof value === 'object') {
            // Key with nested object/array
            result.push(
              createLineWithNumber(
                <span style={{ marginLeft: getIndent(depth + 1) }}>
                  <JSONValue type="key">&quot;{key}&quot;</JSONValue>:{' '}
                  {Array.isArray(value) ? '[' : '{'}
                </span>
              )
            );

            // Process nested content with increased indentation
            const nestedContent = formatComplex(value, depth + 2);
            // Skip first and last lines as we handle them separately
            nestedContent.forEach((line, index) => {
              if (index > 0 && index < nestedContent.length - 1) {
                result.push(line);
              }
            });

            // Add closing bracket with comma if needed
            const closingBracket = Array.isArray(value) ? ']' : '}';
            result.push(
              createLineWithNumber(
                <span style={{ marginLeft: getIndent(depth + 1) }}>
                  {closingBracket}
                  {i < keysToRender.length - 1 ? ',' : ''}
                </span>
              )
            );
          } else {
            // Simple key-value pair
            result.push(
              createLineWithNumber(
                <span style={{ marginLeft: getIndent(depth + 1) }}>
                  <JSONValue type="key">&quot;{key}&quot;</JSONValue>:{' '}
                  {formatValue(value)}
                  {i < keysToRender.length - 1 ? ',' : ''}
                </span>
              )
            );
          }
        });

        if (hasMoreKeys) {
          result.push(
            createLineWithNumber(
              <span
                style={{
                  marginLeft: getIndent(depth + 1),
                  color: 'gray',
                  fontStyle: 'italic',
                }}
              >
                ... {keys.length - keysToRender.length} more properties
              </span>
            )
          );
        }
      }

      // Closing brace on its own line
      result.push(createLineWithNumber('}'));
    }

    return result;
  };

  if (data === null || data === undefined) {
    return createLineWithNumber(<JSONValue type="null">null</JSONValue>);
  }

  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean'
  ) {
    return createLineWithNumber(formatValue(data));
  }

  if (Array.isArray(data) || typeof data === 'object') {
    return <div>{formatComplex(data)}</div>;
  }

  return createLineWithNumber(<span>{String(data)}</span>);
};

/**
 * Generates TypeScript interfaces from a JSON object
 * Handles arrays of similar objects to avoid duplicate interfaces
 */
export const generateTypeScript = (data: any, rootName = 'Response'): string => {
  if (!data) return '';

  const seen = new Map<string, string>();
  const interfaceMap = new Map<string, string>();
  let output = '';

  const getType = (value: any, key = '', path = ''): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    const type = typeof value;
    if (['string', 'number', 'boolean'].includes(type)) return type;
    
    if (type === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        
        // For arrays, we should check if the items have the same structure
        // and create only one interface for the item type
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          // Create a singular name for the item type (remove trailing 's' if plural)
          const itemName = key.endsWith('s') 
            ? key.charAt(0).toUpperCase() + key.slice(1, -1) 
            : key.charAt(0).toUpperCase() + key.slice(1) + 'Item';
          
          // Use the first item as template for the interface, but check that all have same structure
          const template = value[0];
          const templateKeys = Object.keys(template).sort().join(',');
          
          // Check if all items have the same keys
          const allSameStructure = value.every(item => {
            if (typeof item !== 'object' || item === null) return false;
            const itemKeys = Object.keys(item).sort().join(',');
            return itemKeys === templateKeys;
          });
          
          if (allSameStructure) {
            // Generate interface for the item type
            const interfaceBody = generateInterface(template, itemName, path + '.' + key);
            if (interfaceBody && !interfaceMap.has(itemName)) {
              interfaceMap.set(itemName, interfaceBody);
            }
            return `${itemName}[]`;
          }
        }
        
        // If items are not all objects or don't have the same structure
        const itemType = getType(value[0], key, path + '.' + key);
        return `${itemType}[]`;
      } else {
        // Generate a name for this interface
        const interfaceName = key.charAt(0).toUpperCase() + key.slice(1);
        
        // Check if we've seen this structure before
        const serialized = JSON.stringify(Object.keys(value).sort());
        if (seen.has(serialized)) {
          return seen.get(serialized)!;
        }
        
        // Mark as seen to avoid circular references
        seen.set(serialized, interfaceName);
        
        // Generate interface
        const interfaceBody = generateInterface(value, interfaceName, path);
        if (interfaceBody && !interfaceMap.has(interfaceName)) {
          interfaceMap.set(interfaceName, interfaceBody);
        }
        
        return interfaceName;
      }
    }
    
    return 'any';
  };

  const generateInterface = (obj: any, name: string, path: string): string => {
    const properties = Object.entries(obj)
      .map(([key, value]) => {
        const propertyType = getType(value, key, path + '.' + key);
        const formattedKey = /^[a-zA-Z0-9_]+$/.test(key) ? key : `'${key}'`;
        return `  ${formattedKey}: ${propertyType};`;
      })
      .join('\n');

    return `interface ${name} {\n${properties}\n}`;
  };

  // Start with the root interface
  const rootType = getType(data, rootName);
  if (rootType !== rootName) {
    output = `type ${rootName} = ${rootType};\n\n`;
  }

  // Add all generated interfaces (sorted to ensure consistent output)
  const sortedInterfaces = Array.from(interfaceMap.entries())
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([, interfaceBody]) => interfaceBody);
  
  output += sortedInterfaces.join('\n\n');
  
  return output;
}; 