import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronRight, FaFolder, FaFolderOpen, FaEllipsisV } from 'react-icons/fa';
import { CollectionItemContainer, FolderItem, ActionButton } from '../../../styles/StyledComponents';
import { Folder } from '../../../types';

interface CollectionItemProps {
  collection: Folder;
  isExpanded: boolean;
  toggleFolder: (folderId: string, e: React.MouseEvent) => void;
  handleContextMenu: (
    e: React.MouseEvent,
    item: any,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => void;
  path?: string[];
  itemType?: 'collection' | 'folder';
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  isExpanded,
  toggleFolder,
  handleContextMenu,
  path = [],
  itemType = 'collection',
}) => {
  return (
    <CollectionItemContainer
      onContextMenu={(e) => handleContextMenu(e, collection, itemType, path)}
    >
      <FolderItem
        onClick={(e) => {
          toggleFolder(collection.id, e);
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <motion.div
            animate={{
              rotate: isExpanded ? 0 : -90,
            }}
            transition={{ duration: 0.2 }}
            style={{ marginRight: 8 }}
          >
            {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </motion.div>
          <div style={{ marginRight: 8 }}>{isExpanded ? <FaFolderOpen /> : <FaFolder />}</div>
          <div>{collection.name}</div>
        </div>
        <ActionButton
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e, collection, itemType, path);
          }}
          aria-label="Menu"
          className="action-button"
        >
          <FaEllipsisV size={12} />
        </ActionButton>
      </FolderItem>
    </CollectionItemContainer>
  );
};

export default CollectionItem; 