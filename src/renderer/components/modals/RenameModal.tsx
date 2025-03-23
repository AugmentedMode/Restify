import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalActions,
  InputGroup,
  SendButton,
  SettingsButton,
} from '../../styles/StyledComponents';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
  itemType: 'collection' | 'request' | 'folder';
}

function RenameModal({
  isOpen,
  onClose,
  onRename,
  currentName,
  itemType,
}: RenameModalProps) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Rename {itemType}</h2>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </InputGroup>
          <ModalActions>
            <SettingsButton 
              type="button" 
              onClick={onClose}
            >
              Cancel
            </SettingsButton>
            <SendButton type="submit">Rename</SendButton>
          </ModalActions>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default RenameModal; 