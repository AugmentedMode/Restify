import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyHistoryMessage } from '../../../styles/StyledComponents';
import { Folder, ApiRequest } from '../../../types';
import CollectionItem from '../components/CollectionItem';
import RequestItem from '../components/RequestItem';

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

interface CollectionsSectionProps {
  collections: Folder[];
  activeRequestId: string | null;
  expandedFolders: Record<string, boolean>;
  toggleFolder: (folderId: string, e: React.MouseEvent) => void;
  onSelectRequest: (request: ApiRequest) => void;
  onAddFolder: () => void;
  onAddRequest: (folderPath: string[]) => void;
  handleContextMenu: (
    e: React.MouseEvent,
    item: any,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => void;
  onContextMenuAction?: (
    action: string,
    item: any,
    itemType: 'collection' | 'folder' | 'request',
    path: string[]
  ) => void;
  filter: string;
}

const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  collections,
  activeRequestId,
  expandedFolders,
  toggleFolder,
  onSelectRequest,
  onAddFolder,
  onAddRequest,
  handleContextMenu,
  onContextMenuAction,
  filter,
}) => {
  const filterCollections = (
    collections: Folder[],
    filter: string,
  ): Folder[] => {
    if (!filter.trim()) return collections;

    const lowerFilter = filter.toLowerCase();

    return collections
      .map((collection) => {
        const collectionMatches = collection.name
          .toLowerCase()
          .includes(lowerFilter);

        const items = [...(collection.items || [])];
        const filteredItems = items.filter((item) => {
          if ('method' in item) {
            return (
              item.name.toLowerCase().includes(lowerFilter) ||
              item.url.toLowerCase().includes(lowerFilter) ||
              item.method.toLowerCase().includes(lowerFilter)
            );
          }
          const filteredFolder = filterCollections([item as Folder], filter)[0];
          return (
            filteredFolder &&
            filteredFolder.items &&
            filteredFolder.items.length > 0
          );
        });

        if (collectionMatches || filteredItems.length > 0) {
          return {
            ...collection,
            items: filteredItems,
          };
        }

        return null;
      })
      .filter(Boolean) as Folder[];
  };

  const filteredCollections = filter
    ? filterCollections(collections, filter)
    : collections;

  const renderCollectionItems = (
    items: (ApiRequest | Folder)[],
    parentPath: string[] = [],
  ) => {
    return (
      <motion.div variants={listVariants} initial="hidden" animate="visible">
        {items.map((item) => {
          if ('method' in item) {
            const request = item as ApiRequest;
            return (
              <RequestItem
                key={request.id}
                request={request}
                isActive={activeRequestId === request.id}
                onSelectRequest={onSelectRequest}
                handleContextMenu={handleContextMenu}
                path={parentPath}
              />
            );
          }
          const folder = item as Folder;
          const isExpanded = expandedFolders[folder.id];
          const currentPath = [...parentPath, folder.id];

          return (
            <motion.div
              key={folder.id}
              variants={itemVariants}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <CollectionItem
                collection={folder}
                isExpanded={isExpanded}
                toggleFolder={toggleFolder}
                handleContextMenu={handleContextMenu}
                path={parentPath}
                itemType="folder"
              />
              <AnimatePresence>
                {isExpanded && folder.items && folder.items.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginLeft: 16, overflow: 'hidden' }}
                  >
                    {renderCollectionItems(folder.items, currentPath)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  if (filteredCollections.length === 0) {
    return (
      <EmptyHistoryMessage>
        {filter
          ? 'No matching collections found.'
          : 'No collections yet. Create one to get started.'}
      </EmptyHistoryMessage>
    );
  }

  return (
    <div style={{ padding: '0 4px' }}>
      {filteredCollections.map((collection) => (
        <motion.div
          key={collection.id}
          variants={itemVariants}
          transition={{ duration: 0.2 }}
        >
          <CollectionItem
            collection={collection}
            isExpanded={expandedFolders[collection.id]}
            toggleFolder={toggleFolder}
            handleContextMenu={handleContextMenu}
          />
          {expandedFolders[collection.id] && collection.items && (
            <div style={{ marginLeft: 16 }}>
              {renderCollectionItems(collection.items, [collection.id])}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default CollectionsSection;
