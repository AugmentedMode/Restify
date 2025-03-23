import React from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  itemType: 'collection' | 'request' | 'folder';
  itemName: string;
}

// Airbnb-inspired styled components with dark theme
const AirbnbModalContent = styled(ModalContent)`
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  max-width: 480px;
  width: 100%;
  background-color: #222222;
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
  margin: 0 0 20px 0;
  letter-spacing: -0.2px;
`;

const ModalDescription = styled.p`
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
  margin-bottom: 28px;
  strong {
    font-weight: 500;
    color: #ffffff;
  }
`;

const ModalActionsContainer = styled(ModalActions)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  margin-top: 8px;
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

const DeleteButton = styled(SendButton)`
  padding: 14px 24px;
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

const StyledModal = styled(Modal)`
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
`;

function DeleteModal({
  isOpen,
  onClose,
  onDelete,
  itemType,
  itemName,
}: DeleteModalProps) {
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  if (!isOpen) return null;

  const capitalizedItemType = itemType.charAt(0).toUpperCase() + itemType.slice(1);
  
  return (
    <StyledModal onClick={onClose}>
      <AirbnbModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Delete {capitalizedItemType}</ModalTitle>
        <ModalDescription>
          Are you sure you want to delete the {itemType} &ldquo;{itemName}&rdquo;?
          
          {itemType === 'collection' || itemType === 'folder' ? (
            <strong>
              {' '}
              This will delete all requests inside it and cannot be undone.
            </strong>
          ) : (
            ' This cannot be undone.'
          )}
        </ModalDescription>
        <ModalActionsContainer>
          <CancelText type="button" onClick={onClose}>
            Cancel
          </CancelText>
          <DeleteButton type="button" onClick={handleDelete}>
            Delete
          </DeleteButton>
        </ModalActionsContainer>
      </AirbnbModalContent>
    </StyledModal>
  );
}

export default DeleteModal;
