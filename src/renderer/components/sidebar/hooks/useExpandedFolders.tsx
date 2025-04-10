import { useState, useEffect } from 'react';
import { Folder } from '../../../types';

export const useExpandedFolders = () => {
  // Load expanded folders from localStorage
  const getInitialExpandedFolders = (): Record<string, boolean> => {
    try {
      const saved = localStorage.getItem('api-client-expanded-folders');
      return saved ? JSON.parse(saved) : {};
    } catch (err) {
      console.error('Failed to load expanded folders state:', err);
      return {};
    }
  };

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(
    getInitialExpandedFolders()
  );

  // Toggle a single folder
  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Toggle all folders
  const toggleAllFolders = (collections: Folder[]) => {
    // Get all folder IDs
    const folderIds: string[] = [];

    const collectFolderIds = (items: any[], parentPath: string[] = []) => {
      items.forEach((item) => {
        if ('items' in item) {
          folderIds.push(item.id);
          if (item.items) {
            collectFolderIds(item.items, [...parentPath, item.id]);
          }
        }
      });
    };

    collections.forEach((collection) => {
      if (collection.items) {
        collectFolderIds(collection.items);
      }
    });

    // Check if all folders are expanded
    const allExpanded = folderIds.every((id) => expandedFolders[id]);

    // Toggle all folders
    const newExpandedFolders: Record<string, boolean> = {};
    folderIds.forEach((id) => {
      newExpandedFolders[id] = !allExpanded;
    });

    setExpandedFolders(newExpandedFolders);
  };

  // Save expanded folders state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'api-client-expanded-folders',
        JSON.stringify(expandedFolders),
      );
    } catch (err) {
      console.error('Failed to save expanded folders state:', err);
    }
  }, [expandedFolders]);

  return {
    expandedFolders,
    toggleFolder,
    toggleAllFolders,
  };
}; 