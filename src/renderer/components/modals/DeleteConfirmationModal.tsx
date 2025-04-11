import React from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalActions,
} from '../../styles/StyledComponents';
import { 
  FaExclamationTriangle,
  FaTrash,

  FaChevronRight,
  FaShieldAlt
} from 'react-icons/fa';

// Modal styled components
const StyledModal = styled(Modal)`
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
`;

const DeleteModalContent = styled(ModalContent)`
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

const WarningIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #ff385c;
  border-radius: 8px;
`;

const WarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  margin-bottom: 24px;
  background-color: rgba(255, 56, 92, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 56, 92, 0.3);
`;

const WarningIconLarge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #ff385c;
  font-size: 36px;
`;

const WarningText = styled.p`
  font-weight: 500;
  color: #ffffff;
  text-align: center;
  margin: 0;
  font-size: 16px;
`;

const WarningSubtext = styled.p`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 8px 0 0 0;
  font-size: 14px;
`;

const DataTypeList = styled.ul`
  margin: 16px 0;
  padding: 0 0 0 20px;
  list-style-type: none;

  li {
    margin-bottom: 8px;
    position: relative;
    display: flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    
    &:before {
      content: '•';
      position: absolute;
      left: -20px;
      color: #ff385c;
    }
  }
`;

const ModalActionsContainer = styled(ModalActions)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
`;

const CancelButton = styled.button`
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

const ConfirmButton = styled.button`
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  background-color: #ff385c;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #e00b41;
    transform: translateY(-1px);
  }
`;

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <StyledModal onClick={onClose}>
      <DeleteModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalTitle>
          <WarningIcon>
            <FaTrash size={16} />
          </WarningIcon>
          Delete All Data
        </ModalTitle>
        <ModalSubtitle>
          You are about to permanently delete all application data
        </ModalSubtitle>
        
        <WarningContainer>
          <WarningIconLarge>
            <FaExclamationTriangle />
          </WarningIconLarge>
          <WarningText>This action cannot be undone</WarningText>
          <WarningSubtext>All data will be permanently removed from your device</WarningSubtext>
        </WarningContainer>
        
        <div>
          <p style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.9)' }}>
            The following data will be deleted:
          </p>
          <DataTypeList>
            <li>All collections and requests</li>
            <li>Request history</li>
            <li>Saved responses</li>
            <li>Environments and variables</li>
            <li>Application settings</li>
            <li>Notes and boards</li>
          </DataTypeList>
        </div>
        
        <ModalActionsContainer>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
          <ConfirmButton
            type="button"
            onClick={onConfirm}
          >
            Delete All Data <FaChevronRight size={12} />
          </ConfirmButton>
        </ModalActionsContainer>
      </DeleteModalContent>
    </StyledModal>
  );
}

export default DeleteConfirmationModal; 