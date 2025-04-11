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
  RequestHeader as RequestHeaderType,
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
  StatusBar as StatusBarContainer,
  StatusBarItem,
} from '../styles/StyledComponents';
import { processUrl, processUrlWithParams } from '../utils/apiUtils';
import { getMethodColor } from '../utils/uiUtils';
import { motion, AnimatePresence } from 'framer-motion';

// Import components using different names to avoid conflicts
import RequestHeaderComponent from './request/RequestHeader';
import ProcessedUrlDisplayComponent from './request/ProcessedUrlDisplay';
import TabsContainerComponent from './request/TabsContainer';
import StatusBarComponent from './request/StatusBar';

interface RequestPanelProps {
  request: ApiRequest;
  onRequestChange: (updatedRequest: ApiRequest) => void;
  onSendRequest: (request?: ApiRequest) => void;
  isLoading?: boolean;
  lastRequestTime?: number;
  currentEnvironment?: Environment;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const popInVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

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
  const [processedBaseUrl, setProcessedBaseUrl] = useState<string>('');
  const [processedFullUrl, setProcessedFullUrl] = useState<string>('');

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
    return processedFullUrl;
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
    field: keyof RequestHeaderType,
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

  // Update the useEffect to handle both URLs
  useEffect(() => {
    const updateProcessedUrls = async () => {
      if (!request.url) {
        setProcessedBaseUrl('');
        setProcessedFullUrl('');
        return;
      }
      
      try {
        // Process base URL (just environment variables)
        const baseProcessed = currentEnvironment 
          ? await processUrl(request.url, currentEnvironment)
          : request.url;
        setProcessedBaseUrl(baseProcessed);
        
        // Process full URL (environment variables + params)
        if (!request.params || request.params.length === 0) {
          setProcessedFullUrl(baseProcessed);
        } else {
          const fullProcessed = await processUrlWithParams(request.url, request.params, currentEnvironment);
          setProcessedFullUrl(fullProcessed);
        }
      } catch (error) {
        console.error('Error processing URL:', error);
        setProcessedBaseUrl(request.url);
        setProcessedFullUrl(request.url);
      }
    };
    
    updateProcessedUrls();
  }, [currentEnvironment, request.url, request.params]);

  // Update the renderProcessedUrlWithHighlight function to use the state
  const renderProcessedUrlWithHighlight = () => {
    if (!request.url) return '';
    
    const processed = getProcessedUrl();
    
    // Use the state variable instead of calling processUrl directly
    const baseUrlWithEnvVars = processedBaseUrl;
    
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
                    color: '#7367f0',
                    fontWeight: 'bold',
                    position: 'relative',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(115, 103, 240, 0.3)',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: '3px'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    color: '#8e85f2'
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

  // Determine if we should show the processed URL display
  const shouldShowProcessedUrl = 
    (currentEnvironment && request.url.includes('{{')) || 
    (request.params && request.params.some(p => p.enabled && p.name.trim()));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'hidden',
        background: 'rgba(25, 25, 30, 0.3)',
        borderRadius: '12px'
      }}
    >
      <motion.div variants={itemVariants}>
        <RequestHeaderComponent
          request={request}
          onRequestChange={onRequestChange}
          onSendRequest={onSendRequest}
          isLoading={isLoading}
          currentEnvironment={currentEnvironment}
        />
      </motion.div>

      {shouldShowProcessedUrl && (
        <motion.div 
          variants={popInVariants}
          initial="hidden"
          animate="visible"
        >
          <ProcessedUrlDisplayComponent
            processedBaseUrl={processedBaseUrl}
            processedFullUrl={processedFullUrl}
            originalUrl={request.url}
            currentEnvironment={currentEnvironment}
          />
        </motion.div>
      )}

      <motion.div 
        variants={itemVariants}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <TabsContainerComponent
          request={request}
          onRequestChange={onRequestChange}
          formatBody={formatBody}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatusBarComponent 
          lastRequestTime={lastRequestTime}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}

export default RequestPanel;
