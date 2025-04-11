import React, { useState } from 'react';
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
  FaFileImport
} from 'react-icons/fa';
import { useSettings } from '../../utils/SettingsContext';
import { db, NotesService, CollectionsService, HistoryService, ResponsesService, EnvironmentsService, SettingsService } from '../../services/DatabaseService';
import ImportFileModal from '../modals/ImportFileModal';
import { ImportService } from '../../services/ImportService';

// Theme colors for consistency
const theme = {
  background: {
    primary: '#1e1e1e',
    secondary: '#252525',
    tertiary: '#333',
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
type SettingCategory = 'general' | 'api' | 'security' | 'shortcuts' | 'export' | 'about';

// Define settings types
interface GeneralSettings {
  showCollections: boolean;
  showHistory: boolean;
  showSecretsManager: boolean;
  showBoards: boolean;
  showNotes: boolean;
  defaultResponseView: string;
}

interface ApiSettings {
  defaultTimeout: number;
  followRedirects: boolean;
  validateSSL: boolean;
}

interface SecuritySettings {
  clearHistoryOnExit: boolean;
  storeCredentialsSecurely: boolean;
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

interface SettingsManagerProps {
  onReturn: () => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ onReturn }) => {
  // State for active category
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');
  
  // State for import modal
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Use settings context instead of local state
  const { settings, updateSettings, toggleSetting } = useSettings();
  
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
  
  // Render sidebar categories
  const renderCategories = () => {
    const categories: { id: SettingCategory; icon: JSX.Element; name: string }[] = [
      { id: 'general', icon: <FaPalette />, name: 'General' },
      { id: 'api', icon: <FaGlobe />, name: 'API' },
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
            <SettingLabel>Show Notes <span style={{ backgroundColor: "#FF385C", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "10px", marginLeft: "8px" }}>Coming Soon</span></SettingLabel>
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
        <SettingRow style={{ borderBottom: '1px solid rgba(255, 56, 92, 0.2)', paddingBottom: '20px' }}>
          <div>
            <SettingLabel><FaTrash style={{ marginRight: '8px', color: theme.brand.primary }} /> Delete All Data</SettingLabel>
            <SettingDescription>Permanently remove all app data including collections, history, environments, and settings</SettingDescription>
          </div>
          <ActionButton onClick={async () => {
            if (window.confirm('Are you sure you want to delete ALL data? This operation is permanent and cannot be undone.')) {
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
            }
          }}>Delete All Data</ActionButton>
        </SettingRow>
      </SettingSection>
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
    </SettingsContainer>
  );
};

export default SettingsManager; 