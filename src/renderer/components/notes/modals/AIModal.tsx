import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaRobot, FaCog } from 'react-icons/fa';
import aiService from '../../../services/AIService';
import { useSettings } from '../../../utils/SettingsContext';

const AIPromptContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #121212;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const AIPromptForm = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
`;

const RobotIcon = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  color: #8b3dff;
  
  svg {
    font-size: 20px;
  }
`;

const PromptInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 6px 0;
  color: #eee;
  font-size: 16px;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #777;
  }
`;

const GenerateButton = styled.button`
  background-color: #8b3dff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #7a35e0;
  }
  
  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div`
  color: #777;
  font-size: 12px;
  margin-left: 12px;
  display: flex;
  align-items: center;
`;

const ConfigButton = styled.button`
  background: none;
  border: none;
  color: #8b3dff;
  cursor: pointer;
  padding: 5px;
  margin-left: 6px;
  display: flex;
  align-items: center;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent: (content: string) => void;
  onOpenSettings?: () => void;
}

const AIModal: React.FC<AIModalProps> = ({ 
  isOpen, 
  onClose, 
  onInsertContent,
  onOpenSettings 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettings();
  
  // Initialize AI service if needed
  useEffect(() => {
    if (settings.ai.apiKey && settings.ai.provider && settings.ai.model && !aiService.isInitialized()) {
      aiService.initialize({
        provider: settings.ai.provider,
        model: settings.ai.model,
        apiKey: settings.ai.apiKey,
        apiUrl: settings.ai.apiUrl
      });
    }
  }, [settings.ai]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleGenerateResponse = async () => {
    if (!prompt.trim()) return;
    
    // Reset error state
    setError(null);
    setIsLoading(true);
    
    try {
      // Check if AI service is initialized
      if (!aiService.isInitialized()) {
        throw new Error('AI service is not configured. Please set up API keys in settings.');
      }

      // Get response from AI service
      const aiResponse = await aiService.generateCompletion(prompt, {
        temperature: 0.7,
        maxTokens: 500
      });
      
      // Insert response into note
      onInsertContent(aiResponse);
      onClose();
      setPrompt(''); // Reset for next use
    } catch (error) {
      console.error('Error generating AI response:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate response');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateResponse();
    }
  };
  
  if (!isOpen) return null;

  return (
    <AIPromptContainer>
      <AIPromptForm>
        <RobotIcon>
          <FaRobot />
        </RobotIcon>
        <PromptInput
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell the AI what to write..."
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {error && (
          <StatusIndicator>
            {error}
            {onOpenSettings && (
              <ConfigButton onClick={onOpenSettings}>
                <FaCog style={{ marginRight: '4px' }} />
                Configure
              </ConfigButton>
            )}
          </StatusIndicator>
        )}
        <GenerateButton 
          onClick={handleGenerateResponse} 
          disabled={!prompt.trim() || isLoading || !settings.ai.apiKey}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </GenerateButton>
      </AIPromptForm>
    </AIPromptContainer>
  );
};

export default AIModal; 