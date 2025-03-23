import { v4 as uuidv4 } from 'uuid';
import { ApiRequest, Folder, BodyType, HttpMethod, RequestHeader } from '../types';
import { parseCurlCommand } from '../utils/curlParser';

export class ImportService {
  /**
   * Import from a cURL command
   */
  static importFromCurl(curlCommand: string): ApiRequest | null {
    if (!curlCommand.trim()) return null;
    return parseCurlCommand(curlCommand);
  }

  /**
   * Import from a file (determines format and handles accordingly)
   */
  static importFromFile(fileContent: string, fileName: string): Folder | null {
    try {
      // Check if this is a JSON file
      if (fileName.endsWith('.json')) {
        const parsed = JSON.parse(fileContent);

        // Detect the format based on common patterns in different file formats
        if (parsed.info && parsed.item) {
          // Looks like a Postman collection
          return this.importPostmanCollection(parsed);
        } else if (parsed._type === 'export' && parsed.resources) {
          // Looks like an Insomnia export
          return this.importInsomniaExport(parsed);
        } else if (parsed.swagger || parsed.openapi) {
          // Looks like a Swagger/OpenAPI file
          return this.importSwaggerCollection(parsed);
        } else if (parsed.log && parsed.log.entries) {
          // Looks like a HAR file
          return this.importHarFile(parsed);
        } else {
          console.log('Unknown JSON format', parsed);
        }
      } else if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
        // For YAML files we would need a YAML parser
        console.log('YAML support coming soon');
        // You could use js-yaml library to parse YAML
      }
    } catch (error) {
      console.error('Failed to import file:', error);
    }
    
