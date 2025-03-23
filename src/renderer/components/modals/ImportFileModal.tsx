import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';
import { 
  FaFileImport, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFileCode, 
  FaChevronRight,
  FaFileAlt 
} from 'react-icons/fa';

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
  max-width: 650px;
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

const FileDropZone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 40px 32px;
  text-align: center;
  margin-bottom: 24px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: rgba(255, 56, 92, 0.5);
    background-color: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255, 56, 92, 0.05) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:after {
    opacity: 1;
  }
`;

const DragInstructions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffffff;
  
  svg {
    font-size: 42px;
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.5);
  }
  
  p {
    margin: 4px 0;
    font-family:
      'Circular',
      -apple-system,
      BlinkMacSystemFont,
      Roboto,
      Helvetica Neue,
      sans-serif;
  }
  
  p:first-of-type {
    font-weight: 500;
    font-size: 16px;
  }
  
  p:last-of-type {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FormatTag = styled.div<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  margin: 4px;
  border-radius: 20px;
  background-color: ${props => props.active 
    ? 'rgba(0, 167, 153, 0.2)'
    : 'rgba(255, 255, 255, 0.1)'};
  font-size: 13px;
  border: 1px solid ${props => props.active 
    ? 'rgba(0, 167, 153, 0.5)'
    : 'transparent'};
  color: ${props => props.active 
    ? '#00a799'
    : 'rgba(255, 255, 255, 0.8)'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active 
      ? 'rgba(0, 167, 153, 0.25)'
      : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const FormatContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff385c;
  font-size: 14px;
  margin: 16px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  animation: shake 0.4s ease-in-out;
  
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }
`;

const SelectedFileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: scaleIn 0.3s ease-out;
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const FileIcon = styled.div<{ isValid?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background-color: ${props => props.isValid 
    ? 'rgba(0, 167, 153, 0.15)'
    : props.isValid === false 
      ? 'rgba(255, 56, 92, 0.15)'
      : 'rgba(255, 255, 255, 0.1)'};
  margin-bottom: 8px;
  color: ${props => props.isValid 
    ? '#00a799'
    : props.isValid === false 
      ? '#ff385c'
      : '#ffffff'};
  font-size: 28px;
  transition: all 0.2s ease;
`;

const FileName = styled.div`
  font-weight: 500;
  word-break: break-all;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
`;

const FormatInfo = styled.div`
  font-size: 14px;
  color: #00a799;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background-color: rgba(0, 167, 153, 0.1);
  border-radius: 12px;
  animation: fadeIn 0.3s ease-out;
`;

const ImportNote = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: 0;
  margin-bottom: 24px;
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
  background-color: ${props => props.disabled ? 'rgba(255, 56, 92, 0.5)' : '#ff385c'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: #e00b41;
    transform: translateY(-1px);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

interface ImportFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (fileContent: string, fileName: string) => void;
}

function ImportFileModal({ isOpen, onClose, onImport }: ImportFileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidFormat, setIsValidFormat] = useState<boolean | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      readAndValidateFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      readAndValidateFile(file);
    }
  };

  const readAndValidateFile = (file: File) => {
    setError(null);
    setIsValidFormat(null);
    setDetectedFormat(null);
    
    // Check file extension first
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.json') && !fileName.endsWith('.yaml') && !fileName.endsWith('.yml')) {
      setError('Unsupported file format. Please use JSON, YAML, or YML files.');
      setIsValidFormat(false);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        const content = e.target.result;
        setFileContent(content);
        
        // Validate the content
        try {
          if (fileName.endsWith('.json')) {
            const json = JSON.parse(content);
            
            // Detect format
            if (json.info && json.item) {
              setDetectedFormat('postman');
              setIsValidFormat(true);
            } else if (json._type === 'export' && json.resources) {
              setDetectedFormat('insomnia');
              setIsValidFormat(true);
            } else if (json.swagger || json.openapi) {
              setDetectedFormat('swagger');
              setIsValidFormat(true);
            } else if (json.log && json.log.entries) {
              setDetectedFormat('har');
              setIsValidFormat(true);
            } else {
              setDetectedFormat('unknown');
              setIsValidFormat(false);
              setError('Unknown JSON format. The file appears to be valid JSON but not a supported collection format.');
            }
          } else {
            // YAML validation would go here
            setDetectedFormat('yaml');
            setIsValidFormat(true);
          }
        } catch (err) {
          setIsValidFormat(false);
          setError('Invalid file format. The file could not be parsed correctly.');
        }
      }
    };
    
    reader.onerror = () => {
      setIsValidFormat(false);
      setError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (selectedFile && fileContent && isValidFormat) {
      onImport(fileContent, selectedFile.name);
      resetState();
      onClose();
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setFileContent(null);
    setError(null);
    setIsValidFormat(null);
    setDetectedFormat(null);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!isOpen) return null;

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'postman': return 'Postman Collection';
      case 'insomnia': return 'Insomnia Export';
      case 'swagger': return 'Swagger/OpenAPI';
      case 'har': return 'HAR';
      case 'yaml': return 'YAML';
      default: return format.toUpperCase();
    }
  };

  return (
    <StyledModal onClick={onClose}>
      <AirbnbModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalTitle>
          <CodeIcon>
            <FaFileImport size={16} />
          </CodeIcon>
          Import Collection
        </ModalTitle>
        <ModalSubtitle>
          Upload a Postman, Insomnia, or other API collection file
        </ModalSubtitle>
        
        <FileDropZone 
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <SelectedFileContainer>
              <FileIcon isValid={isValidFormat}>
                {isValidFormat === true ? (
                  <FaFileCode />
                ) : isValidFormat === false ? (
                  <FaTimesCircle />
                ) : (
                  <FaFileAlt />
                )}
              </FileIcon>
              <FileName>
                {selectedFile.name}
              </FileName>
              {detectedFormat && isValidFormat && (
                <FormatInfo>
                  <FaCheckCircle size={12} />
                  {getFormatLabel(detectedFormat)}
                </FormatInfo>
              )}
            </SelectedFileContainer>
          ) : (
            <DragInstructions>
              <FaFileImport />
              <p>Drag and drop a file here</p>
              <p>or click to browse</p>
            </DragInstructions>
          )}
          <HiddenInput
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json,.yaml,.yml"
          />
        </FileDropZone>
        
        {error && <ErrorMessage><FaTimesCircle size={14} /> {error}</ErrorMessage>}
        
        <ImportNote>
          Supported formats:
        </ImportNote>
        
        <FormatContainer>
          <FormatTag active={detectedFormat === 'postman'}>Postman Collection</FormatTag>
          <FormatTag active={detectedFormat === 'insomnia'}>Insomnia Export</FormatTag>
          <FormatTag active={detectedFormat === 'swagger'}>Swagger/OpenAPI</FormatTag>
          <FormatTag active={detectedFormat === 'har'}>HAR</FormatTag>
          <FormatTag active={detectedFormat === 'yaml'}>YAML</FormatTag>
        </FormatContainer>
        
        <ModalActionsContainer>
          <CancelText type="button" onClick={onClose}>
            Cancel
          </CancelText>
          <ImportButton
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || !isValidFormat}
          >
            Import <FaChevronRight size={12} />
          </ImportButton>
        </ModalActionsContainer>
      </AirbnbModalContent>
    </StyledModal>
  );
}

export default ImportFileModal; 