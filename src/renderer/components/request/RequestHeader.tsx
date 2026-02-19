import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { HttpMethod } from '../../types';
import { RequestHeaderProps } from './types';
import { 
  RequestHeader as RequestHeaderContainer,
  MethodSelector,
  UrlInput,
  UrlContainer,
  RequestSendButton,
  Spinner
} from '../../styles/StyledComponents';

const RequestHeader: React.FC<RequestHeaderProps> = ({
  request,
  onRequestChange,
  onSendRequest,
  isLoading = false,
  currentEnvironment,
}) => {
  // Environment variable suggestion helper
  const [showEnvSuggestions, setShowEnvSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRequestChange({
      ...request,
      method: e.target.value as HttpMethod,
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRequestChange({ ...request, url: e.target.value });
  };

  // Handle URL input focus and keydown
  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If typing {{ show environment variable suggestions
    const selectionStart = e.currentTarget.selectionStart || 0;
    if (e.key === '{' && e.currentTarget.value[selectionStart - 1] === '{') {
      if (currentEnvironment) {
        const variables = Object.keys(currentEnvironment.variables);
        if (variables.length > 0) {
          setSuggestions(variables);
          setShowEnvSuggestions(true);
          setCursorPosition(selectionStart);
        }
      }
    } 
    // Handle Enter key to send request
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setShowEnvSuggestions(false);
      onSendRequest();
    } 
    // Close suggestions on escape
    else if (e.key === 'Escape') {
      setShowEnvSuggestions(false);
    }
  };

  // Insert the selected environment variable
  const insertEnvironmentVariable = (variable: string) => {
    if (!urlInputRef.current) return;
    
    const input = urlInputRef.current;
    const curText = request.url;
    const curPos = input.selectionStart || 0;
    
    // Find the position of the opening {{
    const openBracePos = curText.lastIndexOf('{{', curPos);
    if (openBracePos === -1) return;
    
    // Build the new URL with the variable inserted
    const newUrl = 
      curText.substring(0, openBracePos) + 
      '{{' + variable + '}}' + 
      curText.substring(curPos);
    
    // Update the request URL
    onRequestChange({
      ...request,
      url: newUrl
    });
    
    // Close the suggestions
    setShowEnvSuggestions(false);
    
    // Focus the input after state update
    setTimeout(() => {
      if (urlInputRef.current) {
        urlInputRef.current.focus();
        // Set cursor position after the inserted variable
        const newCursorPos = openBracePos + variable.length + 4; // +4 for the {{}}
        urlInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (urlInputRef.current && !urlInputRef.current.contains(e.target as Node)) {
        setShowEnvSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <RequestHeaderContainer>
      <UrlContainer>
        <MethodSelector
          value={request.method}
          onChange={handleMethodChange}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="OPTIONS">OPTIONS</option>
          <option value="HEAD">HEAD</option>
        </MethodSelector>

        <UrlInput
          ref={urlInputRef}
          type="text"
          value={request.url}
          onChange={handleUrlChange}
          onKeyDown={handleUrlKeyDown}
          placeholder="Enter request URL"
        />
        
        {/* Environment variable suggestions */}
        {showEnvSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: 10,
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'rgba(19, 20, 27, 0.98)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '10px',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.28)',
            marginTop: '4px'
          }}>
            {suggestions.map(variable => (
              <div
                key={variable}
                onClick={() => insertEnvironmentVariable(variable)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ color: '#FF385C', fontWeight: 'bold', marginRight: '8px' }}>
                  {variable}
                </span>
                <span style={{ color: 'rgba(196,200,214,0.72)', fontSize: '12px' }}>
                  {currentEnvironment?.variables[variable]}
                </span>
              </div>
            ))}
          </div>
        )}
      </UrlContainer>

      <RequestSendButton onClick={() => onSendRequest(request)} disabled={isLoading}>
        {isLoading ? <Spinner /> : <FaPaperPlane />}
      </RequestSendButton>
    </RequestHeaderContainer>
  );
};

export default RequestHeader;
