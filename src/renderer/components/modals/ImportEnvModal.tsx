import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';
import { FaKey, FaFileCode, FaChevronRight, FaUpload } from 'react-icons/fa';

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

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #3290ff;
  border-radius: 8px;
`;

const EnvTextArea = styled.textarea`
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
    border-color: rgba(50, 144, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(50, 144, 255, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: rgba(50, 144, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(50, 144, 255, 0.2);
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
  background-color: #3290ff;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: #2574d9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: rgba(50, 144, 255, 0.5);
    cursor: not-allowed;
  }
`;

const FileUploadContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: rgba(50, 144, 255, 0.5);
    background-color: rgba(50, 144, 255, 0.05);
  }
`;

const FileUploadLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

interface ImportEnvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (envContent: string, profileName: string) => void;
}

function ImportEnvModal({
  isOpen,
  onClose,
  onImport,
}: ImportEnvModalProps) {
  const [envContent, setEnvContent] = useState('');
  const [profileName, setProfileName] = useState('');
  const [fileName, setFileName] = useState('');
  
  const placeholderText = "API_KEY=your_api_key_here\nAPI_SECRET=your_secret_here\nDATABASE_URL=postgresql://user:pass@localhost:5432/db";

  const handleImport = () => {
    if (envContent.trim() && profileName.trim()) {
      onImport(envContent, profileName);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setEnvContent('');
    setProfileName('');
    setFileName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && envContent.trim() && profileName.trim()) {
      handleImport();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Default the profile name to the file name without extension
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    if (!profileName) {
      setProfileName(baseName);
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEnvContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <StyledModal onClick={onClose}>
      <AirbnbModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalTitle>
          <IconContainer>
            <FaKey size={16} />
          </IconContainer>
          Import from .env file
        </ModalTitle>
        <ModalSubtitle>Upload or paste your .env file content to import secrets</ModalSubtitle>
        
        <Input
          type="text"
          placeholder="Profile Name (e.g., Development, Production)"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          required
        />
        
        <FileUploadContainer>
          <FileUploadLabel>
            <HiddenFileInput 
              type="file" 
              accept=".env" 
              onChange={handleFileUpload}
            />
            <FaUpload size={16} />
            {fileName ? `Selected: ${fileName}` : 'Choose a .env file or drag & drop'}
          </FileUploadLabel>
        </FileUploadContainer>
        
        <EnvTextArea
          placeholder={placeholderText}
          value={envContent}
          onChange={(e) => setEnvContent(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        <SupportedFormatsContainer>
          <FormatTitle>
            <FaFileCode size={12} /> Environment Variables Format
          </FormatTitle>
          <FormatsList>
            <FormatTag>KEY=VALUE format</FormatTag>
            <FormatTag>Comments with #</FormatTag>
            <FormatTag>Standard .env syntax</FormatTag>
          </FormatsList>
        </SupportedFormatsContainer>
        
        <ModalActionsContainer>
          <CancelText type="button" onClick={onClose}>
            Cancel
          </CancelText>
          <ImportButton
            type="button"
            onClick={handleImport}
            disabled={!envContent.trim() || !profileName.trim()}
          >
            Import <FaChevronRight size={12} />
          </ImportButton>
        </ModalActionsContainer>
      </AirbnbModalContent>
    </StyledModal>
  );
}

export default ImportEnvModal; 