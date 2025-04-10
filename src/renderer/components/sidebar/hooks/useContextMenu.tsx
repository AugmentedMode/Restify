import { useState, useEffect } from 'react';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  item: any;
  itemType: 'collection' | 'request' | 'folder' | 'note';
  path: string[];
}

const defaultState: ContextMenuState = {
  visible: false,
  x: 0,
  y: 0,
  item: null,
  itemType: 'request',
  path: [],
};

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(defaultState);

  const handleContextMenu = (
    e: React.MouseEvent,
    item: any,
    itemType: 'collection' | 'request' | 'folder' | 'note',
    path: string[] = [],
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
      itemType,
      path,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(state => ({ ...state, visible: false }));
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
}; 