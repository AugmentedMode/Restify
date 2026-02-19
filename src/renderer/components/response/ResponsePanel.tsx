import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaDownload,
  FaCopy,
  FaSpinner,
  FaCode,
  FaMagic,
  FaFileCode,
  FaShieldAlt,
  FaGlobeAmericas,
  FaChevronDown,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaLockOpen,
  FaSatellite,
  FaRadiation,
  FaQuestion,
  FaSpaceShuttle,
  FaExclamationTriangle,
  FaRobot,
  FaWater,
  FaMountain,
  FaSearch,
  FaRocket,
} from 'react-icons/fa';
import { ApiResponse, ApiRequest, Environment } from '../../types/index';
import {
  ResponseContainer,
  ResponseHeader,
  ResponseBody,
  TabContent,
  SettingsButton,
  StatusPill,
  ResponseMetric,
  ResponseTabs,
  ResponseTab,
} from '../../styles/StyledComponents';
import ResponseContent from './components/ResponseContent';
import CopyButton from './components/CopyButton';
import TypeScriptModal from './components/TypeScriptModal';
import { formatBytes, getSafeResponseData, generateTypeScript } from './utils';
import {
  LARGE_RESPONSE_THRESHOLD,
  VERY_LARGE_RESPONSE_THRESHOLD,
  MASSIVE_RESPONSE_THRESHOLD,
  MAX_ITEMS_TO_RENDER,
  VIRTUALIZED_CHUNK_SIZE,
} from './constants';
import SecurityAuditPanel from './components/SecurityAuditPanel';
import styled from 'styled-components';
import { encryptValue, decryptValue } from '../../utils/encryptionUtils';

// Styled components for the environment selector
const EnvSelectorContainer = styled.div`
  margin-left: auto;
  position: relative;
  display: flex;
  align-items: center;
`;

const EnvSelectorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.055) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  padding: 8px 12px;
  color: rgba(243, 245, 251, 0.95);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 6px 14px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.07) 0%,
      rgba(255, 56, 92, 0.08) 100%
    );
    border-color: rgba(255, 118, 154, 0.44);
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 8px 16px rgba(255, 56, 92, 0.16);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 3px 8px rgba(0, 0, 0, 0.2);
  }
`;

const EnvDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 244px;
  background:
    radial-gradient(140% 85% at -15% -20%, rgba(255, 56, 92, 0.14), transparent 58%),
    linear-gradient(180deg, rgba(32, 33, 42, 0.98), rgba(20, 21, 27, 0.98));
  border-radius: 10px;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.35);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  margin-top: 6px;
  max-height: 300px;
  overflow-y: auto;
`;

const EnvDropdownItem = styled.div<{ active?: boolean }>`
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${(props) =>
    props.active ? 'rgba(255, 56, 92, 0.14)' : 'transparent'};
  color: ${(props) =>
    props.active ? 'rgba(255, 242, 246, 0.98)' : 'rgba(223, 227, 240, 0.88)'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${(props) =>
      props.active ? 'rgba(255, 56, 92, 0.22)' : 'rgba(255, 255, 255, 0.06)'};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
`;

const EnvDropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(0, 0, 0, 0.18);
  color: rgba(211, 216, 232, 0.72);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const EnvDropdownActions = styled.div`
  display: flex;
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(0, 0, 0, 0.18);
  gap: 8px;
`;

const EnvActionButton = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  padding: 6px 10px;
  color: rgba(236, 239, 248, 0.92);
  font-size: 12px;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.14);
    border-color: rgba(255, 116, 148, 0.5);
    color: #ffffff;
  }
`;

const ResponseSettingsButton = styled(SettingsButton)`
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.045) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  color: rgba(219, 224, 238, 0.88);
  margin-left: 6px;

  &:hover {
    background: rgba(255, 56, 92, 0.14);
    border-color: rgba(255, 122, 156, 0.46);
    color: rgba(255, 255, 255, 0.96);
  }
`;

// Modal components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #333;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #bbb;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #f5f5f5;
  font-size: 14px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const VariableRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
`;

const VariablesContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 8px;
  padding-right: 4px;
`;

const CancelButton = styled.button`
  background-color: transparent;
  border: 1px solid #555;
  color: #f5f5f5;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const SaveButton = styled.button`
  background-color: #FF385C;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e6324f;
  }
