import React, { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';
import { FaFolderPlus } from 'react-icons/fa';
import { Folder } from '../../types';
import { modalDataStore } from '../../utils/modalDataStore';

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCollection: (collection: Folder) => void;
}

// Styled components for the modal
const StyledModal = styled(Modal)`
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
`;

const AirbnbModalContent = styled(ModalContent)`
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 100%;
  background-color: #222222;
  transform: translateY(0);
  animation: modalFadeIn 0.3s ease-out;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalTitle = styled.h2`
  font-family:
    'Circular',
    -apple-system,
    BlinkMacSystemFont,
    Roboto,
    Helvetica Neue,
    sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 6px 0;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalSubtitle = styled.p`
  font-family:
    'Circular',
    -apple-system,
    BlinkMacSystemFont,
    Roboto,
    Helvetica Neue,
    sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #dddddd;
  margin-bottom: 24px;
  margin-top: 0;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #ff385c;
  border-radius: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #dddddd;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background-color: #333333;
  border: 1px solid #444444;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #ff385c;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }

  &::placeholder {
    color: #777777;
  }
`;

const ModalActionsContainer = styled(ModalActions)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  margin-top: 32px;
`;

const CancelText = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  color: #dddddd;
  cursor: pointer;
  font-family:
    'Circular',
    -apple-system,
    BlinkMacSystemFont,
    Roboto,
    Helvetica Neue,
    sans-serif;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ffffff;
    text-decoration: underline;
  }
`;

const CreateButton = styled(SendButton)`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  background-color: #ff385c;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e00b41;
  }
`;

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({
  isOpen,
  onClose,
  onAddCollection,
}) => {
  const [collectionName, setCollectionName] = useState('');

  // Don't render if not open
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionName.trim()) {
      return; // Basic validation
    }

    // Create new collection
    const newCollection: Folder = {
      id: uuidv4(),
      name: collectionName.trim(),
      items: [],
      parentPath: [],
    };

    onAddCollection(newCollection);
    
    // Reset form
    setCollectionName('');
    
    onClose();
  };

  return (
    <StyledModal onClick={onClose}>
      <AirbnbModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>
          <IconContainer>
            <FaFolderPlus size={14} color="#fff" />
          </IconContainer>
          New Collection
        </ModalTitle>
        <ModalSubtitle>
          Create a new collection to organize your API requests
        </ModalSubtitle>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="collection-name">Collection Name</Label>
            <Input 
              id="collection-name"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              autoFocus
              required
            />
          </FormGroup>
          
          <ModalActionsContainer>
            <CancelText type="button" onClick={onClose}>
              Cancel
            </CancelText>
            <CreateButton type="submit">
              Create Collection
            </CreateButton>
          </ModalActionsContainer>
        </form>
      </AirbnbModalContent>
    </StyledModal>
  );
};

export default AddCollectionModal; 