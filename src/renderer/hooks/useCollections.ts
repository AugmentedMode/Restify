import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, ApiRequest } from '../types';
import { saveCollections, loadCollections } from '../utils/apiUtils';
import { updateRequestInCollections, findRequestById } from '../helpers/CollectionHelpers';

export interface UseCollectionsReturn {
  collections: Folder[];
  loading: boolean;
  error: string | null;
  addFolder: () => void;
  addRequest: (folderPath: string[]) => ApiRequest;
  renameItem: (itemId: string, newName: string, itemType: 'collection' | 'folder' | 'request', path: string[]) => void;
  deleteItem: (itemId: string, itemType: 'collection' | 'folder' | 'request', path: string[]) => void;
  moveItem: (itemId: string, itemType: 'folder' | 'request', sourcePath: string[], targetPath: string[]) => void;
  duplicateRequest: (requestId: string, path: string[]) => ApiRequest | null;
  updateRequest: (updatedRequest: ApiRequest) => void;
  addCollection: (collection: Folder) => void;
}

// Create empty request template
const createEmptyRequest = (folderPath: string[]): ApiRequest => ({
  id: uuidv4(),
  name: 'New Request',
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  folderPath,
  auth: {
    type: 'none',
    bearer: '',
    basic: {
      username: '',
      password: '',
    },
  },
});

/**
 * Custom hook for managing collections state
 */