`;

// Adding the NoResponseMessage component
const NoResponseMessage = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      color: '#888',
      textAlign: 'center',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Stars in background */}
    <div className="stars-container">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="star" 
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
    
    <div
      style={{
        fontSize: '56px',
        marginBottom: '16px',
        color: '#FF385C',
        animation: 'float 4s ease-in-out infinite',
        zIndex: 2,
      }}
    >
      <FaSatellite />
    </div>
    
    <h3 
      style={{ 
        margin: '0 0 12px 0', 
        color: '#999', 
        fontWeight: 400, 
        fontSize: '20px',
        zIndex: 2,
      }}
    >
      Houston, we have a problem
    </h3>
    
    <p 
      style={{ 
        fontSize: '14px', 
        maxWidth: '300px', 
        color: '#777',
        fontWeight: 300,
        lineHeight: 1.5,
        zIndex: 2,
      }}
    >
      Our satellite couldn't find any response data in the vast emptiness of space. Try sending a request!
    </p>
  </div>
);

// Adding a fun 404 Not Found screen - space themed
const NotFoundScreen = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      color: '#888',
      textAlign: 'center',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Stars in background */}
    <div className="stars-container">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="star" 
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
    
    {/* Black hole effect */}
    <div className="black-hole"></div>
    
    <div
      style={{
        fontSize: '56px',
        marginBottom: '16px', 
        color: '#FF385C',
        animation: 'float 4s ease-in-out infinite',
        zIndex: 2,
      }}
    >
      <FaSearch />
    </div>
    
    <h3 
      style={{ 
        margin: '0 0 12px 0', 
        color: '#999', 
        fontWeight: 400, 
        fontSize: '20px',
        zIndex: 2,
      }}
    >
      Lost in Space - 404
    </h3>
    
    <p 
      style={{ 
        fontSize: '14px', 
        maxWidth: '300px', 
        color: '#777',
        fontWeight: 300,
        lineHeight: 1.5,
        zIndex: 2,
        marginBottom: '15px',
      }}
    >
      The resource you're looking for has drifted into a black hole. It could not be found in this galaxy.
    </p>
    
    {/* Technical information for developers */}
    <div 
      style={{ 
        background: 'rgba(255, 56, 92, 0.1)', 
        padding: '10px 16px', 
        borderRadius: '6px',
        maxWidth: '300px',
        width: '100%',
        zIndex: 2,
        border: '1px solid rgba(255, 56, 92, 0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
        <span style={{ color: '#999' }}>Status:</span>
        <span style={{ color: '#FF385C', fontWeight: 'bold' }}>404 Not Found</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <span style={{ color: '#999' }}>Resource:</span>
        <span style={{ color: '#ccc', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          {window.location.pathname}
        </span>
      </div>
    </div>
  </div>
);

// Adding a fun 500 Server Error screen - space themed
const ServerErrorScreen = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      color: '#888',
      textAlign: 'center',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Stars in background */}
    <div className="stars-container meteor-shower">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="star" 
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1 + Math.random() * 3}s`,
          }}
        />
      ))}
      
      {/* Improved Meteors */}
      {[...Array(7)].map((_, i) => (
        <div 
          key={i} 
          className="meteor" 
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            width: `${2 + Math.random() * 1}px`,
            height: `${10 + Math.random() * 20}px`,
            animationDuration: `${1 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 6}s`,
          }}
        />
      ))}
    </div>
    
    <div
      style={{
        fontSize: '56px',
        marginBottom: '16px',
        color: '#FF385C',
        animation: 'spaceship-drift 8s ease-in-out infinite',
        zIndex: 2,
        position: 'relative',
      }}
    >
      <FaSpaceShuttle style={{ transform: 'rotate(90deg)' }} />
      <div className="engine-flame"></div>
    </div>
    
    <h3 
      style={{ 
        margin: '0 0 12px 0', 
        color: '#999', 
        fontWeight: 400, 
        fontSize: '20px',
        zIndex: 2,
      }}
    >
      Space Station Failure
    </h3>
    
    <p 
      style={{ 
        fontSize: '14px', 
        maxWidth: '300px', 
        color: '#777',
        fontWeight: 300,
        lineHeight: 1.5,
        zIndex: 2,
        marginBottom: '15px',
      }}
    >
      The server space station is experiencing critical system failures. Mission control is working on repairs.
    </p>
    
    {/* Technical information for developers */}
    <div 
      style={{ 
        background: 'rgba(255, 56, 92, 0.1)', 
        padding: '10px 16px', 
        borderRadius: '6px',
        maxWidth: '300px',
        width: '100%',
        zIndex: 2,
        marginBottom: '15px',
        border: '1px solid rgba(255, 56, 92, 0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
        <span style={{ color: '#999' }}>Status:</span>
        <span style={{ color: '#FF385C', fontWeight: 'bold' }}>500 Server Error</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <span style={{ color: '#999' }}>Type:</span>
        <span style={{ color: '#ccc', fontFamily: 'monospace' }}>Internal Server Error</span>
      </div>
    </div>
    
    <div className="error-terminal">
      <div className="terminal-header">
        <span className="terminal-title">Error Log</span>
      </div>
      <div className="terminal-body">
        <span className="terminal-prompt">$</span>
        <span className="terminal-text">error_code:</span>
        <span className="terminal-error-code">5XX_SERVER_FAILURE</span>
      </div>
    </div>
  </div>
);

// Space-themed loading animation
const SpaceLoadingAnimation = () => {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Backdrop glow */}
      <div className="space-backdrop"></div>
      
      {/* Stars background */}
      <div className="stars-container loading-stars">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              opacity: 0.1 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>
      
      {/* Small distant stars with parallax effect */}
      <div className="parallax-stars">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="parallax-star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Main loading indicator */}
      <div className="space-loading-scene">
        {/* Planet */}
        <div className="planet">
          <div className="planet-shadow"></div>
          <div className="planet-surface"></div>
          
          {/* Orbit paths */}
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          
          {/* Satellite */}
          <div className="satellite-container">
            <div className="satellite">
              <FaSatellite size={10} />
            </div>
          </div>
        </div>
        
        {/* Rocket launch pad */}
        <div className="launch-pad">
          <div className="launch-stand-left"></div>
          <div className="launch-stand-right"></div>
        </div>
        
        {/* Rocket with improved design */}
        <div className="rocket-wrapper">
          <div className="rocket">
            <div className="rocket-body">
              <FaRocket className="rocket-icon" />
            </div>
            <div className="rocket-exhaust">
              <div className="rocket-flame"></div>
              <div className="rocket-smoke"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="loading-progress">
        <div className="loading-dots">
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
        </div>
        <div className="loading-text">
          Establishing connection
        </div>
      </div>
    </div>
  );
};

interface ResponsePanelProps {
  response: ApiResponse | null;
  request?: ApiRequest | null;
  isLoading?: boolean;
  environments?: Environment[];
  currentEnvironmentId?: string | null;
  onAddEnvironment?: (environment: Environment) => void;
  onUpdateEnvironment?: (environment: Environment) => void;
  onDeleteEnvironment?: (environmentId: string) => void;
  onSelectEnvironment?: (environmentId: string | null) => void;
}

