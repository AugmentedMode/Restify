import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaLightbulb } from 'react-icons/fa';
import { HttpMethod } from '../../types';
import { RequestHeaderProps } from './types';
import { 
  RequestHeader as RequestHeaderContainer,
  MethodSelector,
  UrlInput,
  UrlContainer,
  SendButton,
  Spinner
} from '../../styles/StyledComponents';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Animation variants
  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  const suggestionItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }),
    hover: {
      scale: 1.02,
      backgroundColor: 'rgba(115, 103, 240, 0.15)',
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <RequestHeaderContainer>
      <UrlContainer 
        style={{
          background: 'rgba(25, 25, 30, 0.7)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <MethodSelector
          value={request.method}
          onChange={handleMethodChange}
          style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            fontWeight: 600
          }}
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
          style={{
            fontFamily: "'SF Mono', 'Monaco', 'Menlo', monospace",
            fontSize: '14px'
          }}
        />
        
        {/* Environment variable suggestions */}
        <AnimatePresence>
          {showEnvSuggestions && suggestions.length > 0 && (
            <motion.div 
              variants={suggestionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '90px',
                zIndex: 10,
                width: 'calc(100% - 160px)',
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'rgba(30, 30, 35, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ 
                padding: '10px 12px', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500
              }}>
                <FaLightbulb size={12} style={{ color: '#7367f0' }} />
                Environment Variables
              </div>
              {suggestions.map((variable, index) => (
                <motion.div
                  key={variable}
                  onClick={() => insertEnvironmentVariable(variable)}
                  custom={index}
                  variants={suggestionItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ 
                    color: '#7367f0', 
                    fontWeight: 'bold', 
                    marginRight: '8px' 
                  }}>
                    {`{{${variable}}}`}
                  </span>
                  <span style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '12px',
                    fontStyle: 'italic',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {currentEnvironment?.variables[variable]}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </UrlContainer>

      <SendButton 
        as={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSendRequest(request)} 
        disabled={isLoading}
        style={{
          background: 'linear-gradient(135deg, #7367f0, #ce9ffc)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(115, 103, 240, 0.3)'
        }}
      >
        {isLoading ? <Spinner /> : <FaPaperPlane />}
      </SendButton>
    </RequestHeaderContainer>
  );
};

export default RequestHeader; 