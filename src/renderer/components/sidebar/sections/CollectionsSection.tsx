import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookmark, FaChevronUp, FaFolderPlus } from 'react-icons/fa';
import { EmptyHistoryMessage, ActionButton, CollectionHeader, CollectionIcon, CollectionTitle, ActionButtons } from '../../../styles/StyledComponents';
import { Folder, ApiRequest } from '../../../types';
import CollapsibleSection from '../components/CollapsibleSection';
import CollectionItem from '../components/CollectionItem';
import RequestItem from '../components/RequestItem';

// Animation variants
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
  expandedSections: { collections: boolean };
  toggleSection: (section: 'collections') => void;
  toggleFolder: (folderId: string, e: React.MouseEvent) => void;
  toggleAllFolders: () => void;
  onSelectRequest: (request: ApiRequest) => void;
  onAddFolder: () => void;
  onAddRequest: (folderPath: string[]) => void;
  handleContextMenu: (
    e: React.MouseEvent,
    item: any,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => void;
  filter: string;
}

const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  collections,
  activeRequestId,
  expandedFolders,
  expandedSections,
  toggleSection,
  toggleFolder,
  toggleAllFolders,
  onSelectRequest,
  onAddFolder,
  onAddRequest,
  handleContextMenu,
  filter,
}) => {
  // Filter collections based on search input
  const filterCollections = (
    collections: Folder[],
    filter: string,
  ): Folder[] => {
    if (!filter.trim()) return collections;

    const lowerFilter = filter.toLowerCase();

    return collections
      .map((collection) => {
        // Check if collection name matches filter
        const collectionMatches = collection.name
          .toLowerCase()
          .includes(lowerFilter);

        // Check if any request in collection matches filter
        const items = [...(collection.items || [])];
        const filteredItems = items.filter((item) => {
          if ('method' in item) {
            // It's a request
            return (
              item.name.toLowerCase().includes(lowerFilter) ||
              item.url.toLowerCase().includes(lowerFilter) ||
              item.method.toLowerCase().includes(lowerFilter)
            );
          }
          // It's a folder
          // Recursively filter folders
          const filteredFolder = filterCollections([item as Folder], filter)[0];
          return (
            filteredFolder &&
            filteredFolder.items &&
            filteredFolder.items.length > 0
          );
        });

        // Return collection with filtered items if it matches or has matching items
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

  // Filter collections based on search
  const filteredCollections = filter
    ? filterCollections(collections, filter)
    : collections;

  // Render collection items recursively
  const renderCollectionItems = (
    items: (ApiRequest | Folder)[],
    parentPath: string[] = [],
  ) => {
    return (
      <motion.div variants={listVariants} initial="hidden" animate="visible">
        {items.map((item) => {
          if ('method' in item) {
            // It's a request
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
          // It's a folder
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

  const sectionActions = (
    <ActionButtons>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onAddFolder();
        }}
        title="Add Collection"
        className="action-button"
      >
        <FaFolderPlus />
      </ActionButton>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          toggleAllFolders();
        }}
        title="Expand/Collapse All"
        className="action-button"
      >
        <FaChevronUp />
      </ActionButton>
    </ActionButtons>
  );

  const sectionTitle = (
    <CollectionHeader>
      <CollectionIcon>
        <FaBookmark />
      </CollectionIcon>
      <CollectionTitle>Collections</CollectionTitle>
    </CollectionHeader>
  );

  return (
    <CollapsibleSection
      title={sectionTitle}
      expanded={expandedSections.collections}
      onToggle={() => toggleSection('collections')}
      actions={sectionActions}
    >
      {filteredCollections.length === 0 ? (
        <EmptyHistoryMessage>
          {filter
            ? 'No matching collections found.'
            : 'No collections yet. Create one to get started.'}
        </EmptyHistoryMessage>
      ) : (
        filteredCollections.map((collection) => (
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
        ))
      )}
    </CollapsibleSection>
  );
};

export default CollectionsSection; 