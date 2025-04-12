import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import aiService, { AIService } from '../services/AIService';
import { FaRobot, FaUser, FaCog } from 'react-icons/fa';

// Main container with dark theme styling
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #0e0e0e;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background-color: #0e0e0e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const HeaderTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #FF385C;
  }
`;

const ConfigButton = styled.button`
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.9);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 24px;
  text-align: center;
`;

const EmptyStateTitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
  background: linear-gradient(90deg, #FF385C, #FF7A8F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
`;

const MessageGroup = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 24px max(16px, calc((100% - 800px) / 2));
  background-color: ${props => props.isUser ? 'transparent' : 'rgba(255, 255, 255, 0.02)'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.isUser ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.03)'};
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  
  svg {
    margin-right: 8px;
    font-size: 16px;
    color: #FF385C;
  }
`;

const MessageText = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  max-width: 800px;
  padding-left: 25px;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-left: 25px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${MessageGroup}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.1);
    border-color: rgba(255, 56, 92, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }
  
  svg {
    margin-right: 4px;
    font-size: 12px;
  }
`;

const InputArea = styled.div`
  display: flex;
  padding: 16px max(16px, calc((100% - 800px) / 2)) 24px;
  position: relative;
  background-color: #0e0e0e;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
`;

const InputTools = styled.div`
  position: absolute;
  left: 13px;
  bottom: 15px;
  display: flex;
  gap: 8px;
`;

const ToolButton = styled.button`
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }
`;

const InputActionsRight = styled.div`
  position: absolute;
  right: 13px;
  bottom: 12px;
  display: flex;
  gap: 8px;
`;

const Input = styled.textarea`
  width: 100%;
  padding: 14px 45px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  min-height: 50px;
  max-height: 200px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 56, 92, 0.5);
    background-color: rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 1px rgba(255, 56, 92, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

// Config panel styling
const ConfigPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
`;

const ConfigForm = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const ConfigTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #FF385C;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  background-color: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  background-color: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

// Add the SendButton component back for the config panel
const SendButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  background-color: #FF385C;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #FF5A76;
  }
  
  &:disabled {
    background-color: rgba(255, 56, 92, 0.3);
    cursor: not-allowed;
  }
