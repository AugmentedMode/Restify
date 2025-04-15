import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, 
  FaPalette, 
  FaGlobe, 
  FaKeyboard, 
  FaShieldAlt, 
  FaFileExport, 
  FaInfoCircle,
  FaCheck,
  FaMoon,
  FaSun,
  FaArrowLeft,
  FaTrash,
  FaFileImport,
  FaRobot,
  FaKey,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaGithub,
  FaUser,
  FaLink,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCopy,
  FaLock,
  FaExclamationTriangle,
  FaUsers,
  FaCode,
  FaStar,
  FaExternalLinkAlt,
  FaUserSecret
} from 'react-icons/fa';
import { useSettings } from '../../utils/SettingsContext';
import { db, NotesService, CollectionsService, HistoryService, ResponsesService, EnvironmentsService, SettingsService } from '../../services/DatabaseService';
import ImportFileModal from '../modals/ImportFileModal';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import { ImportService } from '../../services/ImportService';
import aiService from '../../services/AIService';
import githubService, { GitHubService } from '../../services/GitHubService';

// Theme colors for consistency
const theme = {
  background: {
    primary: '#121212',
    secondary: '#1a1a1a',
    tertiary: '#222222',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    ultraLight: 'rgba(255, 255, 255, 0.05)',
  },
  text: {
    primary: '#e0e0e0',
    secondary: '#aaa',
    bright: '#fff',
  },
  brand: {
    primary: '#FF385C',
    hover: '#E0314F',
  },
  controls: {
    inactive: '#444',
  }
};

// Define setting categories
type SettingCategory = 'general' | 'api' | 'security' | 'shortcuts' | 'export' | 'about' | 'ai';

// Define settings types
interface GeneralSettings {
  showCollections: boolean;
  showHistory: boolean;
  showSecretsManager: boolean;
  showBoards: boolean;
  showNotes: boolean;
  defaultResponseView: string;
  showGitHub: boolean;
}

interface ApiSettings {
  defaultTimeout: number;
  followRedirects: boolean;
  validateSSL: boolean;
}

interface SecuritySettings {
  clearHistoryOnExit: boolean;
  storeCredentialsSecurely: boolean;
  storeGitHubToken: boolean;
}

interface AppSettings {
  general: GeneralSettings;
  api: ApiSettings;
  security: SecuritySettings;
}

// Define styled components for the settings UI
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${theme.background.primary};
  color: ${theme.text.primary};
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid ${theme.border.light};
  background-color: ${theme.background.secondary};
`;

const SettingsTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${theme.text.bright};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.text.secondary};
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background-color: ${theme.border.light};
    color: ${theme.brand.primary};
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.text.secondary};
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  margin-right: 10px;
  
  &:hover {
    background-color: ${theme.border.light};
    color: ${theme.brand.primary};
  }
`;

const SettingsContent = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const SettingsSidebar = styled.div`
  width: 220px;
  border-right: 1px solid ${theme.border.light};
  padding: 20px 0;
  overflow-y: auto;
  background-color: ${theme.background.secondary};
`;

const CategoryItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  color: ${props => props.active ? theme.brand.primary : theme.text.primary};
  background-color: ${props => props.active ? 'rgba(255, 56, 92, 0.15)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(255, 56, 92, 0.15)' : theme.border.ultraLight};
  }
`;

const CategoryIcon = styled.div`
  margin-right: 10px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const SettingsPanel = styled.div`
  flex-grow: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: ${theme.background.primary};
`;

const SettingSection = styled.div`
  margin-bottom: 40px;
  max-width: 800px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: ${theme.text.bright};
  padding-bottom: 10px;
  border-bottom: 1px solid ${theme.border.light};
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid ${theme.border.ultraLight};
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.text.primary};
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: ${theme.text.secondary};
  margin-top: 4px;
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  width: 50px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.isActive ? theme.brand.primary : theme.controls.inactive};
  position: relative;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.isActive ? '28px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    transition: left 0.3s;
  }
`;

const SelectInput = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${theme.controls.inactive};
  background-color: ${theme.background.tertiary};
  color: ${theme.text.primary};
  font-size: 14px;
  width: 180px;
  
  &:focus {
    border-color: ${theme.brand.primary};
    outline: none;
  }
  
  option {
    background-color: ${theme.background.tertiary};
    color: ${theme.text.primary};
  }
`;

const ShortcutRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${theme.border.ultraLight};
`;

