import React, { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import {
  Modal,
  ModalContent,
  ModalActions,
  SendButton,
} from '../../styles/StyledComponents';
import { FaCode, FaPlus } from 'react-icons/fa';
import { ApiRequest, HttpMethod } from '../../types';
import { modalDataStore } from '../../utils/modalDataStore';

interface AddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRequest: (request: ApiRequest, path: string[]) => void;
  path: string[];
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

const UrlInput = styled.div`
  display: flex;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #444444;
  background-color: #333333;
  
  &:focus-within {
    border-color: #ff385c;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
`;

const MethodSelect = styled.select`
  padding: 12px 16px;
  background-color: #333333;
  border: none;
  border-right: 1px solid #444444;
  color: #ffffff;
  font-size: 16px;
  min-width: 110px;
  cursor: pointer;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px auto;
  padding-right: 32px;
  
  &:focus {
    outline: none;
  }
`;

const UrlField = styled.input`
  flex: 1;
  padding: 12px 16px;
  background-color: #333333;
  border: none;
  color: #ffffff;
  font-size: 16px;
  
  &:focus {
    outline: none;
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

const AddRequestModal: React.FC<AddRequestModalProps> = ({
  isOpen,
  onClose,
  onAddRequest,
  path,
}) => {
  const [requestName, setRequestName] = useState('');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestMethod, setRequestMethod] = useState<HttpMethod>('GET');

  // Don't render if not open
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestName.trim() || !requestUrl.trim()) {
      return; // Basic validation
    }

    // Create new request
    const newRequest: ApiRequest = {
      id: uuidv4(),
      name: requestName.trim(),
      method: requestMethod,
      url: requestUrl.trim(),
      params: [],
      headers: [],
      body: { raw: '' },
      bodyType: 'none',
      folderPath: path,
    };

    onAddRequest(newRequest, path);
    
    // Reset form
    setRequestName('');
    setRequestUrl('');
    setRequestMethod('GET');
    
    onClose();
  };

  return (
    <StyledModal onClick={onClose}>
      <AirbnbModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>
          <IconContainer>
            <FaPlus size={14} color="#fff" />
          </IconContainer>
          New Request
        </ModalTitle>
        <ModalSubtitle>
          Create a new API request to start testing your endpoints
        </ModalSubtitle>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="request-name">Request Name</Label>
            <Input 
              id="request-name"
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="Enter request name"
              autoFocus
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="request-url">URL</Label>
            <UrlInput>
              <MethodSelect 
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value as HttpMethod)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="OPTIONS">OPTIONS</option>
                <option value="HEAD">HEAD</option>
              </MethodSelect>
              <UrlField 
                type="url" 
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                required
              />
            </UrlInput>
          </FormGroup>
          
          <ModalActionsContainer>
            <CancelText type="button" onClick={onClose}>
              Cancel
            </CancelText>
            <CreateButton type="submit">
              Create Request
            </CreateButton>
          </ModalActionsContainer>
        </form>
      </AirbnbModalContent>
    </StyledModal>
  );
};

export default AddRequestModal; 