`;

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);
  
  // AI configuration
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'custom'>('openai');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = '50px'; // Reset to default height
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // Check if AI service is already configured
  useEffect(() => {
    const config = AIService.getStoredConfig();
    if (config) {
      setProvider(config.provider as any);
      setModel(config.model);
      setApiKey(config.apiKey);
      setApiUrl(config.apiUrl || '');
      setConfigured(aiService.isInitialized());
      
      // Initialize service
      if (!aiService.isInitialized()) {
        aiService.initialize(config);
        setConfigured(true);
      }
      
      // Add welcome message if no messages
      if (messages.length === 0) {
        setMessages([{
          text: `Hello! How can I assist you today?`,
          isUser: false,
          timestamp: Date.now()
        }]);
      }
    } else {
      setShowConfig(true);
    }
  }, []);

  const configureAI = () => {
    try {
      aiService.initialize({
        provider,
        model,
        apiKey,
        apiUrl: provider === 'custom' ? apiUrl : undefined
      });
      setConfigured(true);
      setShowConfig(false);
      
      // Add welcome message
      setMessages([
        {
          text: `Hello! How can I assist you today?`,
          isUser: false,
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      console.error('Failed to configure AI:', error);
      alert('Failed to configure AI. Check your settings and try again.');
    }
  };

  const sendMessage = () => {
    if (!input.trim() || loading) return;
    
    // Add user message
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    
    // Reset textarea height to match new design
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = '50px';
    }
    
    // Create a placeholder for the AI response
    const aiMessageId = Date.now();
    setMessages(prevMessages => [
      ...prevMessages, 
      {
        text: '',
        isUser: false,
        timestamp: aiMessageId
      }
    ]);
    
    // Get streaming response
    const stream = aiService.generateStreamableCompletion(input, {
      temperature: 0.7,
      maxTokens: 500
    });
    
    let responseText = '';
    
    stream.on('data', (chunk: string) => {
      responseText += chunk;
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.timestamp === aiMessageId 
            ? { ...msg, text: responseText } 
            : msg
        )
      );
    });
    
    stream.on('done', () => {
      setLoading(false);
    });
    
    stream.on('error', (error: Error) => {
      console.error('Error generating AI response:', error);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.timestamp === aiMessageId 
            ? { ...msg, text: 'Sorry, there was an error generating a response. Please try again.' } 
            : msg
        )
      );
      setLoading(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          <FaRobot size={14} />
          AI Assistant
        </HeaderTitle>
        {configured && (
          <ConfigButton onClick={() => setShowConfig(!showConfig)}>
            <FaCog size={14} />
          </ConfigButton>
        )}
      </Header>

      {showConfig || !configured ? (
        <ConfigPanel>
          <ConfigForm>
            <ConfigTitle>
              <FaCog />
              Configure AI Assistant
            </ConfigTitle>
            
            <FormGroup>
              <Label>Provider</Label>
              <Select 
                value={provider} 
                onChange={e => setProvider(e.target.value as any)}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom API</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Model</Label>
              <TextInput 
                type="text" 
                value={model} 
                onChange={e => setModel(e.target.value)} 
                placeholder={
                  provider === 'openai' 
                    ? 'gpt-3.5-turbo' 
                    : provider === 'anthropic' 
                      ? 'claude-3-opus-20240229'
                      : 'model name'
                }
              />
            </FormGroup>
            
            <FormGroup>
              <Label>API Key</Label>
              <TextInput 
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                placeholder="Enter your API key"
              />
            </FormGroup>
            
            {provider === 'custom' && (
              <FormGroup>
                <Label>API URL</Label>
                <TextInput 
                  type="text" 
                  value={apiUrl} 
                  onChange={e => setApiUrl(e.target.value)} 
                  placeholder="https://your-api-endpoint.com/v1/completions"
                />
              </FormGroup>
            )}
            
            <SendButton onClick={configureAI} disabled={!apiKey || (provider === 'custom' && !apiUrl)}>
              {configured ? 'Update Configuration' : 'Configure'}
            </SendButton>
          </ConfigForm>
        </ConfigPanel>
      ) : messages.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>What's on your mind today?</EmptyStateTitle>
        </EmptyState>
      ) : (
        <>
          <ChatContainer id="chat-container">
            {messages.map((msg, index) => (
              <MessageGroup key={index} isUser={msg.isUser}>
                <MessageHeader>
                  {msg.isUser ? <FaUser /> : <FaRobot />}
                  {msg.isUser ? 'You' : 'AI Assistant'}
                </MessageHeader>
                <MessageText>
                  {msg.text || (loading && index === messages.length - 1 ? '...' : '')}
                </MessageText>
                {!msg.isUser && msg.text && (
                  <MessageActions>
                    <ActionButton>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 16H6.5C5.84 16 5.48 16 5.27 15.89C5.09 15.8 4.95 15.65 4.86 15.47C4.75 15.27 4.75 14.99 4.75 14.42V6.5C4.75 5.84 4.75 5.48 4.86 5.27C4.95 5.09 5.09 4.95 5.27 4.86C5.48 4.75 5.84 4.75 6.5 4.75H17.5C18.16 4.75 18.52 4.75 18.72 4.86C18.91 4.95 19.05 5.09 19.14 5.27C19.25 5.48 19.25 5.84 19.25 6.5V14.42C19.25 14.99 19.25 15.27 19.14 15.47C19.05 15.65 18.91 15.8 18.72 15.89C18.52 16 18.16 16 17.5 16H16M8 16L4 20M8 16H16M16 16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copy
                    </ActionButton>
                  </MessageActions>
                )}
              </MessageGroup>
            ))}
          </ChatContainer>
          
          <InputArea>
            <InputWrapper>
              <InputTools>
                <ToolButton>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </ToolButton>
              </InputTools>
              
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onInput={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                disabled={loading}
              />
              
              <InputActionsRight>
                {!loading && input.trim() && (
                  <ToolButton onClick={sendMessage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 12L4 4L6 12M20 12L4 20L6 12M20 12H6" stroke="#FF385C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </ToolButton>
                )}
              </InputActionsRight>
            </InputWrapper>
          </InputArea>
        </>
      )}
    </Container>
  );
};

export default AIChat; 