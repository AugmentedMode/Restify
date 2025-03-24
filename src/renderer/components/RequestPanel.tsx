import React, { useState, useRef, useEffect } from 'react';
import {
  FaPlus,
  FaTrash,
  FaPaperPlane,
  FaClock,
  FaSync,
  FaCode,
  FaCopy,
  FaLock,
  FaCheckCircle
} from 'react-icons/fa';
import {
  ApiRequest,
  HttpMethod,
  RequestHeader,
  RequestParam,
  BodyType,
  Environment,
} from '../types';
import {
  RequestHeader as RequestHeaderContainer,
  MethodSelector,
  UrlInput,
  UrlContainer,
  SendButton,
  TabContainer,
  TabList,
  Tab,
  TabContent,
  FormGroup,
  FormRow,
  CheckboxLabel,
  TextArea,
  AddButton,
  Spinner,
  StatusBar,
  StatusBarItem,
} from '../styles/StyledComponents';
import { processUrl, processUrlWithParams } from '../utils/apiUtils';
import { getMethodColor } from '../utils/uiUtils';
import { motion } from 'framer-motion';

interface RequestPanelProps {
  request: ApiRequest;
  onRequestChange: (updatedRequest: ApiRequest) => void;
  onSendRequest: (request?: ApiRequest) => void;
  isLoading?: boolean;
  lastRequestTime?: number;
  currentEnvironment?: Environment;
}