const ShortcutKey = styled.div`
  background-color: ${theme.background.tertiary};
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  border: 1px solid ${theme.controls.inactive};
  margin-left: 8px;
  color: ${theme.text.primary};
`;

const ShortcutKeysContainer = styled.div`
  display: flex;
  align-items: center;
  
  span {
    margin: 0 4px;
    color: ${theme.text.secondary};
  }
`;

const AboutVersion = styled.div`
  font-size: 14px;
  margin-bottom: 20px;
  color: ${theme.text.secondary};
`;

const AboutLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const AboutLink = styled.a`
  color: ${theme.brand.primary};
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const LinkButton = styled.a`
  color: ${theme.brand.primary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-right: 6px;
  }
`;

const ActionButton = styled.button`
  background-color: ${theme.brand.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${theme.brand.hover};
  }
`;

// TextInput component for API keys and other text fields
const TextInput = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${theme.controls.inactive};
  background-color: ${theme.background.tertiary};
  color: ${theme.text.primary};
  font-size: 14px;
  width: 300px;
  
  &:focus {
    border-color: ${theme.brand.primary};
    outline: none;
  }
`;

// Password input specifically for API keys
const PasswordInput = styled(TextInput).attrs({ type: 'password' })`
  font-family: monospace;
`;

const GitHubTokenField = styled(PasswordInput)`
  font-family: monospace;
  letter-spacing: 1px;
`;

const GitHubTokenSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${theme.border.light};
`;

const MaskedToken = styled.div`
  font-family: monospace;
  font-size: 14px;
  letter-spacing: 1px;
  color: ${theme.text.secondary};
  background-color: ${theme.background.tertiary};
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid ${theme.controls.inactive};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TokenActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
`;

const ConnectionStatus = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 8px;
  color: ${props => props.connected ? '#2da44e' : theme.text.secondary};
`;

// Add these new styled components for the GitHub profile section
const GitHubProfileSection = styled.div`
  margin-top: 24px;
  padding: 24px;
  background-color: ${theme.background.secondary};
  border-radius: 12px;
  border: 1px solid ${theme.border.light};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${theme.brand.primary};
  box-shadow: 0 3px 8px rgba(255, 56, 92, 0.2);
`;

const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${theme.background.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.text.secondary};
  font-size: 32px;
  border: 3px solid ${theme.border.light};
`;

const VerifiedBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #2da44e;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid ${theme.background.secondary};
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: ${theme.text.bright};
`;

const ProfileLogin = styled.div`
  color: ${theme.text.secondary};
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 12px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${theme.text.secondary};
  font-size: 13px;
`;

const ConnectionButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  @media (max-width: 600px) {
    margin-top: 12px;
    width: 100%;
  }
`;

const ProfileButton = styled.button`
  background-color: transparent;
  border: 1px solid ${theme.border.light};
  color: ${theme.text.primary};
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: ${theme.text.secondary};
  }
`;

const ConnectionButton = styled(ProfileButton)<{ variant?: 'primary' | 'danger' }>`
  background-color: ${props => props.variant === 'primary' ? theme.brand.primary : 
                              props.variant === 'danger' ? 'rgba(255, 56, 92, 0.1)' : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : 
                    props.variant === 'danger' ? theme.brand.primary : theme.text.primary};
  border-color: ${props => props.variant === 'primary' ? theme.brand.primary : 
                           props.variant === 'danger' ? theme.brand.primary : theme.border.light};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? theme.brand.hover : 
                                 props.variant === 'danger' ? 'rgba(255, 56, 92, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    transform: ${props => props.variant === 'primary' ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.variant === 'primary' ? '0 4px 8px rgba(255, 56, 92, 0.25)' : 'none'};
  }
  
  &:active {
    transform: ${props => props.variant === 'primary' ? 'translateY(0)' : 'none'};
  }
`;

const ProfileSectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${theme.text.bright};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DangerZone = styled.div`
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(255, 56, 92, 0.05);
  border: 1px solid rgba(255, 56, 92, 0.2);
`;

const TokenManagementSection = styled.div`
  margin-top: 20px;
`;

const TokenDisplay = styled.div`
  position: relative;
  background-color: ${theme.background.tertiary};
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
  border: 1px solid ${theme.border.light};
  font-family: monospace;
  font-size: 14px;
  letter-spacing: 1px;
  color: ${theme.text.secondary};
  word-break: break-all;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.4);
  color: ${theme.text.primary};
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
    color: ${theme.brand.primary};
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: ${theme.background.secondary};
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${theme.text.bright};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.text.secondary};
  cursor: pointer;
  font-size: 18px;
  display: flex;
  
  &:hover {
    color: ${theme.brand.primary};
  }
