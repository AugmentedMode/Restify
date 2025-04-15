import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaLightbulb, FaSave, FaTimes } from 'react-icons/fa';
import { AIPrompt, AIPromptCategory } from '../../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1e1e1e;
  color: #fff;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background-color: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 5px;
  margin-right: 10px;
  
  &:hover {
    color: #FF385C;
  }
  
  svg {
    margin-right: 5px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    color: #FF385C;
    margin-right: 10px;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background-color: #FF385C;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #ff526e;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #555;
  background-color: transparent;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 10px;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #aaa;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #333;
  background-color: #2d2d2d;
  color: #fff;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #FF385C;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #333;
  background-color: #2d2d2d;
  color: #fff;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #FF385C;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #333;
  background-color: #2d2d2d;
  color: #fff;
  font-size: 14px;
  outline: none;
  resize: vertical;
  line-height: 1.5;
  
  &:focus {
    border-color: #FF385C;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 20px;
`;

interface PromptEditorProps {
  prompt?: AIPrompt;
  categories: AIPromptCategory[];
  onSave: (prompt: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  categories,
  onSave,
  onCancel,
  isEdit = false,
}) => {
  const [title, setTitle] = useState(prompt?.title || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [category, setCategory] = useState(prompt?.category || (categories[0]?.id || ''));
  const [isFavorite, setIsFavorite] = useState(prompt?.isFavorite || false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      title,
      content,
      category,
      isFavorite,
    });
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={onCancel}>
          <FaChevronLeft />
          Back
        </BackButton>
        <Title>
          <FaLightbulb />
          {isEdit ? 'Edit Prompt' : 'New Prompt'}
        </Title>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter prompt title"
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your prompt here..."
            required
          />
        </FormGroup>
        
        <FormActions>
          <CancelButton type="button" onClick={onCancel}>
            <FaTimes />
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={!title || !content}>
            <FaSave />
            {isEdit ? 'Update Prompt' : 'Save Prompt'}
          </SaveButton>
        </FormActions>
      </Form>
    </Container>
  );
};

export default PromptEditor; 