function RequestPanel({
  request,
  onRequestChange,
  onSendRequest,
  isLoading = false,
  lastRequestTime = 0,
  currentEnvironment,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState('params');
  const [lineCount, setLineCount] = useState(1);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Update line count when body content changes
  useEffect(() => {
    if (request.body && typeof request.body === 'string') {
      const lines = request.body.split('\n').length;
      setLineCount(Math.max(lines, 1));
    } else {
      setLineCount(1);
    }
  }, [request.body]);

  // Handle textarea scroll sync
  const handleTextAreaScroll = () => {
    if (textAreaRef.current) {
      const lineNumbers = document.getElementById('line-numbers');
      if (lineNumbers) {
        lineNumbers.scrollTop = textAreaRef.current.scrollTop;
      }
    }
  };

  // Handle tab key in textarea
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor position
      const newValue = 
        textarea.value.substring(0, start) + 
        '  ' + // 2 spaces for a tab instead of 4
        textarea.value.substring(end);
      
      // Update the value
      onRequestChange({
        ...request,
        body: newValue,
      });
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.selectionStart = start + 2; // Changed from 4 to 2
          textAreaRef.current.selectionEnd = start + 2; // Changed from 4 to
        }
      }, 0);
    }
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRequestChange({
      ...request,
      method: e.target.value as HttpMethod,
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRequestChange({ ...request, url: e.target.value });
  };

  // Get the processed URL with environment variables and parameters
  const getProcessedUrl = () => {
    if (!currentEnvironment && (!request.params || request.params.length === 0)) {
      return request.url;
    }
    
    return processUrlWithParams(request.url, request.params, currentEnvironment);
  };

  // Environment variable suggestion helper
  const [showEnvSuggestions, setShowEnvSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const urlInputRef = useRef<HTMLInputElement>(null);

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

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onRequestChange({
      ...request,
      body: e.target.value,
    });
  };

  const handleBodyTypeChange = (bodyType: BodyType) => {
    onRequestChange({
      ...request,
      bodyType,
      // Clear body when switching types to avoid format confusion
      body: bodyType === 'none' ? '' : request.body,
    });
  };

  const handleParamChange = (
    index: number,
    field: keyof RequestParam,
    value: string | boolean,
  ) => {
    const updatedParams = [...request.params];
    updatedParams[index] = {
      ...updatedParams[index],
      [field]: value,
    };

    onRequestChange({
      ...request,
      params: updatedParams,
    });
  };

  const handleHeaderChange = (
    index: number,
    field: keyof RequestHeader,
    value: string | boolean,
  ) => {
    // Ensure headers is an array before attempting to spread it
    const currentHeaders = Array.isArray(request.headers) ? request.headers : [];
    const updatedHeaders = [...currentHeaders];
    
    updatedHeaders[index] = {
      ...updatedHeaders[index],
      [field]: value,
    };

    onRequestChange({
      ...request,
      headers: updatedHeaders,
    });
  };

  const addParam = () => {
    onRequestChange({
      ...request,
      params: [...request.params, { name: '', value: '', enabled: true }],
    });
  };

  const removeParam = (index: number) => {
    const updatedParams = [...request.params];
    updatedParams.splice(index, 1);

    onRequestChange({
      ...request,
      params: updatedParams,
    });
  };

  const addHeader = () => {
    // Ensure headers is an array before attempting to spread it
    const currentHeaders = Array.isArray(request.headers) ? request.headers : [];
    
    onRequestChange({
      ...request,
      headers: [...currentHeaders, { name: '', value: '', enabled: true }],
    });
  };

  const removeHeader = (index: number) => {
    // Ensure headers is an array before attempting to spread it
    const currentHeaders = Array.isArray(request.headers) ? request.headers : [];
    const updatedHeaders = [...currentHeaders];
    updatedHeaders.splice(index, 1);

    onRequestChange({
      ...request,
      headers: updatedHeaders,
    });
  };

  // Helper function to get example body based on type
  const getBodyPlaceholder = (): string => {
    switch (request.bodyType) {
      case 'json':
        return '{\n  "key": "value",\n  "array": [1, 2, 3],\n  "nested": {\n    "property": true\n  }\n}';
      case 'form-data':
        return 'name: John Doe\nage: 30\nfile: /path/to/file.jpg';
      case 'form-urlencoded':
        return 'name=John%20Doe&age=30&active=true';
      case 'graphql':
        return '{\n  query {\n    user(id: "123") {\n      id\n      name\n      email\n    }\n  }\n}';
      case 'xml':
        return '<?xml version="1.0"?>\n<root>\n  <item id="1">\n    <name>Example</name>\n    <value>123</value>\n  </item>\n</root>';
      case 'yaml':
        return 'user:\n  name: John Doe\n  age: 30\n  roles:\n    - admin\n    - editor';
      case 'plain-text':
        return 'Enter plain text here...';
      default:
        return '';
    }
  };

  // Format the body on request, based on the body type
  const formatBody = () => {
    if (!request.body || request.bodyType === 'none' || typeof request.body !== 'string') return;

    try {
      let formatted = request.body;

      if (request.bodyType === 'json') {
        // Format JSON
        const parsed = JSON.parse(request.body);
        formatted = JSON.stringify(parsed, null, 2);
      } else if (
        request.bodyType === 'graphql' &&
        request.body.trim().startsWith('{')
      ) {
        // Format GraphQL JSON
        const parsed = JSON.parse(request.body);
        formatted = JSON.stringify(parsed, null, 2);
      }

      if (formatted !== request.body) {
        onRequestChange({
          ...request,
          body: formatted,
        });
      }
    } catch (e) {
      // If formatting fails, keep original body
      console.error('Failed to format body:', e);
    }
  };

  const hasBody = !['GET', 'HEAD'].includes(request.method);

  // Generate line numbers
  const renderLineNumbers = () => {
    return Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => (
      <div key={num} className="line-number">
        {num}
      </div>
    ));
  };

  // Function to render the processed URL with highlighted variables and params
  const renderProcessedUrlWithHighlight = () => {
    if (!request.url) return '';
    
    const processed = getProcessedUrl();
    
    // Get just the base URL with environment variables replaced
    const baseUrlWithEnvVars = currentEnvironment ? processUrl(request.url, currentEnvironment) : request.url;
    
    // Check if we have query params to highlight
    const hasQueryParams = processed.length > baseUrlWithEnvVars.length;
    
    if (!hasQueryParams && !currentEnvironment) {
      return processed;
    }
    
    // Split by query params
    const [baseUrl, queryString] = processed.split(/\?(.+)/);
    
    return (
      <>
        {/* Split the baseUrl by components and highlight env vars */}
        {baseUrl.split(/(https?:\/\/|\/)/g).map((part, index) => {
          if (part === 'http://' || part === 'https://') {
            return <span key={`base-${index}`} style={{ color: '#61afef' }}>{part}</span>;
          } else if (part === '/') {
            return <span key={`base-${index}`} style={{ color: '#c678dd' }}>{part}</span>;
          } else {
            // Check if the original URL had a variable that was replaced in this part
            const originalPart = request.url.split(/(https?:\/\/|\/)/g)[index];
            if (originalPart && originalPart.includes('{{') && originalPart.includes('}}')) {
              return (
                <motion.span 
                  key={`base-${index}`}
                  style={{ 
                    color: '#FF385C',
                    fontWeight: 'bold',
                    position: 'relative',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(255,56,92,0.3)',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: '3px'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    color: '#FF5A7C'
                  }}
                >
                  {part}
                </motion.span>
              );
            }
            return <span key={`base-${index}`} style={{ color: '#abb2bf' }}>{part}</span>;
          }
        })}
        
        {/* If we have query params, highlight them differently */}
        {hasQueryParams && queryString && (
          <>
            <span style={{ color: '#e06c75' }}>?</span>
            {queryString.split(/(&|=)/g).map((part, index) => {
              if (part === '&') {
                return <span key={`query-${index}`} style={{ color: '#e06c75' }}>&amp;</span>;
              } else if (part === '=') {
                return <span key={`query-${index}`} style={{ color: '#e06c75' }}>=</span>;
              } else if (index % 4 === 0) { // Parameter names (every 4th item starting at 0)
                return (
                  <span 
                    key={`query-${index}`} 
                    style={{ 
                      color: '#56b6c2',
                      fontWeight: 'bold'
                    }}
                  >
                    {part}
                  </span>
                );
              } else { // Parameter values
                return <span key={`query-${index}`} style={{ color: '#98c379' }}>{part}</span>;
              }
            })}
          </>
        )}
      </>
    );
  };

  return (
    <>
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
            placeholder="Enter request URL or paste cURL"
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
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              marginTop: '4px'
            }}>
              {suggestions.map(variable => (
                <div
                  key={variable}
                  onClick={() => insertEnvironmentVariable(variable)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #444',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: '#FF385C', fontWeight: 'bold', marginRight: '8px' }}>
                    {variable}
                  </span>
                  <span style={{ color: '#999', fontSize: '12px' }}>
                    {currentEnvironment?.variables[variable]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </UrlContainer>

        <SendButton onClick={() => onSendRequest(request)} disabled={isLoading}>
          {isLoading ? <Spinner /> : <FaPaperPlane />}
          {!isLoading && <span>Send</span>}
        </SendButton>
      </RequestHeaderContainer>

      <TabContainer>
        <TabList>
          <Tab
            active={activeTab === 'params'}
            onClick={() => setActiveTab('params')}
          >
            Params
          </Tab>
          <Tab
            active={activeTab === 'headers'}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </Tab>
          <Tab
            active={activeTab === 'body'}
            onClick={() => setActiveTab('body')}
          >
            Body {!hasBody}
          </Tab>
          <Tab
            active={activeTab === 'auth'}
            onClick={() => setActiveTab('auth')}
          >
            Auth
          </Tab>
        </TabList>
      </TabContainer>

      <TabContent>
        {/* Show processed URL preview with enhanced UI */}
        {((currentEnvironment && request.url.includes('{{')) || 
          (request.params && request.params.some(p => p.enabled && p.name.trim()))) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ 
              margin: '4px 0 12px 0',
              position: 'relative',
            }}
          >
            <div style={{ 
              padding: '14px',
              borderRadius: '8px',
              background: 'linear-gradient(145deg, rgba(14,14,16,0.8) 0%, rgba(22,22,26,0.8) 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset',
              backdropFilter: 'blur(10px)',
              color: '#f5f5f5',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {/* Subtle glow effect in the background */}
              <div style={{
                position: 'absolute',
                top: '-30%',
                left: '-10%',
                width: '30%',
                height: '150%',
                background: 'radial-gradient(circle, rgba(255,56,92,0.05) 0%, rgba(255,56,92,0) 70%)',
                zIndex: 0,
              }} />
              
              <div style={{
                position: 'relative',
                zIndex: 1,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#FF385C',
                      boxShadow: '0 0 6px rgba(255,56,92,0.5)'
                    }} />
                    Processed URL
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Copy button with state feedback */}
                    <CopyButton url={getProcessedUrl()} />
                  </div>
                </div>
                
                <div style={{
                  fontSize: '13px',
                  fontFamily: 'SF Mono, Consolas, monospace',
                  lineHeight: '1.5',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  whiteSpace: 'nowrap',
                  padding: '8px 10px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,56,92,0.1)',
                  position: 'relative',
                }}>
                  {/* Render the URL with highlighted variables and params */}
                  {renderProcessedUrlWithHighlight()}
                </div>
                
                {/* Environment indicator */}
                {currentEnvironment && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    <FaLock size={9} />
                    Using <span style={{ 
                      fontWeight: 'bold', 
                      color: 'rgba(255,56,92,0.8)',
                      padding: '1px 5px',
                      backgroundColor: 'rgba(255,56,92,0.08)',
                      borderRadius: '3px'
                    }}>
                      {currentEnvironment.name}
                    </span> environment
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'params' && (
          <FormGroup>
            {request.params.map((param, index) => {
              // Generate a stable key that doesn't include the name property
              // Using a prefix that clearly indicates it's not relying *just* on index
              return (
                <FormRow key={`param-item-${btoa(`${index}`)}`}>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) =>
                        handleParamChange(index, 'enabled', e.target.checked)
                      }
                    />
                  </CheckboxLabel>
                  <input
                    type="text"
                    placeholder="Parameter name"
                    value={param.name}
                    onChange={(e) =>
                      handleParamChange(index, 'name', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Parameter value"
                    value={param.value}
                    onChange={(e) =>
                      handleParamChange(index, 'value', e.target.value)
                    }
                  />
                  <button type="button" onClick={() => removeParam(index)}>
                    <FaTrash />
                  </button>
                </FormRow>
              );
            })}
            <AddButton onClick={addParam}>
              <FaPlus /> Add Parameter
            </AddButton>
          </FormGroup>
        )}

        {activeTab === 'headers' && (
          <FormGroup>
            {Array.isArray(request.headers) && request.headers.map((header, index) => {
              // Generate a stable key that doesn't include the name property
              // Using a prefix that clearly indicates it's not relying *just* on index
              return (
                <FormRow key={`header-item-${btoa(`${index}`)}`}>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) =>
                        handleHeaderChange(index, 'enabled', e.target.checked)
                      }
                    />
                  </CheckboxLabel>
                  <input
                    type="text"
                    placeholder="Header name"
                    value={header.name}
                    onChange={(e) =>
                      handleHeaderChange(index, 'name', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Header value"
                    value={header.value}
                    onChange={(e) =>
                      handleHeaderChange(index, 'value', e.target.value)
                    }
                  />
                  <button type="button" onClick={() => removeHeader(index)}>
                    <FaTrash />
                  </button>
                </FormRow>
              );
            })}
            <AddButton onClick={addHeader}>
              <FaPlus /> Add Header
            </AddButton>
          </FormGroup>
        )}

        {activeTab === 'body' && hasBody && (
          <FormGroup>
            <div
              style={{
                display: 'flex',
                marginBottom: '14px',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              {/* Compact Body Type Select with Format Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                position: 'relative',
                width: '100%',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.07)',
                  borderRadius: '8px',
                  padding: '0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  flex: '1',
                  maxWidth: '240px',
                  position: 'relative',
                }}>
                  <span style={{
                    padding: '8px 12px',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                  }}>
                    Format
                  </span>
                  <select
                    value={request.bodyType}
                    onChange={(e) => handleBodyTypeChange(e.target.value as BodyType)}
                    style={{
                      flex: '1',
                      padding: '8px 30px 8px 12px',
                      appearance: 'none',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <option value="none">No Body</option>
                    <option value="json">JSON</option>
                    <option value="form-data">Form Data</option>
                    <option value="form-urlencoded">URL Encoded</option>
                    <option value="graphql">GraphQL</option>
                    <option value="xml">XML</option>
                    <option value="plain-text">Plain Text</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '10px',
                    pointerEvents: 'none',
                    color: '#FF5A5F',
                    fontSize: '10px',
                  }}>
                    ▼
                  </div>
                </div>
                
                {/* Filter-like Body Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: 'auto',
                }}>
                  {request.bodyType !== 'none' && (
                    <>
                      <button
                        type="button"
                        onClick={formatBody}
                        style={{
                          background: 'rgba(255, 90, 95, 0.15)',
                          border: '1px solid rgba(255, 90, 95, 0.3)',
                          color: 'rgba(255, 255, 255, 0.9)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          fontWeight: '500',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 90, 95, 0.25)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 90, 95, 0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 90, 95, 0.25)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 90, 95, 0.15)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FaCode /> Format
                      </button>
                      
                      {/* Additional action buttons could go here */}
                      <button
                        type="button"
                        onClick={() => {}}
                        style={{
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: 'rgba(255, 255, 255, 0.7)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          padding: '7px 7px',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                        }}
                        title="Copy body content"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {}}
                        style={{
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: 'rgba(255, 255, 255, 0.7)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          padding: '7px 7px',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                        }}
                        title="Clear body content"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {request.bodyType !== 'none' && (
              <>
                <div style={{
                  display: 'flex',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(8, 8, 16, 0.2)',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {/* Line Numbers */}
                  <div
                    id="line-numbers"
                    style={{
                      width: '50px',
                      padding: '12px 8px',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'SF Mono, monospace',
                      fontSize: '14px',
                      textAlign: 'right',
                      userSelect: 'none',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                      overflowY: 'hidden',
                    }}
                  >
                    {renderLineNumbers()}
                  </div>
                  
                  {/* Text Editor */}
                  <TextArea
                    ref={textAreaRef}
                    placeholder={getBodyPlaceholder()}
                    value={typeof request.body === 'string' ? request.body : ''}
                    onChange={handleBodyChange}
                    onScroll={handleTextAreaScroll}
                    onKeyDown={handleTabKey}
                    style={{
                      fontFamily: 'SF Mono, monospace',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      minHeight: '300px',
                      padding: '12px',
                      flex: 1,
                      border: 'none',
                      resize: 'vertical',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.9)',
                      width: 'calc(100% - 50px)',
                    }}
                  />
                </div>
                
                {/* Add styling for the shine animation */}
                <style>
                  {`
                    @keyframes shine {
                      0% {
                        transform: translateX(-100%);
                      }
                      50%, 100% {
                        transform: translateX(100%);
                      }
                    }
                    
                    .line-number {
                      height: 1.5em;
                      padding-right: 8px;
                    }
                    
                    textarea:focus {
                      outline: none;
                      box-shadow: 0 0 0 2px rgba(255, 90, 95, 0.3);
                    }
                    
                    select:focus {
                      outline: none;
                      box-shadow: none;
                    }
                    
                    /* Style for dropdown options (works in some browsers) */
                    option {
                      background-color: #222;
                      color: white;
                      padding: 8px;
                    }
                    
                    button:hover {
                      background: rgba(255, 255, 255, 0.15) !important;
                    }
                  `}
                </style>
              </>
            )}
          </FormGroup>
        )}

        {activeTab === 'body' && !hasBody && (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ opacity: 0.7, fontSize: '36px' }}>📭</div>
            <div style={{ fontSize: '16px' }}>
              {request.method} requests do not support a request body
            </div>
          </div>
        )}

        {activeTab === 'auth' && (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Authentication options will be implemented here
          </div>
        )}
      </TabContent>

      <StatusBar>
        <div>
          {lastRequestTime > 0 && (
            <StatusBarItem>
              <FaClock />
              <span>
                Last request: {new Date(lastRequestTime).toLocaleTimeString()}
              </span>
            </StatusBarItem>
          )}
        </div>
        <StatusBarItem>
          <FaSync />
          <span>Status: {isLoading ? 'Sending request...' : 'Ready'}</span>
        </StatusBarItem>
      </StatusBar>
    </>
  );
}

// Copy button component with animation
const CopyButton = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: copied ? 'rgba(73,204,144,0.1)' : 'rgba(255,56,92,0.08)',
        border: '1px solid',
        borderColor: copied ? 'rgba(73,204,144,0.2)' : 'rgba(255,56,92,0.15)',
        color: copied ? 'rgba(73,204,144,0.9)' : 'rgba(255,56,92,0.9)',
        borderRadius: '4px',
        padding: '4px 6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {copied ? <FaCheckCircle size={10} /> : <FaCopy size={10} />}
      {copied ? 'Copied!' : 'Copy'}
    </motion.button>
  );
};

export default RequestPanel;
