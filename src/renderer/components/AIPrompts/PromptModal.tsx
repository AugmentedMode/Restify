import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSave, FaLightbulb } from 'react-icons/fa';
import { AIPrompt, AIPromptCategory } from '../../types';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: #222;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #FF385C;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  padding: 12px 14px;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 14px;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  transition: all 0.2s;
  resize: vertical;
  min-height: 220px;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CancelButton = styled.button`
  padding: 10px 18px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SaveButton = styled.button`
  padding: 10px 18px;
  background-color: #FF385C;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #ff1f47;
  }
  
  &:disabled {
    background-color: rgba(255, 56, 92, 0.5);
    cursor: not-allowed;
  }
`;

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  prompt?: AIPrompt;
  categories: AIPromptCategory[];
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  prompt,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Initialize form when prompt changes
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setCategory(prompt.category);
      setIsFavorite(prompt.isFavorite);
    } else {
      // Default values for new prompt
      setTitle('');
      setContent('');
      setCategory(categories.length > 0 ? categories[0].id : '');
      setIsFavorite(false);
    }
  }, [prompt, categories]);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      title,
      content,
      category,
      isFavorite,
    });
  };
  
  // Close modal when clicking outside content
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaLightbulb />
            {prompt ? 'Edit Prompt' : 'Create New Prompt'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes size={18} />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="content">Prompt Content</Label>
              <TextArea
                id="content"
                placeholder="Write your prompt here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </FormGroup>
          </Form>
        </ModalBody>
        
        <ModalFooter>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
          <SaveButton 
            onClick={handleSubmit}
            disabled={!title || !content || !category}
          >
            <FaSave />
            {prompt ? 'Update Prompt' : 'Save Prompt'}
          </SaveButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PromptModal; 