    return null;
  }

  /**
   * Import a Postman collection
   */
  private static importPostmanCollection(collection: any): Folder {
    // Create a new collection
    const newCollection: Folder = {
      id: uuidv4(),
      name: collection.info?.name || collection.name || 'Imported Postman Collection',
      items: [],
      parentPath: [],
    };

    // Process Postman items recursively (handles nested folders)
    const processPostmanItems = (
      items: any[],
      parentPath: string[] = [newCollection.id],
    ): (ApiRequest | Folder)[] => {
      if (!Array.isArray(items)) return [];

      const processedItems: (ApiRequest | Folder)[] = [];

      items.forEach((item) => {
        if (item.request) {
          // It's a request
          const request = this.processPostmanRequest(item, parentPath);
          processedItems.push(request);
        } else if (item.item || item.items) {
          // It's a folder
          const folder: Folder = {
            id: uuidv4(),
            name: item.name || 'Unnamed Folder',
            items: processPostmanItems(item.item || item.items, [
              ...parentPath,
              item.id || uuidv4(),
            ]),
            parentPath,
          };
          processedItems.push(folder);
        }
      });

      return processedItems;
    };

    // Process the top-level items
    if (Array.isArray(collection.item)) {
      newCollection.items = processPostmanItems(collection.item);
    }

    return newCollection;
  }

  /**
   * Process a single Postman request
   */
  private static processPostmanRequest(item: any, parentPath: string[]): ApiRequest {
    // Extract URL
    let url = '';
    if (typeof item.request.url === 'string') {
      url = item.request.url;
    } else if (item.request.url) {
      url = item.request.url.raw || '';
      // If URL has variables in Postman format like :variable, convert to actual values if possible
      if (url.includes(':') && item.request.url.variable) {
        item.request.url.variable.forEach((v: any) => {
          url = url.replace(
            `:${v.key}`,
            v.value || v.default || `:${v.key}`,
          );
        });
      }
    }

    // Extract method
    const method = (item.request.method || 'GET') as HttpMethod;

    // Extract query params
    const params = [];
    if (item.request.url && item.request.url.query) {
      item.request.url.query.forEach((p: any) => {
        params.push({
          name: p.key || '',
          value: p.value || '',
          enabled: p.disabled !== true,
        });
      });
    }

    // Extract headers
    const headers = [];
    if (Array.isArray(item.request.header)) {
      item.request.header.forEach((h: any) => {
        headers.push({
          name: h.key || h.name || '',
          value: h.value || '',
          enabled: h.disabled !== true,
        });
      });
    }

    // Extract request body
    let body = '';
    let bodyType: BodyType = 'none';

    if (item.request.body) {
      const postmanBody = item.request.body;

      switch (postmanBody.mode) {
        case 'raw':
          body = postmanBody.raw || '';

          // Determine body type from language or Content-Type header
          if (
            postmanBody.options &&
            postmanBody.options.raw &&
            postmanBody.options.raw.language
          ) {
            if (postmanBody.options.raw.language === 'json') {
              bodyType = 'json';
            } else if (postmanBody.options.raw.language === 'xml') {
              bodyType = 'xml';
            } else {
              bodyType = 'plain-text';
            }
          } else {
            // Try to guess from content
            if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
              try {
                JSON.parse(body);
                bodyType = 'json';
              } catch (e) {
                bodyType = 'plain-text';
              }
            }
          }
          break;

        case 'urlencoded':
          bodyType = 'form-urlencoded';
          if (Array.isArray(postmanBody.urlencoded)) {
            body = postmanBody.urlencoded
              .filter((p: any) => p.disabled !== true)
              .map((p: any) =>
                `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`)
              .join('&');
          }
          break;

        case 'formdata':
          bodyType = 'form-data';
          if (Array.isArray(postmanBody.formdata)) {
            body = postmanBody.formdata
              .filter((p: any) => p.disabled !== true)
              .map((p: any) => `${p.key}: ${p.value || ''}`)
              .join('\n');
          }
          break;

        case 'graphql':
          bodyType = 'graphql';
          if (postmanBody.graphql) {
            try {
              body = JSON.stringify(postmanBody.graphql, null, 2);
            } catch (e) {
              body = postmanBody.graphql.query || '';
            }
          }
          break;
          
        default:
          // No specific mode or unsupported mode
          break;
      }
    }

    // Determine authentication
    let auth = {
      type: 'none',
      bearer: '',
      basic: {
        username: '',
        password: '',
      },
    };

    // Check for auth in the request
    if (item.request.auth) {
      const postmanAuth = item.request.auth;

      switch (postmanAuth.type) {
        case 'bearer':
          if (postmanAuth.bearer && postmanAuth.bearer.length > 0) {
            const token = postmanAuth.bearer.find(
              (p: any) => p.key === 'token',
            );
            auth = {
              type: 'bearer',
              bearer: token ? token.value : '',
              basic: { username: '', password: '' },
            };
          }
          break;

        case 'basic':
          if (postmanAuth.basic && postmanAuth.basic.length > 0) {
            const username = postmanAuth.basic.find(
              (p: any) => p.key === 'username',
            );
            const password = postmanAuth.basic.find(
              (p: any) => p.key === 'password',
            );
            auth = {
              type: 'basic',
              bearer: '',
              basic: {
                username: username ? username.value : '',
                password: password ? password.value : '',
              },
            };
          }
          break;
          
        default:
          // Use default auth settings for unsupported types
          break;
      }
    }

    // Also check for auth headers
    const authHeader = headers.find(
      (h: RequestHeader) =>
        h.name.toLowerCase() === 'authorization' &&
        h.value.toLowerCase().startsWith('bearer '),
    );

    if (authHeader) {
      auth = {
        ...auth,
        type: 'bearer',
        bearer: authHeader.value.substring(7).trim(),
      };
    }

    // Create the request
    return {
      id: uuidv4(),
      name: item.name || 'Imported Request',
      method,
      url,
      params,
      headers,
      body,
      bodyType,
      folderPath: parentPath,
      auth,
    };
  }

  /**
   * Import an Insomnia export
   */
  private static importInsomniaExport(insomniaExport: any): Folder {
    // Create a new collection
    const newCollection: Folder = {
      id: uuidv4(),
      name: 'Imported Insomnia Collection',
      items: [],
      parentPath: [],
    };

    // Extract resources
    if (insomniaExport.resources && Array.isArray(insomniaExport.resources)) {
      // First pass: gather all requests and their containing folders
      const requests: Record<string, any> = {};
      const folders: Record<string, any> = {};
      const folderContents: Record<string, string[]> = {};

      // Identify requests and folders
      insomniaExport.resources.forEach((resource: any) => {
        if (resource._type === 'request') {
          requests[resource._id] = resource;
        } else if (resource._type === 'request_group') {
          folders[resource._id] = {
            id: uuidv4(),
            name: resource.name || 'Unnamed Folder',
            items: [],
            parentPath: resource.parentId
              ? [newCollection.id, folders[resource.parentId]?.id].filter(Boolean)
              : [newCollection.id],
          };

          // Track parent-child relationships
          if (resource.parentId) {
            if (!folderContents[resource.parentId]) {
              folderContents[resource.parentId] = [];
            }
            folderContents[resource.parentId].push(resource._id);
          }
        }
      });

      // Second pass: convert requests to our format and organize by folder
      Object.values(requests).forEach((insomniaRequest: any) => {
        const folderPath = insomniaRequest.parentId
          ? [newCollection.id, folders[insomniaRequest.parentId]?.id].filter(Boolean)
          : [newCollection.id];

        // Create our request object
        const request: ApiRequest = {
          id: uuidv4(),
          name: insomniaRequest.name || 'Imported Request',
          method: (insomniaRequest.method || 'GET') as HttpMethod,
          url: insomniaRequest.url || '',
          params: [],
          headers: Array.isArray(insomniaRequest.headers)
            ? insomniaRequest.headers.map((h: any) => ({
                name: h.name || '',
                value: h.value || '',
                enabled: !h.disabled,
              }))
            : [],
          body: insomniaRequest.body?.text || '',
          bodyType: this.mapInsomniaBodyType(insomniaRequest.body?.mimeType),
          folderPath,
          auth: {
            type: 'none',
            bearer: '',
            basic: {
              username: '',
              password: '',
            },
          },
        };

        // Add to collection or appropriate folder
        if (insomniaRequest.parentId && folders[insomniaRequest.parentId]) {
          folders[insomniaRequest.parentId].items.push(request);
        } else {
          newCollection.items.push(request);
        }
      });

      // Add folders to collection
      Object.values(folders).forEach((folder: any) => {
        if (!folder.parentPath || folder.parentPath.length === 1) {
          newCollection.items.push(folder);
        }
      });
    }

    return newCollection;
  }

  /**
   * Map Insomnia body type to our format
   */
  private static mapInsomniaBodyType(mimeType: string): BodyType {
    if (!mimeType) return 'none';

    if (mimeType.includes('application/json')) {
      return 'json';
    }
    if (mimeType.includes('application/x-www-form-urlencoded')) {
      return 'form-urlencoded';
    }
    if (mimeType.includes('multipart/form-data')) {
      return 'form-data';
    }
    if (mimeType.includes('application/graphql')) {
      return 'graphql';
    }
    if (mimeType.includes('application/xml')) {
      return 'xml';
    }
    if (mimeType.includes('text/plain')) {
      return 'plain-text';
    }

    return 'plain-text';
  }

  /**
   * Import a Swagger/OpenAPI collection
   */
  private static importSwaggerCollection(swagger: any): Folder {
    // Create a new collection
    const newCollection: Folder = {
      id: uuidv4(),
      name: swagger.info?.title || 'Imported API',
      items: [],
      parentPath: [],
    };

    // Extract base URL
    let baseUrl = '';
    if (swagger.servers && swagger.servers.length > 0) {
      baseUrl = swagger.servers[0].url;
    } else if (swagger.host) {
      // Swagger 2.0
      const scheme = swagger.schemes ? swagger.schemes[0] || 'https' : 'https';
      baseUrl = `${scheme}://${swagger.host}${swagger.basePath || ''}`;
    }

    // Process paths
    if (swagger.paths) {
      Object.entries(swagger.paths).forEach(([path, methods]: [string, any]) => {
        Object.entries(methods).forEach(([method, operation]: [string, any]) => {
          // Create a request for each operation
          const request: ApiRequest = {
            id: uuidv4(),
            name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase() as HttpMethod,
            url: `${baseUrl}${path}`,
            params: [],
            headers: [],
            body: '',
            bodyType: 'none',
            folderPath: [newCollection.id],
            auth: {
              type: 'none',
              bearer: '',
              basic: {
                username: '',
                password: '',
              },
            },
          };

          // Add request parameters
          if (operation.parameters) {
            operation.parameters.forEach((param: any) => {
              if (param.in === 'query') {
                request.params.push({
                  name: param.name || '',
                  value: param.default || '',
                  enabled: !param.deprecated,
                });
              } else if (param.in === 'header') {
                request.headers.push({
                  name: param.name || '',
                  value: param.default || '',
                  enabled: !param.deprecated,
                });
              }
            });
          }

          // Add request body if applicable
          if (operation.requestBody && operation.requestBody.content) {
            const contentTypes = Object.keys(operation.requestBody.content);
            if (contentTypes.length > 0) {
              const contentType = contentTypes[0];
              const content = operation.requestBody.content[contentType];

              // Add Content-Type header
              request.headers.push({
                name: 'Content-Type',
                value: contentType,
                enabled: true,
              });

              // Set body type
              if (contentType.includes('application/json')) {
                request.bodyType = 'json';

                // Generate example body from schema if available
                if (content.schema) {
                  request.body = this.generateExampleFromSchema(content.schema);
                } else if (content.example) {
                  request.body =
                    typeof content.example === 'object'
                      ? JSON.stringify(content.example, null, 2)
                      : String(content.example);
                }
              } else if (contentType.includes('application/x-www-form-urlencoded')) {
                request.bodyType = 'form-urlencoded';
              } else if (contentType.includes('multipart/form-data')) {
                request.bodyType = 'form-data';
              }
            }
          }

          // Check for different auth types in headers
          const authHeader = request.headers.find(
            (h: RequestHeader) => h.name.toLowerCase() === 'authorization',
          );

          if (authHeader) {
            const value = authHeader.value.toLowerCase();
            if (value.startsWith('bearer ')) {
              request.auth = {
                ...request.auth,
                type: 'bearer',
                bearer: authHeader.value.substring(7).trim(),
              };
            } else if (value.startsWith('basic ')) {
              try {
                const base64 = authHeader.value.substring(6).trim();
                const decoded = atob(base64);
                const [username, password] = decoded.split(':');

                request.auth = {
                  ...request.auth,
                  type: 'basic',
                  basic: {
                    username: username || '',
                    password: password || '',
                  },
                };
              } catch (e) {
                // Do nothing if decoding fails
              }
            }
          }

          newCollection.items.push(request);
        });
      });
    }

    return newCollection;
  }

  /**
   * Generate example JSON from a schema
   */
  private static generateExampleFromSchema(schema: any): string {
    try {
      const example: Record<string, any> = {};

      // Very basic schema-to-example conversion
      if (schema.properties) {
        Object.entries(schema.properties).forEach(
          ([propName, propSchema]: [string, any]) => {
            if (propSchema.type === 'string') {
              example[propName] = propSchema.example || propSchema.default || 'string';
            } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
              example[propName] = propSchema.example || propSchema.default || 0;
            } else if (propSchema.type === 'boolean') {
              example[propName] = propSchema.example || propSchema.default || false;
            } else if (propSchema.type === 'array') {
              example[propName] = [];
            } else if (propSchema.type === 'object') {
              example[propName] = {};
            }
          },
        );
      }

      return JSON.stringify(example, null, 2);
    } catch (e) {
      return '{}';
    }
  }

  /**
   * Import a HAR file
   */
  private static importHarFile(har: any): Folder {
    if (!har.log || !har.log.entries) {
      throw new Error('Invalid HAR file format');
    }

    // Create a new collection
    const newCollection: Folder = {
      id: uuidv4(),
      name: 'Imported HAR File',
      items: [],
      parentPath: [],
    };

    // Process entries
    har.log.entries.forEach((entry: any) => {
      if (!entry.request) return;

      const { request } = entry;

      // Extract method and URL
      const method = request.method || 'GET';
      const url = request.url || '';

      // Extract headers
      const headers: RequestHeader[] = [];
      if (Array.isArray(request.headers)) {
        request.headers.forEach((h: any) => {
          headers.push({
            name: h.name || '',
            value: h.value || '',
            enabled: true,
          });
        });
      }

      // Extract body
      let body = '';
      let bodyType: BodyType = 'none';

      if (request.postData) {
        if (request.postData.text) {
          body = request.postData.text;

          // Determine body type
          const contentType = request.postData.mimeType || '';
          if (contentType.includes('application/json')) {
            bodyType = 'json';
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            bodyType = 'form-urlencoded';
          } else if (contentType.includes('multipart/form-data')) {
            bodyType = 'form-data';
          } else {
            bodyType = 'plain-text';
          }
        } else if (request.postData.params) {
          // Handle form data
          bodyType = 'form-urlencoded';
          body = request.postData.params
            .map((p: any) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value || '')}`)
            .join('&');
        }
      }

      // Create our request
      const apiRequest: ApiRequest = {
        id: uuidv4(),
        name: `${method} ${new URL(url).pathname || url}`,
        method: method as HttpMethod,
        url,
        params: [],
        headers,
        body,
        bodyType,
        folderPath: [newCollection.id],
        auth: {
          type: 'none',
          bearer: '',
          basic: {
            username: '',
            password: '',
          },
        },
      };

      // Parse query parameters from URL
      try {
        const urlObj = new URL(url);
        urlObj.searchParams.forEach((value, key) => {
          apiRequest.params.push({
            name: key,
            value,
            enabled: true,
          });
        });
      } catch (e) {
        // Do nothing if URL parsing fails
      }

      // Check for different auth types in headers
      const authHeader = headers.find(
        (h: RequestHeader) => h.name.toLowerCase() === 'authorization',
      );

      if (authHeader) {
        const value = authHeader.value.toLowerCase();
        if (value.startsWith('bearer ')) {
          apiRequest.auth = {
            ...apiRequest.auth,
            type: 'bearer',
            bearer: authHeader.value.substring(7).trim(),
          };
        } else if (value.startsWith('basic ')) {
          try {
            const base64 = authHeader.value.substring(6).trim();
            const decoded = atob(base64);
            const [username, password] = decoded.split(':');

            apiRequest.auth = {
              ...apiRequest.auth,
              type: 'basic',
              basic: {
                username: username || '',
                password: password || '',
              },
            };
          } catch (e) {
            // Do nothing if decoding fails
          }
        }
      }

      newCollection.items.push(apiRequest);
    });

    return newCollection;
  }
} 