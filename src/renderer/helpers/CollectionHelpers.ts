import { ApiRequest, Folder } from '../types';

/**
 * Find the first request in a collection of folders
 */
export function findFirstRequest(collections: Folder[]): ApiRequest | null {
  for (const collection of collections) {
    // Check if collection has any direct request items
    const directRequest = collection.items.find(
      (item) => !('items' in item),
    ) as ApiRequest | undefined;
    if (directRequest) return directRequest;

    // Check in nested folders
    for (const item of collection.items) {
      if ('items' in item) {
        // It's a folder
        const folder = item as Folder;
        const nestedRequest = folder.items.find(
          (nestedItem) => !('items' in nestedItem),
        ) as ApiRequest | undefined;
        if (nestedRequest) return nestedRequest;
      }
    }
  }
  return null;
}

/**
 * Check if a request is in a specific collection
 */
export function isRequestInCollection(request: ApiRequest, collectionId: string): boolean {
  return (
    request.folderPath &&
    request.folderPath.length > 0 &&
    request.folderPath[0] === collectionId
  );
}

/**
 * Update a request in the collections array
 */
export function updateRequestInCollections(collections: Folder[], request: ApiRequest): Folder[] {
  const updatedCollections = [...collections];
  
  updatedCollections.forEach((collection) => {
    // Check direct children of collection first
    const directChildIndex = collection.items.findIndex(
      (item) => !('items' in item) && item.id === request.id,
    );

    if (directChildIndex !== -1) {
      // Replace the request in this collection
      collection.items[directChildIndex] = request;
      return;
    }

    // Check in folders of this collection
    collection.items.forEach((item) => {
      if ('items' in item) {
        const folder = item as Folder;
        const folderChildIndex = folder.items.findIndex(
          (nestedItem) =>
            !('items' in nestedItem) && nestedItem.id === request.id,
        );

        if (folderChildIndex !== -1) {
          // Replace the request in this folder
          folder.items[folderChildIndex] = request;
        }
      }
    });
  });
  
  return updatedCollections;
}

/**
 * Find a request by ID in the collections
 */
export function findRequestById(collections: Folder[], requestId: string): ApiRequest | null {
  for (const collection of collections) {
    // Check direct items
    const request = collection.items.find(
      (item) => !('items' in item) && item.id === requestId,
    ) as ApiRequest | undefined;

    if (request) return request;

    // Check in nested folders
    for (const item of collection.items) {
      if ('items' in item) {
        // It's a folder
        const folder = item as Folder;
        const nestedRequest = folder.items.find(
          (nestedItem) =>
            !('items' in nestedItem) &&
            nestedItem.id === requestId,
        ) as ApiRequest | undefined;

        if (nestedRequest) return nestedRequest;
      }
    }
  }
  return null;
} 