import React from 'react';
import { FaPlus, FaPen, FaTrash, FaArrowRight, FaCopy, FaEllipsisV } from 'react-icons/fa';
import { ContextMenu as ContextMenuStyled, ContextMenuItem, ContextMenuDivider } from '../../../styles/StyledComponents';

interface ContextMenuProps {
  item: any;
  itemType: 'collection' | 'folder' | 'request' | 'note';
  position: { x: number; y: number };
  onAction: (action: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ item, itemType, position, onAction }) => {
  return (
    <ContextMenuStyled
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
      }}
    >
      {itemType === 'request' && (
        <>
          <ContextMenuItem onClick={() => onAction('rename')}>
            <FaPen size={12} />
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAction('duplicate')}>
            <FaCopy size={12} />
            <span>Duplicate</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAction('move')}>
            <FaArrowRight size={12} />
            <span>Move</span>
          </ContextMenuItem>
          <ContextMenuDivider />
          <ContextMenuItem onClick={() => onAction('delete')}>
            <FaTrash size={12} />
            <span>Delete</span>
          </ContextMenuItem>
        </>
      )}
      
      {itemType === 'folder' && (
        <>
          <ContextMenuItem onClick={() => onAction('add-request')}>
            <FaPlus size={12} />
            <span>Add Request</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAction('rename')}>
            <FaPen size={12} />
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAction('move')}>
            <FaArrowRight size={12} />
            <span>Move</span>
          </ContextMenuItem>
          <ContextMenuDivider />
          <ContextMenuItem onClick={() => onAction('delete')}>
            <FaTrash size={12} />
            <span>Delete</span>
          </ContextMenuItem>
        </>
      )}
      
      {itemType === 'collection' && (
        <>
          <ContextMenuItem onClick={() => onAction('add-request')}>
            <FaPlus size={12} />
            <span>Add Request</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onAction('rename')}>
            <FaPen size={12} />
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuDivider />
          <ContextMenuItem onClick={() => onAction('delete')}>
            <FaTrash size={12} />
            <span>Delete</span>
          </ContextMenuItem>
        </>
      )}
      
      {itemType === 'note' && (
        <>
          <ContextMenuItem onClick={() => onAction('note-options')}>
            <FaPen size={12} />
            <span>Options</span>
          </ContextMenuItem>
          <ContextMenuDivider />
          <ContextMenuItem onClick={() => onAction('delete')}>
            <FaTrash size={12} />
            <span>Delete</span>
          </ContextMenuItem>
        </>
      )}
    </ContextMenuStyled>
  );
};

export default ContextMenu; 