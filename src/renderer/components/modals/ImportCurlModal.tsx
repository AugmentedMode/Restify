import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';
import { FaCode, FaTerminal, FaChevronRight } from 'react-icons/fa';

// Airbnb-inspired styled components with dark theme
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
  max-width: 580px;
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

const CodeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #ff385c;
  border-radius: 8px;
`;

const CurlTextArea = styled.textarea`
  width: 100%;
  min-height: 180px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 56, 92, 0.5);
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SupportedFormatsContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
`;

const FormatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
`;

const FormatsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const FormatTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 12px;
`;

const ModalActionsContainer = styled(ModalActions)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
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

const ImportButton = styled(SendButton)`
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  background-color: #ff385c;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: #e00b41;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: rgba(255, 56, 92, 0.5);
    cursor: not-allowed;
  }
`;

interface ImportCurlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (curlCommand: string) => void;
}

function ImportCurlModal({
  isOpen,
  onClose,
  onImport,
}: ImportCurlModalProps) {
  const [curlCommand, setCurlCommand] = useState('');
  const placeholderText = "curl -X POST https://api.example.com/data -H 'Content-Type: application/json' -d '{\"key\": \"value\"}'";

  const handleImport = () => {
    if (curlCommand.trim()) {
      onImport(curlCommand);
      setCurlCommand('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && curlCommand.trim()) {
      handleImport();
    }
  };

  if (!isOpen) return null;

  return (
    <StyledModal onClick={onClose}>
      <AirbnbModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalTitle>
          <CodeIcon>
            <FaTerminal size={16} />
          </CodeIcon>
          Import from cURL
        </ModalTitle>
        <ModalSubtitle>Paste your cURL command below to import it as a request</ModalSubtitle>
        
        <CurlTextArea
          placeholder={placeholderText}
          value={curlCommand}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurlCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        
        <SupportedFormatsContainer>
          <FormatTitle>
            <FaCode size={12} /> Supported formats
          </FormatTitle>
          <FormatsList>
            <FormatTag>Headers</FormatTag>
            <FormatTag>Request body</FormatTag>
            <FormatTag>Query parameters</FormatTag>
            <FormatTag>Auth</FormatTag>
            <FormatTag>Cookies</FormatTag>
          </FormatsList>
        </SupportedFormatsContainer>
        
        <ModalActionsContainer>
          <CancelText type="button" onClick={onClose}>
            Cancel
          </CancelText>
          <ImportButton
            type="button"
            onClick={handleImport}
            disabled={!curlCommand.trim()}
          >
            Import <FaChevronRight size={12} />
          </ImportButton>
        </ModalActionsContainer>
      </AirbnbModalContent>
    </StyledModal>
  );
}

export default ImportCurlModal; 