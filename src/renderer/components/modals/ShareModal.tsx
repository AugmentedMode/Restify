import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';
import { FaShareAlt, FaLink, FaTwitter, FaFacebook, FaEnvelope, FaClipboard, FaCheck } from 'react-icons/fa';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionName?: string;
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

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #333333;
  border: 1px solid #444444;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
`;

const LinkText = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  &:focus {
    outline: none;
  }
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #ff385c;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.1);
  }
`;

const ShareOptionsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const ShareOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ShareIconCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #333333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: #ff385c;
    transform: translateY(-2px);
  }

  svg {
    color: #ffffff;
    font-size: 20px;
  }
`;

const ShareOptionText = styled.span`
  font-size: 12px;
  color: #bbbbbb;
`;

const ModalActionsContainer = styled(ModalActions)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
`;

const CloseButton = styled.button`
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

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, collectionName }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;
  
  const randomId = Math.random().toString(36).substring(2, 15);
  
  const shareLink = `https://gethapi.dev/`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <StyledModal>
      <AirbnbModalContent>
        <ModalTitle>
          <IconContainer>
            <FaShareAlt />
          </IconContainer>
          Share Hapi with Friends
        </ModalTitle>
        <ModalSubtitle>
          Invite your friends to try out Hapi - the modern API development tool
        </ModalSubtitle>
        
        <LinkContainer>
          <FaLink style={{ marginRight: '8px', color: '#999' }} />
          <LinkText value={shareLink} readOnly />
          <CopyButton onClick={handleCopy}>
            {copied ? <FaCheck /> : <FaClipboard />}
            {copied ? 'Copied' : 'Copy'}
          </CopyButton>
        </LinkContainer>
        
        <ModalActionsContainer>
          <CloseButton onClick={onClose}>Close</CloseButton>
        </ModalActionsContainer>
      </AirbnbModalContent>
    </StyledModal>
  );
};

export default ShareModal; 