`;

const ModalContent = styled.div`
  margin-bottom: 24px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

// Add loading spinner style
const LoadingSpinner = styled.span`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
`;

// Add loading spinner style
interface SettingsManagerProps {
  onReturn: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ onReturn }) => {
  // Get tab from URL search params if available
  const [activeCategory, setActiveCategory] = useState<SettingCategory>(() => {
    // If URL has a tab parameter, use it
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      
      // Check if the tab param is a valid category
      if (tabParam && ['general', 'api', 'security', 'shortcuts', 'export', 'about', 'ai'].includes(tabParam)) {
        return tabParam as SettingCategory;
      }
    }
    
    // Default to general if no valid tab param
    return 'general';
  });
  
  // State for modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // State for GitHub token input and profile
  const [githubToken, setGithubToken] = useState('');
  const [showGitHubToken, setShowGitHubToken] = useState(false);
  const [showDeleteTokenModal, setShowDeleteTokenModal] = useState(false);
  const [githubProfile, setGithubProfile] = useState<any>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Use settings context instead of local state
  const { settings, updateSettings, toggleSetting, setGitHubToken, clearGitHubToken } = useSettings();
  
  // Update select input settings
  const updateSelectSetting = <T extends keyof typeof settings>(
    category: T, 
    setting: keyof typeof settings[T] & string, 
    value: string | number
  ) => {
    updateSettings(category, setting, value);
  };
  
  // Handle file import
  const handleImportFile = (fileContent: string, fileName: string) => {
    try {
      // Use the ImportService to process the file
      const importedCollection = ImportService.importFromFile(fileContent, fileName);
      
      if (importedCollection) {
        // Save imported collections
        CollectionsService.saveCollection(importedCollection)
          .then(() => {
            alert('Collection imported successfully!');
          })
          .catch(error => {
            console.error('Error saving imported collection:', error);
            alert('Failed to import collection.');
          });
      } else {
        alert('Could not parse the imported file.');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      alert(`Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Export collections
  const handleExportCollections = async () => {
    try {
      const collections = await CollectionsService.getAllCollections();
      
      if (collections.length === 0) {
        alert('No collections to export.');
        return;
      }
      
      // Create a JSON file
      const jsonContent = JSON.stringify(collections, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'restify-collections.json';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting collections:', error);
      alert(`Failed to export collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Export environments
  const handleExportEnvironments = async () => {
    try {
      const environments = await EnvironmentsService.getAllEnvironments();
      
      if (environments.length === 0) {
        alert('No environments to export.');
        return;
      }
      
      // Create a JSON file
      const jsonContent = JSON.stringify(environments, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'restify-environments.json';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting environments:', error);
      alert(`Failed to export environments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle data deletion
  const handleDeleteAllData = async () => {
    try {
      // Clear all IndexedDB database tables
      await db.notes.clear();
      await db.collections.clear();
      await db.requestHistory.clear();
      await db.responses.clear();
      await db.environments.clear();
      await db.settings.clear();
      
      // Clear all localStorage data
      localStorage.clear();
      
      // Also explicitly remove specific items to be sure
      localStorage.removeItem('kanban-todos');
      localStorage.removeItem('api-client-collections');
      localStorage.removeItem('api-client-responses');
      localStorage.removeItem('api-client-history');
      localStorage.removeItem('api-client-environments');
      localStorage.removeItem('api-client-notes');
      localStorage.removeItem('api-client-active-request-id');
      localStorage.removeItem('api-client-current-environment');
      
      // Restore default settings
      const defaultSettings = {
        general: {
          showCollections: true,
          showHistory: true,
          showSecretsManager: true,
          showBoards: true,
          showNotes: true,
          showGitHub: true,
          defaultResponseView: 'pretty',
        },
        api: {
          defaultTimeout: 30000,
          followRedirects: true,
          validateSSL: true,
        },
        security: {
          clearHistoryOnExit: false,
          storeCredentialsSecurely: true,
          storeGitHubToken: true,
        }
      };
      
      // Save default settings back to localStorage
      localStorage.setItem('restifySettings', JSON.stringify(defaultSettings));
      
      alert('All data has been successfully deleted.');
      
      // Reload the application to reflect the changes
      window.location.reload();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert(`Failed to delete all data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Initialize AI service when settings change
  useEffect(() => {
    if (settings.ai.apiKey && settings.ai.provider && settings.ai.model) {
      aiService.initialize({
        provider: settings.ai.provider,
        model: settings.ai.model,
        apiKey: settings.ai.apiKey,
        apiUrl: settings.ai.apiUrl
      });
    }
  }, [settings.ai]);
  
  // Save API key change in a secure way
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings('ai', 'apiKey', e.target.value);
  };
  
  // Fetch GitHub profile data when connected
  useEffect(() => {
    const fetchGitHubProfile = async () => {
      if (settings.github.isConnected && githubService.isInitialized()) {
        try {
          setFetchingProfile(true);
          const userData = await githubService.getCurrentUser();
          setGithubProfile(userData);
        } catch (error) {
          console.error('Failed to fetch GitHub profile:', error);
        } finally {
          setFetchingProfile(false);
        }
      } else {
        setGithubProfile(null);
      }
    };
    
    fetchGitHubProfile();
  }, [settings.github.isConnected]);
  
  // Function to copy token to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  // Function to reveal and fetch the actual token
  const handleRevealToken = async () => {
    if (!showGitHubToken) {
      try {
        // Use the static method from the GitHubService class
        const token = await GitHubService.loadStoredToken();
        if (token) {
          setGithubToken(token);
          setShowGitHubToken(true);
        }
      } catch (error) {
        console.error('Failed to load GitHub token:', error);
      }
    } else {
      setShowGitHubToken(false);
    }
  };
  
  // Function to handle token deletion with confirmation
  const handleDeleteToken = async () => {
    try {
      setFetchingProfile(true);
      
      // Use the context method to clear the token
      await clearGitHubToken();
      
      // Reset local state
      setShowDeleteTokenModal(false);
      setGithubToken('');
      setShowGitHubToken(false);
      setGithubProfile(null);
      
      // Manually dispatch event to ensure all components update
      window.dispatchEvent(new CustomEvent('github-auth-changed', { 
        detail: { authenticated: false } 
      }));
    } catch (error) {
      console.error('Failed to delete GitHub token:', error);
      alert(`Failed to disconnect GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFetchingProfile(false);
    }
  };
  
  // Update the token connection flow to ensure events are properly dispatched
  const handleConnectGitHub = async () => {
    if (!githubToken) {
      alert('Please enter a GitHub token');
      return;
    }
    
    try {
      setFetchingProfile(true);
      
      // Use the context method to set the token which handles all the state updates
      await setGitHubToken(githubToken);
      
      // Clear the input field after successful connection
      setGithubToken('');
      
      // Force refresh of the profile data to ensure UI is synchronized
      const userData = await githubService.getCurrentUser();
      setGithubProfile(userData);
      
      // Manually dispatch event to ensure all components update
      window.dispatchEvent(new CustomEvent('github-auth-changed', { 
        detail: { authenticated: true } 
      }));
    } catch (error) {
      console.error('Failed to set GitHub token:', error);
      alert(`Failed to connect to GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFetchingProfile(false);
    }
  };
  
  // Render sidebar categories
  const renderCategories = () => {
    const categories: { id: SettingCategory; icon: JSX.Element; name: string }[] = [
      { id: 'general', icon: <FaPalette />, name: 'General' },
      { id: 'api', icon: <FaGlobe />, name: 'API' },
      { id: 'ai', icon: <FaRobot />, name: 'AI Assistant' },
      { id: 'security', icon: <FaShieldAlt />, name: 'Security' },
      { id: 'shortcuts', icon: <FaKeyboard />, name: 'Shortcuts' },
      { id: 'export', icon: <FaFileExport />, name: 'Export/Import' },
      { id: 'about', icon: <FaInfoCircle />, name: 'About' },
    ];
    
    return categories.map(category => (
      <CategoryItem 
        key={category.id} 
        active={activeCategory === category.id}
        onClick={() => setActiveCategory(category.id)}
      >
        <CategoryIcon>{category.icon}</CategoryIcon>
        <CategoryName>{category.name}</CategoryName>
      </CategoryItem>
    ));
  };  
  // Render General settings
  const renderGeneralSettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>Sidebar Sections</SectionTitle>
        <SettingRow>
          <div>
            <SettingLabel>Show Collections</SettingLabel>
            <SettingDescription>Show collections section in sidebar</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.general.showCollections}
            onClick={() => toggleSetting('general', 'showCollections')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Show Boards</SettingLabel>
            <SettingDescription>Show kanban boards in sidebar</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.general.showBoards}
            onClick={() => toggleSetting('general', 'showBoards')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Show Secret Manager</SettingLabel>
            <SettingDescription>Show secrets manager in sidebar</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.general.showSecretsManager}
            onClick={() => toggleSetting('general', 'showSecretsManager')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Show Notes</SettingLabel>
            <SettingDescription>Show notes section in sidebar</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.general.showNotes}
            onClick={() => toggleSetting('general', 'showNotes')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Show History</SettingLabel>
            <SettingDescription>Show request history in sidebar</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.general.showHistory}
            onClick={() => toggleSetting('general', 'showHistory')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Show GitHub PRs</SettingLabel>
            <SettingDescription>Show your open GitHub pull requests in sidebar</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.general.showGitHub}
            onClick={() => toggleSetting('general', 'showGitHub')}
          />
        </SettingRow>
      </SettingSection>
    </SettingsPanel>
  );
  
  // Render API default settings
  const renderApiSettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>API Behavior</SectionTitle>
        <SettingRow>
          <div>
            <SettingLabel>Default Timeout (ms)</SettingLabel>
            <SettingDescription>Set the default timeout for API requests</SettingDescription>
          </div>
          <SelectInput 
            value={settings.api.defaultTimeout.toString()}
            onChange={(e) => updateSelectSetting('api', 'defaultTimeout', parseInt(e.target.value))}
          >
            <option value="5000">5000 ms</option>
            <option value="10000">10000 ms</option>
            <option value="30000">30000 ms</option>
            <option value="60000">60000 ms</option>
          </SelectInput>
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Follow Redirects</SettingLabel>
            <SettingDescription>Automatically follow HTTP redirects</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.api.followRedirects}
            onClick={() => toggleSetting('api', 'followRedirects')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Validate SSL Certificates</SettingLabel>
            <SettingDescription>Verify SSL certificates when making HTTPS requests</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.api.validateSSL}
            onClick={() => toggleSetting('api', 'validateSSL')}
          />
        </SettingRow>
      </SettingSection>
    </SettingsPanel>
  );
  
  // Render Security settings
  const renderSecuritySettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>Security Settings</SectionTitle>
        <SettingRow>
          <div>
            <SettingLabel>Store GitHub Token</SettingLabel>
            <SettingDescription>Securely store GitHub personal access token in local storage</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.security.storeGitHubToken}
            onClick={() => toggleSetting('security', 'storeGitHubToken')}
          />
        </SettingRow>

        <GitHubProfileSection>
          {settings.github.isConnected && githubProfile ? (
            <>
              <ProfileHeader>
                <AvatarContainer>
                  <Avatar 
                    src={githubProfile.avatar_url} 
                    alt={`${githubProfile.login}'s avatar`} 
                  />
                  <VerifiedBadge>
                    <FaCheck size={12} />
                  </VerifiedBadge>
                </AvatarContainer>
                
                <ProfileInfo>
                  <ProfileName>{githubProfile.name || githubProfile.login}</ProfileName>
                  <ProfileLogin>
                    <FaGithub size={12} />
                    {githubProfile.login}
                  </ProfileLogin>
                  
                  {githubProfile.bio && (
                    <div style={{ margin: '8px 0', fontSize: '14px', color: theme.text.primary }}>
                      {githubProfile.bio}
                    </div>
                  )}
                  
                  <ProfileStats>
                    {githubProfile.company && (
                      <StatItem>
                        <FaBuilding size={12} />
                        {githubProfile.company}
                      </StatItem>
                    )}
                    {githubProfile.location && (
                      <StatItem>
                        <FaMapMarkerAlt size={12} />
                        {githubProfile.location}
                      </StatItem>
                    )}
                    <StatItem>
                      <FaCalendarAlt size={12} />
                      Joined {new Date(githubProfile.created_at).toLocaleDateString()}
                    </StatItem>
                    {githubProfile.followers !== undefined && (
                      <StatItem>
                        <FaUsers size={12} />
                        {githubProfile.followers} followers
                      </StatItem>
                    )}
                  </ProfileStats>
                </ProfileInfo>
                
                <ConnectionButtonGroup>
                  <ProfileButton 
                    onClick={() => window.open(githubProfile.html_url, '_blank')}
                    aria-label="View GitHub profile"
                  >
                    <FaExternalLinkAlt size={12} />
                    View Profile
                  </ProfileButton>
                </ConnectionButtonGroup>
              </ProfileHeader>
              
              <TokenManagementSection>
                <ProfileSectionTitle>
                  <FaLock size={14} />
                  Personal Access Token
                </ProfileSectionTitle>
                
                <div style={{ fontSize: '14px', marginBottom: '12px', color: theme.text.secondary }}>
                  Your GitHub token is securely stored and encrypted. This token allows the app to access your GitHub data.
                </div>
                
                <TokenDisplay>
                  {showGitHubToken ? githubToken : '••••••••••••••••••••••••••••••••••••••••••••'}
                  {showGitHubToken && (
                    <CopyButton 
                      onClick={() => copyToClipboard(githubToken)}
                      aria-label="Copy token to clipboard"
                      title="Copy to clipboard"
                    >
                      {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
                    </CopyButton>
                  )}
                </TokenDisplay>
                
                <ConnectionButtonGroup>
                  <ConnectionButton 
                    onClick={handleRevealToken}
                    aria-label={showGitHubToken ? "Hide token" : "Show token"}
                  >
                    {showGitHubToken ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    {showGitHubToken ? "Hide Token" : "Reveal Token"}
                  </ConnectionButton>
                  
                  <ConnectionButton 
                    variant="danger"
                    onClick={() => setShowDeleteTokenModal(true)}
                    aria-label="Disconnect GitHub account"
                    disabled={fetchingProfile}
                  >
                    {fetchingProfile ? (
                      <>
                        <LoadingSpinner />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <FaTimes size={14} />
                        Disconnect
                      </>
                    )}
                  </ConnectionButton>
                </ConnectionButtonGroup>
              </TokenManagementSection>
              
              {/* Delete Token Confirmation Modal */}
              {showDeleteTokenModal && (
                <ModalBackdrop>
                  <Modal>
                    <ModalHeader>
                      <ModalTitle>
                        <FaExclamationTriangle color={theme.brand.primary} />
                        Disconnect GitHub Account
                      </ModalTitle>
                      <ModalCloseButton 
                        onClick={() => setShowDeleteTokenModal(false)}
                        aria-label="Close modal"
                      >
                        <FaTimes />
                      </ModalCloseButton>
                    </ModalHeader>
                    
                    <ModalContent>
                      <div style={{ marginBottom: '16px' }}>
                        Are you sure you want to disconnect your GitHub account? This will:
                      </div>
                      <ul style={{ color: theme.text.secondary, marginBottom: '16px', paddingLeft: '20px' }}>
                        <li>Remove your GitHub token from this app</li>
                        <li>End your ability to view and manage pull requests</li>
                        <li>Require you to reconnect with a token if you want to use GitHub features again</li>
                      </ul>
                      <div style={{ color: theme.text.secondary }}>
                        Note: This does not revoke the token on GitHub itself. To fully revoke access, 
                        please visit GitHub's settings page.
                      </div>
                    </ModalContent>
                    
                    <ModalButtons>
                      <ProfileButton onClick={() => setShowDeleteTokenModal(false)}>
                        Cancel
                      </ProfileButton>
                      <ConnectionButton 
                        variant="danger" 
                        onClick={handleDeleteToken}
                        disabled={fetchingProfile}
                      >
                        {fetchingProfile ? (
                          <>
                            <LoadingSpinner />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <FaTimes size={14} />
                            Disconnect
                          </>
                        )}
                      </ConnectionButton>
                    </ModalButtons>
                  </Modal>
                </ModalBackdrop>
              )}
            </>
          ) : (
            <>
              <ProfileHeader>
                <AvatarPlaceholder>
                  <FaGithub />
                </AvatarPlaceholder>
                
                <ProfileInfo>
                  <ProfileName>Connect GitHub Account</ProfileName>
                  <div style={{ color: theme.text.secondary, fontSize: '14px', margin: '8px 0' }}>
                    Connect your GitHub account to view and manage pull requests directly in the app.
                  </div>
                </ProfileInfo>
              </ProfileHeader>
              
              <TokenManagementSection>
                <ProfileSectionTitle>
                  <FaUserSecret size={14} />
                  Personal Access Token
                </ProfileSectionTitle>
                
                <div style={{ fontSize: '14px', marginBottom: '12px', color: theme.text.secondary }}>
                  A personal access token allows this app to access your GitHub data securely.
                </div>
                
                <div>
                  <GitHubTokenField
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    aria-label="GitHub personal access token"
                  />
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <ConnectionButton 
                      variant="primary"
                      onClick={handleConnectGitHub}
                      aria-label="Connect GitHub account"
                      disabled={fetchingProfile}
                    >
                      {fetchingProfile ? (
                        <>
                          <LoadingSpinner />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <FaGithub size={14} />
                          Connect Account
                        </>
                      )}
                    </ConnectionButton>
                    
                    <ConnectionButton
                      as="a"
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Create a new GitHub token"
                    >
                      <FaLink size={14} />
                      Create Token
                    </ConnectionButton>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>To create a token:</div>
                  <ol style={{ paddingLeft: '16px', color: theme.text.secondary, margin: '0' }}>
                    <li>Go to GitHub → Settings → Developer settings → Personal access tokens</li>
                    <li>Generate a new token with <code>repo</code> scope</li>
                    <li>Copy the token immediately (GitHub only shows it once)</li>
                    <li>Paste the token here to connect your account</li>
                  </ol>
                </div>
              </TokenManagementSection>
            </>
          )}
        </GitHubProfileSection>

        <SettingRow style={{ marginTop: '24px' }}>
          <div>
            <SettingLabel><FaTrash style={{ marginRight: '8px', color: theme.brand.primary }} /> Delete All Data</SettingLabel>
            <SettingDescription>Permanently remove all app data including collections, history, environments, and settings</SettingDescription>
          </div>
          <ActionButton onClick={() => setShowDeleteModal(true)}>Delete All Data</ActionButton>
        </SettingRow>
      </SettingSection>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAllData}
      />
    </SettingsPanel>
  );
  
  // Render keyboard shortcuts
  const renderShortcutsSettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>Keyboard Shortcuts</SectionTitle>
        <ShortcutRow>
          <SettingLabel>Send Request</SettingLabel>
          <ShortcutKeysContainer>
            <ShortcutKey>Ctrl</ShortcutKey>
            <span>+</span>
            <ShortcutKey>Enter</ShortcutKey>
          </ShortcutKeysContainer>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>New Request</SettingLabel>
          <ShortcutKeysContainer>
            <ShortcutKey>Ctrl</ShortcutKey>
            <span>+</span>
            <ShortcutKey>N</ShortcutKey>
          </ShortcutKeysContainer>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Format JSON</SettingLabel>
          <ShortcutKeysContainer>
            <ShortcutKey>Ctrl</ShortcutKey>
            <span>+</span>
            <ShortcutKey>Shift</ShortcutKey>
            <span>+</span>
            <ShortcutKey>F</ShortcutKey>
          </ShortcutKeysContainer>
        </ShortcutRow>
      </SettingSection>
    </SettingsPanel>
  );
  
  // Render export/import settings
  const renderExportSettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>Data Export</SectionTitle>
        <ShortcutRow>
          <SettingLabel>Export All Collections</SettingLabel>
          <ActionButton onClick={handleExportCollections}>Export</ActionButton>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Export Environments</SettingLabel>
          <ActionButton onClick={handleExportEnvironments}>Export</ActionButton>
        </ShortcutRow>
      </SettingSection>
      
      <SettingSection>
        <SectionTitle>Data Import</SectionTitle>
        <ShortcutRow>
          <SettingLabel>Import Collections</SettingLabel>
          <ActionButton onClick={() => setShowImportModal(true)}>Import</ActionButton>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Import from Postman</SettingLabel>
          <ActionButton onClick={() => setShowImportModal(true)}>Import</ActionButton>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Import from Insomnia</SettingLabel>
          <ActionButton onClick={() => setShowImportModal(true)}>Import</ActionButton>
        </ShortcutRow>
      </SettingSection>
      
      {/* Import File Modal */}
      <ImportFileModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportFile}
      />
    </SettingsPanel>
  );
  
  // Render about section
  const renderAboutSettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>Restify</SectionTitle>
        <AboutVersion>Version 1.0.0</AboutVersion>
        <div style={{ color: theme.text.secondary, lineHeight: '1.5', marginBottom: '20px' }}>
          A modern REST API client for developers with features for testing, documenting, and organizing API requests.
        </div>
        <AboutLinks>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}><FaInfoCircle /> Check for Updates</AboutLink>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}><FaFileExport /> View Documentation</AboutLink>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}><FaShieldAlt /> Report an Issue</AboutLink>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}><FaGlobe /> View License</AboutLink>
        </AboutLinks>
      </SettingSection>
    </SettingsPanel>
  );
  
  // Render AI settings
  const renderAISettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>AI Assistant Configuration</SectionTitle>
        <SettingRow>
          <div>
            <SettingLabel>API Provider</SettingLabel>
            <SettingDescription>Select your AI service provider</SettingDescription>
          </div>
          <SelectInput 
            value={settings.ai.provider}
            onChange={(e) => updateSettings('ai', 'provider', e.target.value)}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
            <option value="mistral">Mistral AI</option>
            <option value="custom">Custom API</option>
          </SelectInput>
        </SettingRow>
        
        <SettingRow>
          <div>
            <SettingLabel>Model</SettingLabel>
            <SettingDescription>Select the AI model to use</SettingDescription>
          </div>
          {settings.ai.provider === 'openai' ? (
            <SelectInput 
              value={settings.ai.model}
              onChange={(e) => updateSettings('ai', 'model', e.target.value)}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4o">GPT-4o</option>
            </SelectInput>
          ) : settings.ai.provider === 'anthropic' ? (
            <SelectInput 
              value={settings.ai.model}
              onChange={(e) => updateSettings('ai', 'model', e.target.value)}
            >
              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
              <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
            </SelectInput>
          ) : (
            <TextInput 
              value={settings.ai.model}
              onChange={(e) => updateSettings('ai', 'model', e.target.value)}
              placeholder="Enter model name"
            />
          )}
        </SettingRow>
        
        <SettingRow>
          <div>
            <SettingLabel><FaKey style={{ marginRight: '8px', color: theme.brand.primary }} /> API Key</SettingLabel>
            <SettingDescription>Enter your API key for the selected provider</SettingDescription>
          </div>
          <PasswordInput 
            value={settings.ai.apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your API key"
          />
        </SettingRow>
        
        {settings.ai.provider === 'custom' && (
          <SettingRow>
            <div>
              <SettingLabel>Custom API URL</SettingLabel>
              <SettingDescription>Enter the URL for your custom API endpoint</SettingDescription>
            </div>
            <TextInput 
              value={settings.ai.apiUrl || ''}
              onChange={(e) => updateSettings('ai', 'apiUrl', e.target.value)}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </SettingRow>
        )}
        
        <SettingRow>
          <div>
            <SettingLabel>Test Connection</SettingLabel>
            <SettingDescription>Verify your API settings are working correctly</SettingDescription>
          </div>
          <ActionButton 
            onClick={async () => {
              try {
                if (!settings.ai.apiKey) {
                  alert("Please enter an API key first");
                  return;
                }
                
                // Initialize the service with current settings
                aiService.initialize({
                  provider: settings.ai.provider,
                  model: settings.ai.model,
                  apiKey: settings.ai.apiKey,
                  apiUrl: settings.ai.apiUrl
                });
                
                // Test with a simple prompt
                const response = await aiService.generateCompletion(
                  "Hello! Please respond with a simple 'Connection successful' message."
                );
                
                alert("API connection successful!");
              } catch (error) {
                console.error("API connection failed:", error);
                alert(`API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}
          >
            Test Connection
          </ActionButton>
        </SettingRow>
      </SettingSection>
    </SettingsPanel>
  );
  
  // Render content based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return renderGeneralSettings();
      case 'api':
        return renderApiSettings();
      case 'security':
        return renderSecuritySettings();
      case 'shortcuts':
        return renderShortcutsSettings();
      case 'export':
        return renderExportSettings();
      case 'about':
        return renderAboutSettings();
      case 'ai':
        return renderAISettings();
      default:
        return renderGeneralSettings();
    }
  };
  
  return (
    <SettingsContainer>
      <SettingsHeader>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BackButton onClick={onReturn}>
            <FaArrowLeft />
          </BackButton>
          <SettingsTitle>Settings</SettingsTitle>
        </div>
      </SettingsHeader>
      
      <SettingsContent>
        <SettingsSidebar>
          {renderCategories()}
        </SettingsSidebar>
        
        {renderContent()}
      </SettingsContent>
      
      {/* Import File Modal */}
      <ImportFileModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportFile}
      />
    </SettingsContainer>
  );
};

export default SettingsManager; 