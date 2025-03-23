import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalActions,
  InputGroup,
  SendButton,
  SettingsButton,
} from '../../styles/StyledComponents';
import { Folder } from '../../types';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetPath: string[]) => void;
  collections: Folder[];
  itemType: 'request' | 'folder';
  currentPath: string[];
}

function MoveModal({
  isOpen,
  onClose,
  onMove,
  collections,
  itemType,
  currentPath,
}: MoveModalProps) {
  const [selectedPath, setSelectedPath] = useState('');

  // Generate options for collections and folders
  const generateOptions = () => {
    const options: { value: string; label: string }[] = [];
    
    // Root level option
    if (itemType === 'request') {
      options.push({ value: '', label: 'Root Level' });
    }
    
    // Add collections
    collections.forEach(collection => {
      options.push({ 
        value: collection.id, 
        label: collection.name 
      });
      
      // Add folders within collections
      collection.items
        .filter(item => 'items' in item) // Only folders
        .forEach(folder => {
          options.push({
            value: `${collection.id}/${(folder as Folder).id}`,
            label: `${collection.name} / ${(folder as Folder).name}`
          });
        });
    });
    
    return options;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPath) {
      const pathParts = selectedPath.split('/').filter(Boolean);
      onMove(pathParts);
      onClose();
    } else if (itemType === 'request') {
      // Moving to root level
      onMove([]);
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;
  
  // Get current path display
  const getCurrentPathDisplay = () => {
    if (currentPath.length === 0) return 'Root Level';
    
    let result = '';
    for (let i = 0; i < currentPath.length; i++) {
      const id = currentPath[i];
      let foundItem = null;
      
      if (i === 0) {
        // Look for collection
        foundItem = collections.find(col => col.id === id);
      } else {
        // Look for folder
        const parent = collections.find(col => col.id === currentPath[0]);
        if (parent) {
          const item = parent.items.find(item => 'items' in item && item.id === id);
          foundItem = item;
        }
      }
      
      if (foundItem) {
        result += (result ? ' / ' : '') + foundItem.name;
      } else {
        result += (result ? ' / ' : '') + id;
      }
    }
    
    return result;
  };

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Move {itemType}</h2>
        <p>Current location: {getCurrentPathDisplay()}</p>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <label htmlFor="location">Move to:</label>
            <select
              id="location"
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
            >
              {itemType === 'request' && (
                <option value="">Root Level</option>
              )}
              {generateOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </InputGroup>
          <ModalActions>
            <SettingsButton type="button" onClick={onClose}>
              Cancel
            </SettingsButton>
            <SendButton type="submit">Move</SendButton>
          </ModalActions>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default MoveModal; 