export default function useCollections(initialCollections: Folder[] = []): UseCollectionsReturn {
  const [collections, setCollections] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load collections from storage on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const result = await loadCollections();
        if (result.success && result.collections && result.collections.length > 0) {
          setCollections(result.collections);
        } else {
          setCollections(initialCollections);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load collections:', err);
        setError('Failed to load collections');
        setCollections(initialCollections);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [initialCollections]);

  // Save collections when they change
  useEffect(() => {
    const persistCollections = async () => {
      try {
        await saveCollections(collections);
      } catch (err) {
        console.error('Failed to save collections:', err);
        setError('Failed to save collections');
      }
    };

    if (collections.length > 0 && !loading) {
      persistCollections();
    }
  }, [collections, loading]);

  // Add a new collection/folder
  const addFolder = useCallback(() => {
    const newFolder: Folder = {
      id: uuidv4(),
      name: 'New Collection',
      items: [],
      parentPath: [],
    };

    setCollections(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  // Add a new request to a specific folder path
  const addRequest = useCallback((folderPath: string[]) => {
    const newRequest = createEmptyRequest(folderPath);

    setCollections(prev => {
      const updatedCollections = [...prev];

      if (folderPath.length === 0) {
        // Add to root level - not supported currently
        return updatedCollections;
      }

      const collectionId = folderPath[0];
      const collection = updatedCollections.find(c => c.id === collectionId);

      if (collection) {
        if (folderPath.length === 1) {
          // Add to collection root
          collection.items.push(newRequest);
        } else {
          // Add to subfolder
          const folderId = folderPath[1];
          const folder = collection.items.find(
            item => 'items' in item && item.id === folderId,
          ) as Folder | undefined;

          if (folder) {
            folder.items.push(newRequest);
          }
        }
      }

      return updatedCollections;
    });

    return newRequest;
  }, []);

  // Rename an item (collection, folder, or request)
  const renameItem = useCallback((
    itemId: string,
    newName: string,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => {
    setCollections(prev => {
      const updatedCollections = [...prev];

      if (itemType === 'collection') {
        // Find and rename the collection
        const collectionIndex = updatedCollections.findIndex(c => c.id === itemId);
        if (collectionIndex !== -1) {
          updatedCollections[collectionIndex].name = newName;
        }
      } else if (path.length > 0) {
        // Find the collection
        const collectionId = path[0];
        const collection = updatedCollections.find(c => c.id === collectionId);

        if (collection) {
          if (path.length === 1) {
            // Item is directly in collection
            const itemIndex = collection.items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
              if (itemType === 'folder' && 'items' in collection.items[itemIndex]) {
                (collection.items[itemIndex] as Folder).name = newName;
              } else if (itemType === 'request' && !('items' in collection.items[itemIndex])) {
                (collection.items[itemIndex] as ApiRequest).name = newName;
              }
            }
          } else if (path.length === 2) {
            // Item is in a folder
            const folderId = path[1];
            const folder = collection.items.find(
              item => 'items' in item && item.id === folderId,
            ) as Folder | undefined;

            if (folder && itemType === 'request') {
              const requestIndex = folder.items.findIndex(item => item.id === itemId);
              if (requestIndex !== -1) {
                (folder.items[requestIndex] as ApiRequest).name = newName;
              }
            }
          }
        }
      }

      return updatedCollections;
    });
  }, []);

  // Delete an item (collection, folder, or request)
  const deleteItem = useCallback((
    itemId: string,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => {
    setCollections(prev => {
      if (itemType === 'collection') {
        // Delete the collection
        return prev.filter(c => c.id !== itemId);
      } else {
        const updatedCollections = [...prev];

        if (path.length > 0) {
          // Find the collection
          const collectionId = path[0];
          const collection = updatedCollections.find(c => c.id === collectionId);

          if (collection) {
            if (path.length === 1) {
              // Item is directly in collection
              collection.items = collection.items.filter(item => item.id !== itemId);
            } else if (path.length === 2) {
              // Item is in a folder
              const folderId = path[1];
              const folder = collection.items.find(
                item => 'items' in item && item.id === folderId,
              ) as Folder | undefined;

              if (folder) {
                folder.items = folder.items.filter(item => item.id !== itemId);
              }
            }
          }
        }

        return updatedCollections;
      }
    });
  }, []);

  // Move an item (folder or request) from one location to another
  const moveItem = useCallback((
    itemId: string,
    itemType: 'folder' | 'request',
    sourcePath: string[],
    targetPath: string[],
  ) => {
    if (sourcePath.length === 0) {
      return; // Can't move from root level
    }

    setCollections(prev => {
      const updatedCollections = [...prev];
      let movedItem: ApiRequest | Folder | null = null;

      // 1. Remove the item from its source location
      const sourceCollectionId = sourcePath[0];
      const sourceCollection = updatedCollections.find(c => c.id === sourceCollectionId);

      if (sourceCollection) {
        if (sourcePath.length === 1) {
          // Item is directly in collection
          const itemIndex = sourceCollection.items.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            movedItem = sourceCollection.items[itemIndex];
            sourceCollection.items.splice(itemIndex, 1);
          }
        } else if (sourcePath.length === 2) {
          // Item is in a folder
          const folderId = sourcePath[1];
          const folder = sourceCollection.items.find(
            item => 'items' in item && item.id === folderId,
          ) as Folder | undefined;

          if (folder) {
            const itemIndex = folder.items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
              movedItem = folder.items[itemIndex];
              folder.items.splice(itemIndex, 1);
            }
          }
        }
      }

      // If we have an item to move and a valid target path
      if (movedItem) {
        // 2. Add the item to its target location
        if (targetPath.length === 0) {
          // Not supported for now
          return updatedCollections;
        }

        const targetCollectionId = targetPath[0];
        const targetCollection = updatedCollections.find(c => c.id === targetCollectionId);

        if (targetCollection) {
          if (targetPath.length === 1) {
            // Target is collection root
            targetCollection.items.push(movedItem);

            // Update folderPath if it's a request
            if (itemType === 'request' && !('items' in movedItem)) {
              (movedItem as ApiRequest).folderPath = [targetCollectionId];
            } else if (itemType === 'folder' && 'items' in movedItem) {
              (movedItem as Folder).parentPath = [targetCollectionId];
            }
          } else if (targetPath.length === 2) {
            // Target is a folder
            const folderId = targetPath[1];
            const folder = targetCollection.items.find(
              item => 'items' in item && item.id === folderId,
            ) as Folder | undefined;

            if (folder) {
              folder.items.push(movedItem);

              // Update folderPath if it's a request
              if (itemType === 'request' && !('items' in movedItem)) {
                (movedItem as ApiRequest).folderPath = [targetCollectionId, folderId];
              } else if (itemType === 'folder' && 'items' in movedItem) {
                (movedItem as Folder).parentPath = [targetCollectionId, folderId];
              }
            }
          }
        }
      }

      return updatedCollections;
    });
  }, []);

  // Duplicate a request
  const duplicateRequest = useCallback((requestId: string, path: string[]) => {
    let duplicatedRequest: ApiRequest | null = null;

    setCollections(prev => {
      // Find the original request to duplicate
      const originalRequest = findRequestById(prev, requestId);

      if (!originalRequest) {
        console.error('Could not find request to duplicate');
        return prev;
      }

      // Create a duplicate with a new ID
      duplicatedRequest = {
        ...JSON.parse(JSON.stringify(originalRequest)), // Deep copy to ensure no references
        id: uuidv4(),
        name: `${originalRequest.name} (Copy)`,
        folderPath: [...path], // Ensure it's placed in the same folder
      };

      // Add the duplicated request to the same folder as the original
      const updatedCollections = [...prev];

      if (path.length === 0) {
        // Should not happen as we always have a path
        return updatedCollections;
      }

      const collectionId = path[0];
      const collectionIndex = updatedCollections.findIndex(c => c.id === collectionId);

      if (collectionIndex === -1) {
        console.error('Collection not found');
        return updatedCollections;
      }

      const collection = updatedCollections[collectionIndex];

      if (path.length === 1) {
        // Add to collection root
        collection.items.push(duplicatedRequest);
      } else {
        // Navigate to the target folder
        let currentItems = collection.items;
        const currentPath = path.slice(1);

        for (let i = 0; i < currentPath.length; i++) {
          const folderId = currentPath[i];
          const folderIndex = currentItems.findIndex(
            item => 'items' in item && item.id === folderId,
          );

          if (folderIndex === -1) {
            console.error('Folder not found in path');
            return updatedCollections;
          }

          const folder = currentItems[folderIndex] as Folder;

          if (i === currentPath.length - 1) {
            // We're at the target folder, add the request
            folder.items.push(duplicatedRequest);
          } else {
            // Continue navigating
            currentItems = folder.items;
          }
        }
      }

      return updatedCollections;
    });

    return duplicatedRequest;
  }, []);

  // Update a request in the collections
  const updateRequest = useCallback((updatedRequest: ApiRequest) => {
    setCollections(prev => {
      const updatedCollections = updateRequestInCollections(prev, updatedRequest);
      return updatedCollections;
    });
  }, []);

  // Add a new collection to the collections
  const addCollection = useCallback((collection: Folder) => {
    setCollections(prev => [...prev, collection]);
  }, []);

  return {
    collections,
    loading,
    error,
    addFolder,
    addRequest,
    renameItem,
    deleteItem,
    moveItem,
    duplicateRequest,
    updateRequest,
    addCollection,
  };
} 