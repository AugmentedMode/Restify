import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';
import { FaKey, FaFileCode, FaChevronRight, FaUpload, FaCheck, FaInfoCircle, FaLock } from 'react-icons/fa';

// Airbnb-inspired styled components with dark theme
const StyledModal = styled(Modal)`
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
`;

const AirbnbModalContent = styled(ModalContent)`
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  max-width: 620px;
  width: 100%;
  background-color: #1a1a1a;
  transform: translateY(0);
  animation: modalFadeIn 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.07);

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
    -apple-system,
    BlinkMacSystemFont,
    Roboto,
    Helvetica Neue,
    sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalSubtitle = styled.p`
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    Roboto,
    Helvetica Neue,
    sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #dddddd;
  margin-bottom: 16px;
  margin-top: 0;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #FF385C;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(255, 56, 92, 0.3);
`;

const EnvTextArea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 12px;
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

const InputLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #dddddd;
  margin-bottom: 4px;
`;

const InputGroup = styled.div`
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  
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
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
`;

const FormatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 6px;
`;

const FormatsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const FormatTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background-color: rgba(255, 56, 92, 0.1);
  border-radius: 12px;
  font-size: 11px;
`;

const ModalActionsContainer = styled(ModalActions)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
`;

const CancelText = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: #dddddd;
  cursor: pointer;
  font-family:
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
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  background-color: #FF385C;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: #E93455;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: rgba(255, 56, 92, 0.5);
    cursor: not-allowed;
  }
`;

const FileUploadContainer = styled.div<{ isDragActive: boolean; hasFile: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  border: 2px dashed ${props => props.isDragActive ? 'rgba(255, 56, 92, 0.7)' : props.hasFile ? 'rgba(92, 184, 92, 0.7)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.isDragActive ? 'rgba(255, 56, 92, 0.08)' : props.hasFile ? 'rgba(92, 184, 92, 0.08)' : 'transparent'};
  
  &:hover {
    border-color: ${props => props.hasFile ? 'rgba(92, 184, 92, 0.7)' : 'rgba(255, 56, 92, 0.5)'};
    background-color: ${props => props.hasFile ? 'rgba(92, 184, 92, 0.08)' : 'rgba(255, 56, 92, 0.05)'};
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
`;

const FileUploadLabel = styled.label<{ hasFile: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.hasFile ? 'rgba(92, 184, 92, 0.9)' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 13px;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InfoBox = styled.div`
  background-color: rgba(255, 56, 92, 0.1);
  border-left: 4px solid #FF385C;
  border-radius: 4px;
  padding: 10px 12px;
  margin: 10px 0;
  font-size: 13px;
  color: #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const InfoIcon = styled.div`
  margin-top: 2px;
  color: #FF385C;
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
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
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
  
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);
  
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
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
    }
  }, [profileName]);
  
  // Set up drag-and-drop event listeners
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('dragenter', handleDragEnter);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('drop', handleDrop);
      
      return () => {
        dropZone.removeEventListener('dragenter', handleDragEnter);
        dropZone.removeEventListener('dragleave', handleDragLeave);
        dropZone.removeEventListener('dragover', handleDragOver);
        dropZone.removeEventListener('drop', handleDrop);
      };
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  if (!isOpen) return null;

  return (
    <StyledModal onClick={onClose}>
      <AirbnbModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalTitle>
          <IconContainer>
            <FaKey size={18} />
          </IconContainer>
          Import from .env file
        </ModalTitle>
        <ModalSubtitle>Upload or paste your .env file content to import secrets</ModalSubtitle>
        
        <InputGroup>
          <InputLabel htmlFor="profile-name">Profile Name</InputLabel>
          <Input
            id="profile-name"
            type="text"
            placeholder="E.g., Development, Production, Staging"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
          />
        </InputGroup>
        
        <FileUploadContainer 
          ref={dropZoneRef}
          isDragActive={isDragActive} 
          hasFile={!!fileName}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUploadLabel hasFile={!!fileName}>
            <HiddenFileInput 
              ref={fileInputRef}
              type="file" 
              accept=".env" 
              onChange={handleFileUpload}
            />
            {fileName ? <FaCheck size={14} /> : <FaUpload size={14} />}
            {fileName ? `Selected: ${fileName}` : 'Choose a .env file or drag & drop here'}
          </FileUploadLabel>
        </FileUploadContainer>
        
        <InputGroup>
          <InputLabel htmlFor="env-content">Environment Variables</InputLabel>
          <EnvTextArea
            id="env-content"
            placeholder={placeholderText}
            value={envContent}
            onChange={(e) => setEnvContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </InputGroup>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <InfoBox>
              <InfoIcon>
                <FaLock size={12} />
              </InfoIcon>
              <div>
                Secrets are stored locally and never sent to external servers.
              </div>
            </InfoBox>
          </div>
          
  
        </div>
        
        <ModalActionsContainer>
          <CancelText type="button" onClick={onClose}>
            Cancel
          </CancelText>
          <ImportButton
            type="button"
            onClick={handleImport}
            disabled={!envContent.trim() || !profileName.trim()}
          >
            Import <FaChevronRight size={10} />
          </ImportButton>
        </ModalActionsContainer>
      </AirbnbModalContent>
    </StyledModal>
  );
}

export default ImportEnvModal; 