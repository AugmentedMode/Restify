import { useState } from 'react';

interface RenameModalState {
  visible: boolean;
  item: any;
  itemType: 'collection' | 'request' | 'folder';
  path: string[];
}

interface DeleteModalState {
  visible: boolean;
  item: any;
  itemType: 'collection' | 'request' | 'folder';
  path: string[];
}

interface MoveModalState {
  visible: boolean;
  item: any;
  itemType: 'request' | 'folder';
  path: string[];
}

export const useModalState = () => {
  // Import panel states
  const [showImportCurlModal, setShowImportCurlModal] = useState(false);
  const [showImportFileModal, setShowImportFileModal] = useState(false);
  
  // Rename modal state
  const [renameModal, setRenameModal] = useState<RenameModalState>({
    visible: false,
    item: null,
    itemType: 'request',
    path: [],
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    visible: false,
    item: null,
    itemType: 'request',
    path: [],
  });

  // Move modal state
  const [moveModal, setMoveModal] = useState<MoveModalState>({
    visible: false,
    item: null,
    itemType: 'request',
    path: [],
  });

  // Note options modal state
  const [noteOptionsModal, setNoteOptionsModal] = useState<any>(null);

  // Create panel state
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // Show rename modal
  const showRenameModal = (item: any, itemType: 'collection' | 'request' | 'folder', path: string[]) => {
    setRenameModal({
      visible: true,
      item,
      itemType,
      path,
    });
  };

  // Show delete modal
  const showDeleteModal = (item: any, itemType: 'collection' | 'request' | 'folder', path: string[]) => {
    setDeleteModal({
      visible: true,
      item,
      itemType,
      path,
    });
  };

  // Show move modal
  const showMoveModal = (item: any, itemType: 'request' | 'folder', path: string[]) => {
    setMoveModal({
      visible: true,
      item,
      itemType,
      path,
    });
  };

  // Toggle create panel
  const toggleCreatePanel = () => {
    setShowCreatePanel(!showCreatePanel);
  };

  return {
    // Import modals
    showImportCurlModal,
    setShowImportCurlModal,
    showImportFileModal, 
    setShowImportFileModal,
    
    // Rename modal
    renameModal,
    setRenameModal,
    showRenameModal,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    showDeleteModal,
    
    // Move modal
    moveModal,
    setMoveModal,
    showMoveModal,
    
    // Note options modal
    noteOptionsModal,
    setNoteOptionsModal,
    
    // Create panel
    showCreatePanel,
    setShowCreatePanel,
    toggleCreatePanel,
  };
}; 