function ResponsePanel({
  response,
  request,
  isLoading = false,
  environments = [],
  currentEnvironmentId = null,
  onAddEnvironment = () => {},
  onUpdateEnvironment = () => {},
  onDeleteEnvironment = () => {},
  onSelectEnvironment = () => {},
}: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState('body');
  const [copied, setCopied] = useState(false);
  const [showFullResponse, setShowFullResponse] = useState(false);
  const [isLargeResponse, setIsLargeResponse] = useState(false);
  const [isVeryLargeResponse, setIsVeryLargeResponse] = useState(false);
  const [isMassiveResponse, setIsMassiveResponse] = useState(false);
  const [isPrettyFormat, setIsPrettyFormat] = useState(true);
  const [isPlainTextView, setIsPlainTextView] = useState(false);
  const [isRawMode, setIsRawMode] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(MAX_ITEMS_TO_RENDER);
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: VIRTUALIZED_CHUNK_SIZE,
  });
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [generatedTypes, setGeneratedTypes] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalLines, setTotalLines] = useState(0);
  const [processedLines, setProcessedLines] = useState<React.ReactNode[]>([]);
  
  // Environment state
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [environmentName, setEnvironmentName] = useState('');
  const [variables, setVariables] = useState<{ key: string; value: string; isSecret: boolean }[]>([{ key: '', value: '', isSecret: false }]);
  const envDropdownRef = useRef<HTMLDivElement>(null);
  // State for tracking which secret values are temporarily visible
  const [visibleSecrets, setVisibleSecrets] = useState<Record<number, boolean>>({});
  
  // Toggle secret visibility
  const toggleSecretVisibility = (index: number) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showEnvDropdown &&
        envDropdownRef.current &&
        !envDropdownRef.current.contains(e.target as Node)
      ) {
        setShowEnvDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEnvDropdown]);

  // Environment modal handlers
  const openEnvModal = async (environment?: Environment | 'global') => {
    if (environment === 'global') {
      // Special case for global environment
      setEditingEnvironment({ id: 'global', name: 'Global Environment', variables: {} });
      setEnvironmentName('Global Environment');
      
      // Get global variables if available
      const globalVars = environments.find(env => env.id === 'global')?.variables || {};
      const varsPromises = Object.entries(globalVars).map(async ([key, value]) => {
        // Check if the value is in encrypted format
        const isSecret = typeof value === 'string' && value.startsWith('encrypted:');
        let actualValue = value;
        
        // If it's secret, decrypt it for editing
        if (isSecret && typeof value === 'string') {
          try {
            actualValue = await decryptValue(value);
          } catch (error) {
            console.error(`Failed to decrypt variable ${key}:`, error);
            // Use a placeholder if decryption fails
            actualValue = '[Decryption Error]';
          }
        }
        
        return {
          key,
          value: actualValue,
          isSecret,
        };
      });
      
      const vars = await Promise.all(varsPromises);
      setVariables(vars.length > 0 ? vars : [{ key: '', value: '', isSecret: false }]);
    } else if (environment) {
      setEditingEnvironment(environment);
      setEnvironmentName(environment.name);
      
      const varsPromises = Object.entries(environment.variables).map(async ([key, value]) => {
        // Check if the value is in encrypted format
        const isSecret = typeof value === 'string' && value.startsWith('encrypted:');
        let actualValue = value;
        
        // If it's secret, decrypt it for editing
        if (isSecret && typeof value === 'string') {
          try {
            actualValue = await decryptValue(value);
          } catch (error) {
            console.error(`Failed to decrypt variable ${key}:`, error);
            // Use a placeholder if decryption fails
            actualValue = '[Decryption Error]';
          }
        }
        
        return {
          key,
          value: actualValue,
          isSecret,
        };
      });
      
      const vars = await Promise.all(varsPromises);
      setVariables(vars.length > 0 ? vars : [{ key: '', value: '', isSecret: false }]);
    } else {
      setEditingEnvironment(null);
      setEnvironmentName('');
      setVariables([{ key: '', value: '', isSecret: false }]);
    }
    
    setShowEnvModal(true);
    setShowEnvDropdown(false);
  };

  const closeEnvModal = () => {
    setShowEnvModal(false);
    setEditingEnvironment(null);
    setEnvironmentName('');
    setVariables([{ key: '', value: '', isSecret: false }]);
  };

  const handleSaveEnvironment = async () => {
    if (!environmentName.trim()) {
      return;
    }

    const variablesObject: Record<string, string> = {};
    
    // Process each variable, encrypting secrets
    for (const { key, value, isSecret } of variables) {
      if (key.trim()) {
        // For secret variables, encrypt the value using our encryption utility
        const storedValue = isSecret 
          ? await encryptValue(value)
          : value;
          
        variablesObject[key.trim()] = storedValue;
      }
    }

    // Special handling for global environment
    if (editingEnvironment && editingEnvironment.id === 'global') {
      // Find if there's already a global environment in the list
      const existingGlobal = environments.find(env => env.id === 'global');
      
      const globalEnv: Environment = {
        id: 'global',
        name: 'Global Environment',
        variables: variablesObject,
      };
      
      if (existingGlobal) {
        onUpdateEnvironment(globalEnv);
      } else {
        onAddEnvironment(globalEnv);
      }
      
      closeEnvModal();
      return;
    }

    const environment: Environment = {
      id: editingEnvironment ? editingEnvironment.id : crypto.randomUUID(),
      name: environmentName.trim(),
      variables: variablesObject,
    };

    if (editingEnvironment) {
      onUpdateEnvironment(environment);
    } else {
      onAddEnvironment(environment);
    }

    closeEnvModal();
  };

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '', isSecret: false }]);
  };

  const handleRemoveVariable = (index: number) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables.length > 0 ? newVariables : [{ key: '', value: '', isSecret: false }]);
  };

  const handleVariableChange = (index: number, field: 'key' | 'value' | 'isSecret', value: string | boolean) => {
    const newVariables = [...variables];
    if (field === 'isSecret' && typeof value === 'boolean') {
      newVariables[index].isSecret = value;
    } else if ((field === 'key' || field === 'value') && typeof value === 'string') {
      newVariables[index][field] = value;
    }
    setVariables(newVariables);
  };

  // Handle copying to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 600);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Format raw text
  const formatRawText = useCallback(() => {
    if (!response) return null;

    try {
      // For massive responses, don't attempt JSON formatting or pretty-printing
      if (isMassiveResponse) {
        return (
          <div
            ref={containerRef}
            style={{
              height: '100%',
              overflow: 'auto',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              padding: '8px',
              fontSize: '13px',
            }}
          >
            {typeof response.data === 'string'
              ? response.data
              : JSON.stringify(response.data, null, isRawMode ? undefined : 2)}
          </div>
        );
      }

      // For large but not massive responses, use line-by-line virtualization
      const plainText =
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data, null, isRawMode ? undefined : 2);

      const lines = plainText.split('\n');
      setTotalLines(lines.length);

      return null;
    } catch (error) {
      console.error('Error formatting raw text:', error);
      return (
        <div style={{ color: 'red', padding: '20px' }}>
          Error formatting response. The response may be too large to display.
        </div>
      );
    }
  }, [response, isMassiveResponse, isRawMode, containerRef]);

  // Toggle format handler
  const toggleFormat = useCallback(() => {
    setIsPrettyFormat((prev) => !prev);
  }, []);

  // Toggle plain text view
  const togglePlainTextView = useCallback(() => {
    setIsPlainTextView((prev) => !prev);
  }, []);

  // Toggle between raw text and formatted JSON
  const toggleRawMode = useCallback(() => {
    setIsRawMode((prev) => !prev);
  }, []);

  // Handle scroll events for virtualization
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isLargeResponse) return;

    const { scrollTop, clientHeight } = containerRef.current;

    // Calculate which lines are visible based on scroll position
    const lineHeight = 20; // Approximate line height in pixels
    const startLine = Math.floor(scrollTop / lineHeight);
    const visibleLines = Math.ceil(clientHeight / lineHeight);
    const endLine = startLine + visibleLines;

    // Only update if the visible range has changed significantly
    if (
      Math.abs(startLine - visibleRange.start) > 20 ||
      Math.abs(endLine - visibleRange.end) > 20
    ) {
      setVisibleRange({
        start: startLine,
        end: endLine + VIRTUALIZED_CHUNK_SIZE,
      });
    }
  }, [isLargeResponse, visibleRange]);

  // Add event listener for scroll
  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef && isLargeResponse) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => {
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
    return undefined;
  }, [isLargeResponse, handleScroll]);

  // Determine if response is large
  useEffect(() => {
    if (!response) return;

    if (response.size > MASSIVE_RESPONSE_THRESHOLD) {
      // For extremely large responses, force raw text view and disable pretty formatting
      setIsLargeResponse(true);
      setIsVeryLargeResponse(true);
      setIsMassiveResponse(true);
      setShowFullResponse(false);
      setIsPlainTextView(true);
      setIsRawMode(true); // Force raw mode for massive responses
    } else if (response.size > VERY_LARGE_RESPONSE_THRESHOLD) {
      setIsLargeResponse(true);
      setIsVeryLargeResponse(true);
      setIsMassiveResponse(false);
      setShowFullResponse(false);
      setIsPlainTextView(true);
      setIsRawMode(false);
    } else if (response.size > LARGE_RESPONSE_THRESHOLD) {
      setIsLargeResponse(true);
      setIsVeryLargeResponse(false);
      setIsMassiveResponse(false);
      setShowFullResponse(false);
      setIsPlainTextView(false);
      setIsRawMode(false);
    } else {
      setIsLargeResponse(false);
      setIsVeryLargeResponse(false);
      setIsMassiveResponse(false);
      setShowFullResponse(true);
      setIsPlainTextView(false);
      setIsRawMode(false);
    }

    // Reset items to show when receiving a new response
    setItemsToShow(MAX_ITEMS_TO_RENDER);
    setVisibleRange({ start: 0, end: VIRTUALIZED_CHUNK_SIZE });
  }, [response]);

  // Process response data for virtualized rendering
  useEffect(() => {
    if (!response || !isLargeResponse || isLoading) return;

    // Process the data in chunks to avoid blocking the main thread
    const processData = () => {
      try {
        // For plain text view, just stringify the data and split into lines
        if (isPlainTextView) {
          const plainText = JSON.stringify(response.data, null, 2);
          const lines = plainText.split('\n');
          setTotalLines(lines.length);

          // Only process visible lines plus some buffer
          const buffer = 50; // Extra lines to render above/below visible area
          const start = Math.max(0, visibleRange.start - buffer);
          const end = Math.min(lines.length, visibleRange.end + buffer);

          const visibleLines = lines.slice(start, end).map((line, index) => (
            <div
              key={`line-${start + index + 1}`}
              style={{ display: 'flex', lineHeight: '1.5em' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '30px',
                  textAlign: 'left',
                  paddingLeft: '2px',
                  marginRight: '8px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                  userSelect: 'none',
                }}
              >
                {start + index + 1}
              </span>
              <div>{line}</div>
            </div>
          ));

          setProcessedLines(visibleLines);
        }
      } catch (error) {
        console.error(
          'Error processing response data for virtualization:',
          error,
        );
        // Fallback to plain text view in case of error
        setIsPlainTextView(true);
      }
    };

    // Use requestIdleCallback or setTimeout to avoid blocking the UI
    const idleCallback =
      window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

    const callbackId = idleCallback(processData);

    // Cleanup
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(callbackId as any);
      } else {
        clearTimeout(callbackId as any);
      }
    };
  }, [response, isLargeResponse, visibleRange, isPlainTextView, isLoading]);

  // Handle showing more items
  const handleShowMore = () => {
    setItemsToShow((prev) => prev + MAX_ITEMS_TO_RENDER);
  };

  // Handle showing all (with warning)
  const handleShowAll = () => {
    // Show warning before enabling full view for very large responses
    if (response && response.size > 1000000) {
      if (
        !window.confirm(
          'Warning: Showing the full response may cause performance issues or crash the application. Continue anyway?',
        )
      ) {
        return;
      }
    }

    // Reset state and enable full view
    setShowFullResponse(true);
  };

  // Handle the generate types button
  const handleGenerateTypes = () => {
    if (!response || !response.data) return;
    
    try {
      const typeScript = generateTypeScript(response.data);
      setGeneratedTypes(typeScript);
      setShowTypesModal(true);
    } catch (err) {
      console.error('Failed to generate TypeScript types:', err);
    }
  };

  // Find the current environment
  const currentEnvironment = environments.find(env => env.id === currentEnvironmentId);

  // Render environment selector
  const renderEnvironmentSelector = () => {
    return (
      <EnvSelectorContainer ref={envDropdownRef}>
        <EnvSelectorButton onClick={() => setShowEnvDropdown(!showEnvDropdown)}>
          <FaGlobeAmericas size={14} style={{ color: '#FF385C' }} />
          <span style={{ flex: 1 }}>{currentEnvironment ? currentEnvironment.name : 'Global Environment'}</span>
          <FaChevronDown size={10} style={{ opacity: 0.75, color: 'rgba(235, 238, 248, 0.85)' }} />
        </EnvSelectorButton>
        
        <EnvDropdown isOpen={showEnvDropdown}>
          <EnvDropdownHeader>
            <span>Environments</span>
          </EnvDropdownHeader>
          
          <EnvDropdownItem 
            active={currentEnvironmentId === null}
            onClick={() => {
              onSelectEnvironment(null);
              setShowEnvDropdown(false);
            }}
          >
            <FaGlobeAmericas size={14} />
            Global Environment
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEnvModal('global');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'rgba(231, 235, 247, 0.72)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Edit global environment"
              >
                <FaEdit size={14} />
              </button>
            </div>
          </EnvDropdownItem>
          
          {environments.map(env => (
            <EnvDropdownItem
              key={env.id}
              active={currentEnvironmentId === env.id}
              onClick={() => {
                onSelectEnvironment(env.id);
                setShowEnvDropdown(false);
              }}
            >
              <FaGlobeAmericas size={14} />
              {env.name}
              <span style={{ 
                fontSize: '10px', 
                color: 'rgba(219, 223, 238, 0.72)', 
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                padding: '1px 6px',
                borderRadius: '10px',
                marginLeft: 'auto',
                marginRight: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {Object.keys(env.variables).length} {Object.keys(env.variables).length === 1 ? 'var' : 'vars'}
                {Object.values(env.variables).filter(v => typeof v === 'string' && v.startsWith('encrypted:')).length > 0 && (
                  <>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <FaLock size={8} color="#FF385C" />
                    {Object.values(env.variables).filter(v => typeof v === 'string' && v.startsWith('encrypted:')).length}
                  </>
                )}
              </span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEnvModal(env);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'rgba(231, 235, 247, 0.72)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Edit environment"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete the "${env.name}" environment?`)) {
                      onDeleteEnvironment(env.id);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'rgba(255, 120, 155, 0.86)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Delete environment"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </EnvDropdownItem>
          ))}
          
          <EnvDropdownActions>
            <EnvActionButton onClick={() => openEnvModal()}>
              Create Environment
            </EnvActionButton>
          </EnvDropdownActions>
        </EnvDropdown>
      </EnvSelectorContainer>
    );
  };

  // Render environment modal
  const renderEnvironmentModal = () => {
    if (!showEnvModal) return null;
    
    return (
      <Modal onClick={closeEnvModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {editingEnvironment ? `Edit "${editingEnvironment.name}"` : 'New Environment'}
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label htmlFor="env-name">Environment Name</Label>
              <Input
                id="env-name"
                type="text"
                value={environmentName}
                onChange={(e) => setEnvironmentName(e.target.value)}
                placeholder="e.g., Development, Production, etc."
                autoFocus
              />
            </FormGroup>

            <FormGroup>
              <Label>Variables</Label>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>Name</div>
                <div style={{ flex: 1 }}>Value</div>
                <div style={{ width: '80px', textAlign: 'center' }}>Actions</div>
              </div>
              <VariablesContainer>
                {variables.map((variable, index) => (
                  <VariableRow key={index}>
                    <Input
                      type="text"
                      value={variable.key}
                      onChange={(e) =>
                        handleVariableChange(index, 'key', e.target.value)
                      }
                      placeholder="Variable name"
                      style={{ flex: 1 }}
                    />
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Input
                        type={variable.isSecret && !visibleSecrets[index] ? 'password' : 'text'}
                        value={variable.value}
                        onChange={(e) =>
                          handleVariableChange(index, 'value', e.target.value)
                        }
                        placeholder="Value"
                        style={{ 
                          width: '100%',
                          paddingRight: variable.isSecret ? '30px' : '12px' 
                        }}
                      />
                      {variable.isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(index)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            cursor: 'pointer',
                            padding: '4px',
                            zIndex: 5
                          }}
                          title={visibleSecrets[index] ? "Hide value" : "Show value"}
                        >
                          {visibleSecrets[index] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', width: '80px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => toggleSecretStatus(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: variable.isSecret ? '#FF385C' : '#999',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                        }}
                        title={variable.isSecret 
                          ? "This variable is marked as secret - values are encrypted and masked by default for security" 
                          : "Click to mark as secret - secret variables are encrypted and masked by default to protect sensitive data like API keys and passwords"}
                      >
                        {variable.isSecret ? <FaLock size={14} /> : <FaLockOpen size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariable(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#999',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Remove variable"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </VariableRow>
                ))}
              </VariablesContainer>
              <button
                type="button"
                onClick={handleAddVariable}
                style={{
                  background: 'none',
                  border: '1px dashed #555',
                  color: '#bbb',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  marginTop: '8px',
                  width: '100%',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                + Add Variable
              </button>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <CancelButton onClick={closeEnvModal}>Cancel</CancelButton>
            <SaveButton onClick={handleSaveEnvironment}>
              {editingEnvironment ? 'Update' : 'Create'} Environment
            </SaveButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // Render headers tab content
  const renderHeadersContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <FaSpinner
            style={{
              fontSize: '32px',
              marginBottom: '16px',
              opacity: 0.7,
              animation: 'spin 1.5s linear infinite',
            }}
          />
          <div>Loading response...</div>
        </div>
      );
    }

    if (!response) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #333',
            padding: '10px 15px',
            backgroundColor: '#1e1e1e',
          }}
        >
          <div style={{ width: '30%', fontWeight: 'bold', color: '#8a94a6' }}>
            NAME
          </div>
          <div style={{ width: '70%', fontWeight: 'bold', color: '#8a94a6' }}>
            VALUE
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {Object.entries(response.headers || {}).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                borderBottom: '1px solid #222',
                padding: '15px',
              }}
            >
              <div
                style={{ width: '30%', color: '#e0e0e0', fontWeight: 'bold' }}
              >
                {key}
              </div>
              <div style={{ width: '70%', color: '#e0e0e0' }}>
                {typeof value === 'string' ? value : String(value)}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            padding: '10px',
            textAlign: 'right',
            borderTop: '1px solid #333',
          }}
        >
          <CopyButton
            onClick={() => {
              const headerText = Object.entries(response.headers || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
              handleCopy(headerText);
            }}
          />
        </div>
      </div>
    );
  };

  // Render cookies tab content
  const renderCookiesContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <FaSpinner
            style={{
              fontSize: '32px',
              marginBottom: '16px',
              opacity: 0.7,
              animation: 'spin 1.5s linear infinite',
            }}
          />
          <div>Loading response...</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #333',
            padding: '10px 15px',
            backgroundColor: '#1e1e1e',
          }}
        >
          <div style={{ width: '30%', fontWeight: 'bold', color: '#8a94a6' }}>
            NAME
          </div>
          <div style={{ width: '70%', fontWeight: 'bold', color: '#8a94a6' }}>
            VALUE
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '15px', color: '#999', textAlign: 'center' }}>
            No cookies found
          </div>
        </div>
        <div
          style={{
            padding: '10px',
            textAlign: 'right',
            borderTop: '1px solid #333',
          }}
        >
          <button
            type="button"
            style={{
              background: '#2a2a2a',
              color: '#e0e0e0',
              border: '1px solid #444',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
            }}
          >
            Manage Cookies
          </button>
        </div>
      </div>
    );
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    if (isLoading) {
      return <SpaceLoadingAnimation />;
    }

    if (!response) {
      return <NoResponseMessage />;
    }
    
    // Show different screens for different HTTP status codes
    if (response.status === 404) {
      return <NotFoundScreen />;
    }
    
    if (response.status >= 500 && response.status < 600) {
      return <ServerErrorScreen />;
    }

    switch (activeTab) {
      case 'body':
        return (
          <ResponseContent
            response={response}
            activeTab={activeTab}
            isLargeResponse={isLargeResponse}
            isVeryLargeResponse={isVeryLargeResponse}
            isMassiveResponse={isMassiveResponse}
            isPrettyFormat={isPrettyFormat}
            isPlainTextView={isPlainTextView}
            isRawMode={isRawMode}
            showFullResponse={showFullResponse}
            itemsToShow={itemsToShow}
            visibleRange={visibleRange}
            processedLines={processedLines}
            totalLines={totalLines}
            containerRef={containerRef}
            getSafeResponseData={(data, isFullView) =>
              getSafeResponseData(
                data,
                isFullView,
                isVeryLargeResponse,
                itemsToShow,
              )
            }
            handleCopy={handleCopy}
            toggleRawMode={toggleRawMode}
            togglePlainTextView={togglePlainTextView}
            handleShowMore={handleShowMore}
            handleShowAll={handleShowAll}
            setShowFullResponse={setShowFullResponse}
            isLoading={isLoading}
          />
        );
      case 'headers':
        return renderHeadersContent();
      case 'cookies':
        return renderCookiesContent();
      case 'security':
        if (isLoading) {
          return (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <FaSpinner
                style={{
                  fontSize: '32px',
                  marginBottom: '16px',
                  opacity: 0.7,
                  animation: 'spin 1.5s linear infinite',
                }}
              />
              <div>Loading response...</div>
            </div>
          );
        }
        return <SecurityAuditPanel request={request || null} response={response} />;
      default:
        return null;
    }
  };

  // Get HTTP status text
  const getStatusText = (status: number): string => {
    // Specific status codes
    switch (status) {
      // 2xx Success
      case 200: return 'OK';
      case 201: return 'Created';
      case 204: return 'No Content';
      
      // 3xx Redirection
      case 301: return 'Moved Permanently';
      case 302: return 'Found';
      case 304: return 'Not Modified';
      
      // 4xx Client Errors
      case 400: return 'Bad Request';
      case 401: return 'Unauthorized';
      case 403: return 'Forbidden';
      case 404: return 'Not Found';
      case 405: return 'Method Not Allowed';
      case 409: return 'Conflict';
      case 422: return 'Unprocessable Entity';
      case 429: return 'Too Many Requests';
      
      // 5xx Server Errors
      case 500: return 'Internal Server Error';
      case 502: return 'Bad Gateway';
      case 503: return 'Service Unavailable';
      case 504: return 'Gateway Timeout';
    }
    
    // Generic ranges
    if (status >= 200 && status < 300) return 'OK';
    if (status >= 300 && status < 400) return 'Redirect';
    if (status >= 400 && status < 500) return 'Client Error';
    if (status >= 500) return 'Server Error';
    return 'Unknown';
  };

  // Add a function to get a more descriptive status message
  const getDescriptiveStatus = (response: ApiResponse): React.ReactNode => {
    if (response.status === 0) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Connection Failed
        </span>
      );
    }
    return (
      <>
        {response.status} {getStatusText(response.status)}
      </>
    );
  };

  // Add a function to toggle the secret status
  const toggleSecretStatus = (index: number) => {
    const newVariables = [...variables];
    newVariables[index].isSecret = !newVariables[index].isSecret;
    setVariables(newVariables);
  };

  return (
    <ResponseContainer>
      <TypeScriptModal 
        isOpen={showTypesModal} 
        onClose={() => setShowTypesModal(false)} 
        typeScript={generatedTypes} 
      />
      {renderEnvironmentModal()}
      <ResponseHeader>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaSpinner
              style={{
                animation: 'spin 1.5s linear infinite',
              }}
            />
            <span>Loading...</span>
          </div>
        ) : response ? (
          <>
            <StatusPill
              success={response.status >= 200 && response.status < 300}
            >
              {getDescriptiveStatus(response)}
            </StatusPill>
            <ResponseMetric>{response.time} ms</ResponseMetric>
            <ResponseMetric>{formatBytes(response.size)}</ResponseMetric>
          </>
        ) : (
          <StatusPill success={false}>No Response</StatusPill>
        )}
        {renderEnvironmentSelector()}
      </ResponseHeader>

      <ResponseTabs>
        <ResponseTab
          active={activeTab === 'body'}
          data-active={activeTab === 'body'}
          onClick={() => setActiveTab('body')}
        >
          Body
        </ResponseTab>
        <ResponseTab
          active={activeTab === 'headers'}
          data-active={activeTab === 'headers'}
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </ResponseTab>
        <ResponseTab
          active={activeTab === 'cookies'}
          data-active={activeTab === 'cookies'}
          onClick={() => setActiveTab('cookies')}
        >
          Cookies
        </ResponseTab>
        {/* <ResponseTab
          active={activeTab === 'security'}
          data-active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
        >
          Security
        </ResponseTab> */}
        {response && !isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: 'auto',
              paddingRight: '8px',
            }}
          >
            {!isMassiveResponse && !isVeryLargeResponse && (
              <ResponseSettingsButton
                onClick={toggleFormat}
                title={
                  isPrettyFormat ? 'View Simple Format' : 'View Pretty Format'
                }
              >
                {isPrettyFormat ? <FaCode /> : <FaMagic />}
              </ResponseSettingsButton>
            )}

            {isLargeResponse && (
              <ResponseSettingsButton
                onClick={toggleRawMode}
                title={isRawMode ? 'View Indented JSON' : 'View Compact JSON'}
              >
                <FaCode />
              </ResponseSettingsButton>
            )}

            <ResponseSettingsButton
              onClick={handleGenerateTypes}
              title="Generate TypeScript Types"
              style={{
                transition: 'all 0.3s ease',
              }}
            >
              <FaFileCode />
            </ResponseSettingsButton>

            <ResponseSettingsButton
              onClick={() => handleCopy(JSON.stringify(response.data, null, 2))}
              title={copied ? 'Copied!' : 'Copy Response'}
              style={{
                background: copied ? 'rgba(255, 56, 92, 0.2)' : undefined,
                borderColor: copied ? 'rgba(255, 118, 154, 0.56)' : undefined,
                transition: 'all 0.2s ease',
                transform: copied ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              <FaCopy color={copied ? '#ff7eb9' : undefined} />
            </ResponseSettingsButton>
            <ResponseSettingsButton
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(response.data, null, 2)],
                  { type: 'application/json' },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'response.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Download Response"
            >
              <FaDownload />
            </ResponseSettingsButton>
          </div>
        )}
      </ResponseTabs>

      <TabContent>
        <ResponseBody>{renderTabContent()}</ResponseBody>
      </TabContent>
      <style>{`
        .json-with-line-numbers {
          font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          border-radius: 4px;
          padding: 0;
          overflow: auto;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(5px); }
          20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: twinkle 2s infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        
        /* Black hole styles for 404 */
        .black-hole {
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(18,18,18,1) 0%, rgba(18,18,18,0.7) 50%, rgba(18,18,18,0) 100%);
          box-shadow: 0 0 20px 5px rgba(255, 56, 92, 0.2);
          animation: pulse-hole 6s ease-in-out infinite;
          opacity: 0.6;
          z-index: 1;
        }
        @keyframes pulse-hole {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px 5px rgba(255, 56, 92, 0.2); }
          50% { transform: scale(1.1); box-shadow: 0 0 25px 8px rgba(255, 56, 92, 0.3); }
        }
        
        /* Improved Meteor shower styles for 500 error */
        .meteor {
          position: absolute;
          background: linear-gradient(to bottom, rgba(255, 56, 92, 0), rgba(255, 56, 92, 0.7));
          transform: rotate(25deg);
          animation: meteor-fall 2s linear infinite;
          z-index: 1;
          border-radius: 100px 0px;
        }
        @keyframes meteor-fall {
          0% { transform: translateX(-10px) translateY(-10px) rotate(25deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(350px) translateY(350px) rotate(25deg); opacity: 0; }
        }
        
        /* Improved spaceship animation */
        @keyframes spaceship-drift {
          0%, 100% { transform: translateY(0) rotate(90deg); }
          25% { transform: translateY(-8px) rotate(92deg); }
          50% { transform: translateY(0) rotate(90deg); }
          75% { transform: translateY(8px) rotate(88deg); }
        }
        
        /* Engine flame effect */
        .engine-flame {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 15px;
          background: linear-gradient(to bottom, #FF385C, rgba(255, 56, 92, 0.1));
          border-radius: 0 0 10px 10px;
          animation: flame 0.5s alternate infinite;
        }
        @keyframes flame {
          0% { height: 10px; opacity: 0.8; }
          100% { height: 15px; opacity: 1; }
        }
        
        /* Terminal styling for error code */
        .error-terminal {
          background-color: #1a1a1a;
          border-radius: 6px;
          width: 300px;
          overflow: hidden;
          margin-top: 10px;
          border: 1px solid #333;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          z-index: 2;
        }
        .terminal-header {
          background-color: #333;
          padding: 5px 10px;
          display: flex;
        }
        .terminal-title {
          color: #ddd;
          font-size: 12px;
        }
        .terminal-body {
          padding: 10px;
          font-family: monospace;
          font-size: 13px;
          color: #ddd;
          text-align: left;
        }
        .terminal-prompt {
          color: #FF385C;
          margin-right: 8px;
        }
        .terminal-text {
          color: #ccc;
          margin-right: 8px;
        }
        .terminal-error-code {
          color: #FF385C;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* Improved Space loading animation styles */
        .space-backdrop {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 56, 92, 0.05) 0%, rgba(255, 56, 92, 0.02) 40%, rgba(0, 0, 0, 0) 70%);
          border-radius: 50%;
          z-index: 1;
        }
        
        .loading-stars .star {
          background-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
        }
        
        .parallax-stars {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 1;
        }
        
        .parallax-star {
          position: absolute;
          width: 1px;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: parallax 60s linear infinite;
        }
        
        @keyframes parallax {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100px); }
        }
        
        .space-loading-scene {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 30px;
          z-index: 5;
        }
        
        .planet {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          z-index: 3;
          overflow: visible;
        }
        
        .planet-surface {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        .planet-shadow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%);
          z-index: 2;
        }
        
        .orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          z-index: 1;
        }
        
        .orbit-1 {
          width: 90px;
          height: 90px;
          animation: orbit-rotation 50s linear infinite;
        }
        
        .orbit-2 {
          width: 130px;
          height: 70px;
          transform: translate(-50%, -50%) rotate(20deg);
          border-color: rgba(255, 255, 255, 0.07);
        }
        
        @keyframes orbit-rotation {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .satellite-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          animation: satellite-orbit 8s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
          z-index: 2;
        }
        
        .satellite {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          color: #FF385C;
          animation: satellite-tilt 8s ease-in-out infinite;
          filter: drop-shadow(0 0 2px rgba(255, 56, 92, 0.5));
        }
        
        @keyframes satellite-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes satellite-tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        
        .launch-pad {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 5px;
          z-index: 2;
        }
        
        .launch-stand-left, .launch-stand-right {
          position: absolute;
          bottom: 0;
          width: 3px;
          height: 15px;
          background-color: #555;
          transform-origin: bottom center;
        }
        
        .launch-stand-left {
          left: 8px;
          transform: rotate(-10deg);
        }
        
        .launch-stand-right {
          right: 8px;
          transform: rotate(10deg);
        }
        
        .rocket-wrapper {
          position: absolute;
          left: 50%;
          bottom: 35px;
          transform: translateX(-50%);
          z-index: 10;
          animation: prepare-launch 1s ease-in-out infinite alternate;
        }
        
        @keyframes prepare-launch {
          0% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(-2px); }
        }
        
        .rocket {
          position: relative;
          animation: launch 4s cubic-bezier(0.23, 1, 0.32, 1) infinite;
          transform-origin: bottom center;
        }
        
        .rocket-body {
          position: relative;
          z-index: 10;
        }
        
        .rocket-icon {
          color: #FF385C;
          font-size: 30px;
          transform: rotate(-45deg);
          filter: drop-shadow(0 0 5px rgba(255, 56, 92, 0.5));
        }
        
        .rocket-exhaust {
          position: absolute;
          bottom: 6px;
          left: 14px;
          transform: rotate(45deg);
          z-index: 1;
        }
        
        .rocket-flame {
          width: 8px;
          height: 12px;
          background: linear-gradient(to bottom, #FF385C, rgba(255, 255, 255, 0.7), rgba(255, 56, 92, 0));
          border-radius: 0 0 4px 4px;
          animation: rocket-flame 0.1s ease-out alternate infinite;
          transform-origin: top center;
        }
        
        .rocket-smoke {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          z-index: -1;
        }
        
        .rocket-smoke::before,
        .rocket-smoke::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 10px;
          height: 10px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: smoke 2s ease-out infinite;
          opacity: 0;
        }
        
        .rocket-smoke::before {
          left: -8px;
          animation-delay: 0.2s;
        }
        
        .rocket-smoke::after {
          left: 2px;
          animation-delay: 0.7s;
        }
        
        @keyframes smoke {
          0% { transform: translateY(0) scale(0.2); opacity: 0.5; }
          100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
        }
        
        @keyframes launch {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          20% { transform: translateY(0) scale(1); opacity: 1; }
          30% { transform: translateY(-10px) scale(1); opacity: 1; }
          90% { transform: translateY(-180px) scale(0.6); opacity: 0.2; }
          100% { transform: translateY(-180px) scale(0.5); opacity: 0; }
        }
        
        @keyframes rocket-flame {
          0% { height: 12px; opacity: 0.7; transform: scaleX(1); }
          100% { height: 20px; opacity: 1; transform: scaleX(0.8); }
        }
        
        .loading-progress {
          margin-top: 20px;
          position: relative;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .loading-dots {
          display: flex;
          gap: 5px;
        }
        
        .loading-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: rgba(255, 56, 92, 0.5);
          border-radius: 50%;
          animation: loading-dots 1.4s infinite ease-in-out both;
        }
        
        .loading-dot:nth-child(1) { animation-delay: 0s; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes loading-dots {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        
        .loading-text {
          font-size: 14px;
          letter-spacing: 0.5px;
          font-weight: 300;
          color: #aaa;
        }
      `}</style>
    </ResponseContainer>
  );
}

export default ResponsePanel;
