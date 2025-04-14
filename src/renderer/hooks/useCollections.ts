import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, ApiRequest } from '../types';
import { CollectionsService } from '../services/DatabaseService';
import EventService from '../services/EventService';

// Interface for the hook return value
export interface UseCollectionsReturn {
  collections: Folder[];
  loading: boolean;
  error: string | null;
  addFolder: () => Folder;
  addRequest: (request: ApiRequest, folderPath: string[]) => ApiRequest;
  renameItem: (id: string, newName: string) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newFolderPath: string[]) => void;
  duplicateRequest: (id: string) => ApiRequest | null;
  updateRequest: (request: ApiRequest) => void;
  addCollection: (collection: Folder) => void;
}

/**
 * Custom hook for managing collections state
 */
export default function useCollections(initialCollections: Folder[] = []): UseCollectionsReturn {
  const [collections, setCollections] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to fetch collections
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const loadedCollections = await CollectionsService.getAllCollections();
      
      if (loadedCollections && loadedCollections.length > 0) {
        setCollections(loadedCollections);
      } else {
        // Only use initialCollections if we couldn't load from IndexedDB
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

  // Load collections from IndexedDB on mount
  useEffect(() => {
    fetchCollections();
  }, [initialCollections]);

  // Listen for collection update events
  useEffect(() => {
    // Set up listener for collection update events
    const unsubscribe = EventService.onCollectionsUpdated(() => {
      console.log('[Collections] Received collection update event, refreshing collections');
      fetchCollections();
    });
    
    // Clean up listener when component unmounts
    return unsubscribe;
  }, []);

  // Save collections when they change
  useEffect(() => {
    const persistCollections = async () => {
      try {
        if (collections.length > 0) {
          await CollectionsService.saveAllCollections(collections);
        }
      } catch (err) {
        console.error('Failed to save collections:', err);
        setError('Failed to save collections');
      }
    };

    if (!loading) {
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

  // Add a request to a specified folder path
  const addRequest = useCallback((request: ApiRequest, folderPath: string[]) => {
    const updatedRequest = { ...request, folderPath };

    setCollections(prevCollections => {
      if (folderPath.length === 0) {
        // If no folder path, add to main level
        return [...prevCollections, { 
          id: uuidv4(), 
          name: 'Unsorted Requests',
          items: [updatedRequest],
          parentPath: [],
        }];
      }

      // Find the target folder and add the request
      return prevCollections.map(collection => {
        if (collection.id === folderPath[0]) {
          return addRequestToFolder(collection, updatedRequest, folderPath.slice(1));
        }
        return collection;
      });
    });

    return updatedRequest;
  }, []);

  // Helper function to add a request to a nested folder
  const addRequestToFolder = (folder: Folder, request: ApiRequest, remainingPath: string[]): Folder => {
    if (remainingPath.length === 0) {
      // We're at the target folder, add the request here
      return {
        ...folder,
        items: [...folder.items, request],
      };
    }

    // We need to go deeper, find the next folder in the path
    return {
      ...folder,
      items: folder.items.map(item => {
        if ('items' in item && item.id === remainingPath[0]) {
          return addRequestToFolder(item, request, remainingPath.slice(1));
        }
        return item;
      }),
    };
  };

  // Rename a collection or request
  const renameItem = useCallback((id: string, newName: string) => {
    setCollections(prevCollections => {
      return prevCollections.map(collection => {
        // Check if this is the item to rename
        if (collection.id === id) {
          return { ...collection, name: newName };
        }

        // Otherwise, search in items
        return {
          ...collection,
          items: renameItemInFolder(collection.items, id, newName),
        };
      });
    });
  }, []);

  // Helper function to rename an item in a nested structure
  const renameItemInFolder = (items: (Folder | ApiRequest)[], id: string, newName: string): (Folder | ApiRequest)[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, name: newName };
      }

      // If it's a folder, recursively search its items
      if ('items' in item) {
        return {
          ...item,
          items: renameItemInFolder(item.items, id, newName),
        };
      }

      return item;
    });
  };

  // Delete a collection or request
  const deleteItem = useCallback((id: string) => {
    // First, check if the item is a top-level collection
    const isTopLevelCollection = collections.some(collection => collection.id === id);
    
    // If it's a top-level collection, delete it from the database directly
    if (isTopLevelCollection) {
      CollectionsService.deleteCollection(id)
        .then(() => {
          // Then update the state
          setCollections(prevCollections => 
            prevCollections.filter(collection => collection.id !== id)
          );
        })
        .catch(error => {
          console.error('Failed to delete collection:', error);
        });
    } else {
      // For nested items, we need to find where the item is located
      // and check if it's a folder (has 'items' property)
      let isFolder = false;
      let foundItem: Folder | ApiRequest | null = null;
      
      // Helper function to find an item in the collections
      const findItem = (items: (Folder | ApiRequest)[]): (Folder | ApiRequest) | null => {
        for (const item of items) {
          if (item.id === id) {
            return item;
          }
          if ('items' in item) {
            const foundInSubfolder = findItem(item.items);
            if (foundInSubfolder) {
              return foundInSubfolder;
            }
          }
        }
        return null;
      };
      
      // Search for the item in the collections
      for (const collection of collections) {
        foundItem = findItem(collection.items);
        if (foundItem) {
          isFolder = 'items' in foundItem;
          break;
        }
      }
      
      // If it's a folder, delete it from the database
      if (isFolder) {
        CollectionsService.deleteCollection(id)
          .then(() => {
            // Then update the state
            setCollections(prevCollections => {
              return prevCollections.map(collection => ({
                ...collection,
                items: deleteItemFromFolder(collection.items, id),
              }));
            });
          })
          .catch(error => {
            console.error('Failed to delete folder:', error);
          });
      } else {
        // For regular items (not folders), just update the state
        setCollections(prevCollections => {
          return prevCollections.map(collection => ({
            ...collection,
            items: deleteItemFromFolder(collection.items, id),
          }));
        });
      }
    }
  }, [collections]);

  // Helper function to delete an item from a nested structure
  const deleteItemFromFolder = (items: (Folder | ApiRequest)[], id: string): (Folder | ApiRequest)[] => {
    // First, filter out the item if it's direct child
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length < items.length) {
      return filteredItems;
    }

    // Otherwise, recursively search folders
    return filteredItems.map(item => {
      if ('items' in item) {
        return {
          ...item,
          items: deleteItemFromFolder(item.items, id),
        };
      }
      return item;
    });
  };

  // Move an item to a new folder
  const moveItem = useCallback((id: string, newFolderPath: string[]) => {
    // Find the item first
    let itemToMove: Folder | ApiRequest | null = null;
    let itemType: 'folder' | 'request' = 'request';

    // Recursive function to find and extract the item
    const findAndExtractItem = (items: (Folder | ApiRequest)[]): (Folder | ApiRequest)[] => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.id === id) {
          itemToMove = { ...item };
          
          if ('items' in item) {
            itemType = 'folder';
            // Update parentPath for the moved folder
            itemToMove = {
              ...itemToMove as Folder,
              parentPath: newFolderPath,
            };
          } else {
            // Update folderPath for the moved request
            itemToMove = {
              ...itemToMove as ApiRequest,
              folderPath: newFolderPath,
            };
          }
          
          // Remove the item from the current location
          return [...items.slice(0, i), ...items.slice(i + 1)];
        }
        
        if ('items' in item) {
          const newItems = findAndExtractItem(item.items);
          
          if (newItems.length !== item.items.length) {
            // The item was found and removed from this folder
            return [
              ...items.slice(0, i),
              { ...item, items: newItems },
              ...items.slice(i + 1),
            ];
          }
        }
      }
      
      return items;
    };

    setCollections(prevCollections => {
      // First, find and extract the item
      const updatedCollections = prevCollections.map(collection => {
        if (collection.id === id) {
          itemToMove = { ...collection };
          itemType = 'folder';
          // Update parentPath for the moved folder
          itemToMove = {
            ...itemToMove as Folder,
            parentPath: newFolderPath,
          };
          return null; // Will be filtered out
        }
        
        if ('items' in collection) {
          const newItems = findAndExtractItem(collection.items);
          
          if (newItems.length !== collection.items.length) {
            // The item was found and removed from this collection
            return { ...collection, items: newItems };
          }
        }
        
        return collection;
      }).filter(Boolean) as Folder[];
      
      if (!itemToMove) {
        console.error(`Item with id ${id} not found for moving`);
        return prevCollections;
      }
      
      // Now, add the item to its new location
      if (newFolderPath.length === 0) {
        // Moving to root level
        if (itemType === 'folder') {
          return [...updatedCollections, itemToMove as Folder];
        } else {
          // Create a new collection for orphaned requests
          const newCollection: Folder = {
            id: uuidv4(),
            name: 'Moved Requests',
            items: [itemToMove as ApiRequest],
            parentPath: [],
          };
          return [...updatedCollections, newCollection];
        }
      }
      
      // Moving to a nested folder
      return updatedCollections.map(collection => {
        if (collection.id === newFolderPath[0]) {
          return addItemToFolder(
            collection,
            itemToMove as (Folder | ApiRequest),
            newFolderPath.slice(1),
            itemType
          );
        }
        return collection;
      });
    });
  }, []);

  // Helper function to add an item to a nested folder
  const addItemToFolder = (
    folder: Folder,
    item: Folder | ApiRequest,
    remainingPath: string[],
    itemType: 'folder' | 'request'
  ): Folder => {
    if (remainingPath.length === 0) {
      // We're at the target folder, add the item here
      return {
        ...folder,
        items: [...folder.items, item],
      };
    }

    // We need to go deeper, find the next folder in the path
    return {
      ...folder,
      items: folder.items.map(existingItem => {
        if ('items' in existingItem && existingItem.id === remainingPath[0]) {
          return addItemToFolder(
            existingItem,
            item,
            remainingPath.slice(1),
            itemType
          );
        }
        return existingItem;
      }),
    };
  };

  // Duplicate a request
  const duplicateRequest = useCallback((id: string) => {
    let originalRequest: ApiRequest | null = null;
    let duplicatedRequest: ApiRequest | null = null;

    setCollections(prevCollections => {
      // Recursive function to find the request
      const findRequestInItems = (items: (Folder | ApiRequest)[]): (Folder | ApiRequest)[] => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          if (!('items' in item) && item.id === id) {
            // Found the request to duplicate
            originalRequest = item;
            
            // Create a duplicate with a new ID
            duplicatedRequest = {
              ...item,
              id: uuidv4(),
              name: `${item.name} (Copy)`,
            };
            
            // Insert the duplicated request next to the original
            return [
              ...items.slice(0, i + 1),
              duplicatedRequest,
              ...items.slice(i + 1),
            ];
          }
          
          if ('items' in item) {
            const newItems = findRequestInItems(item.items);
            
            if (newItems.length !== item.items.length) {
              // The request was found and duplicated in this folder
              return [
                ...items.slice(0, i),
                { ...item, items: newItems },
                ...items.slice(i + 1),
              ];
            }
          }
        }
        
        return items;
      };

      // Search for the request in each collection
      return prevCollections.map(collection => {
        const newItems = findRequestInItems(collection.items);
        
        if (newItems.length !== collection.items.length) {
          // The request was found and duplicated in this collection
          return { ...collection, items: newItems };
        }
        
        return collection;
      });
    });

    return duplicatedRequest;
  }, []);

  // Update an existing request
  const updateRequest = useCallback((updatedRequest: ApiRequest) => {
    setCollections(prevCollections => {
      // Recursive function to update the request
      const updateRequestInItems = (items: (Folder | ApiRequest)[]): (Folder | ApiRequest)[] => {
        return items.map(item => {
          if (!('items' in item) && item.id === updatedRequest.id) {
            // Found the request to update
            return updatedRequest;
          }
          
          if ('items' in item) {
            // Recursively search in subfolders
            return {
              ...item,
              items: updateRequestInItems(item.items),
            };
          }
          
          return item;
        });
      };

      // Search for the request in each collection
      return prevCollections.map(collection => ({
        ...collection,
        items: updateRequestInItems(collection.items),
      }));
    });
  }, []);

  // Add a new collection directly
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