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
  FaArrowLeft
} from 'react-icons/fa';

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
type SettingCategory = 'appearance' | 'api' | 'shortcuts' | 'security' | 'export' | 'about';

// Define settings types
interface AppearanceSettings {
  theme: string;
  sidebarPosition: string;
  showApiResponseTime: boolean;
  fontSize: string;
}

interface ApiSettings {
  defaultTimeout: number;
  followRedirects: boolean;
  validateSSL: boolean;
  preferGzipEncoding: boolean;
}

interface SecuritySettings {
  storeCredentialsSecurely: boolean;
  clearHistoryOnExit: boolean;
  anonymizeDataInExports: boolean;
}

interface AppSettings {
  appearance: AppearanceSettings;
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
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('appearance');
  
  // Example settings state
  const [settings, setSettings] = useState<AppSettings>({
    appearance: {
      theme: 'system',
      sidebarPosition: 'left',
      showApiResponseTime: true,
      fontSize: 'medium',
    },
    api: {
      defaultTimeout: 30000,
      followRedirects: true,
      validateSSL: true,
      preferGzipEncoding: true,
    },
    security: {
      storeCredentialsSecurely: true,
      clearHistoryOnExit: false,
      anonymizeDataInExports: false,
    }
  });
  
  // Toggle boolean settings
  const toggleSetting = <T extends keyof AppSettings>(
    category: T, 
    setting: keyof AppSettings[T] & string
  ) => {
    // Using type assertion to safely access nested properties
    const currentValue = settings[category][setting as keyof typeof settings[T]];
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: typeof currentValue === 'boolean' ? !currentValue : currentValue
      }
    });
  };
  
  // Update select input settings
  const updateSelectSetting = <T extends keyof AppSettings>(
    category: T, 
    setting: keyof AppSettings[T] & string, 
    value: string | number
  ) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
  };
  
  // Render sidebar categories
  const renderCategories = () => {
    const categories: { id: SettingCategory; icon: JSX.Element; name: string }[] = [
      { id: 'appearance', icon: <FaPalette />, name: 'Appearance' },
      { id: 'api', icon: <FaGlobe />, name: 'API Defaults' },
      { id: 'shortcuts', icon: <FaKeyboard />, name: 'Shortcuts' },
      { id: 'security', icon: <FaShieldAlt />, name: 'Security' },
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
  
  // Render appearance settings
  const renderAppearanceSettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>Theme</SectionTitle>
        <SettingRow>
          <div>
            <SettingLabel>Theme Mode</SettingLabel>
            <SettingDescription>Choose between light, dark, or system theme</SettingDescription>
          </div>
          <SelectInput 
            value={settings.appearance.theme}
            onChange={(e) => updateSelectSetting('appearance', 'theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </SelectInput>
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Sidebar Position</SettingLabel>
            <SettingDescription>Change the position of the sidebar</SettingDescription>
          </div>
          <SelectInput 
            value={settings.appearance.sidebarPosition}
            onChange={(e) => updateSelectSetting('appearance', 'sidebarPosition', e.target.value)}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </SelectInput>
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Show API Response Time</SettingLabel>
            <SettingDescription>Display the time taken for API responses</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.appearance.showApiResponseTime}
            onClick={() => toggleSetting('appearance', 'showApiResponseTime')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Font Size</SettingLabel>
            <SettingDescription>Adjust the application font size</SettingDescription>
          </div>
          <SelectInput 
            value={settings.appearance.fontSize}
            onChange={(e) => updateSelectSetting('appearance', 'fontSize', e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </SelectInput>
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
            onChange={(e) => updateSelectSetting('api', 'defaultTimeout', e.target.value)}
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
        <SettingRow>
          <div>
            <SettingLabel>Prefer Gzip Encoding</SettingLabel>
            <SettingDescription>Request compressed responses when available</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.api.preferGzipEncoding}
            onClick={() => toggleSetting('api', 'preferGzipEncoding')}
          />
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
          <SettingLabel>Save Request</SettingLabel>
          <ShortcutKeysContainer>
            <ShortcutKey>Ctrl</ShortcutKey>
            <span>+</span>
            <ShortcutKey>S</ShortcutKey>
          </ShortcutKeysContainer>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Toggle Sidebar</SettingLabel>
          <ShortcutKeysContainer>
            <ShortcutKey>Ctrl</ShortcutKey>
            <span>+</span>
            <ShortcutKey>B</ShortcutKey>
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
  
  // Render security settings
  const renderSecuritySettings = () => (
    <SettingsPanel>
      <SettingSection>
        <SectionTitle>Security Settings</SectionTitle>
        <SettingRow>
          <div>
            <SettingLabel>Secure Credential Storage</SettingLabel>
            <SettingDescription>Use system keychain for storing sensitive credentials</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.security.storeCredentialsSecurely}
            onClick={() => toggleSetting('security', 'storeCredentialsSecurely')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Clear History on Exit</SettingLabel>
            <SettingDescription>Automatically clear request history when closing the app</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.security.clearHistoryOnExit}
            onClick={() => toggleSetting('security', 'clearHistoryOnExit')}
          />
        </SettingRow>
        <SettingRow>
          <div>
            <SettingLabel>Anonymize Data in Exports</SettingLabel>
            <SettingDescription>Remove sensitive data when exporting collections</SettingDescription>
          </div>
          <ToggleButton 
            isActive={settings.security.anonymizeDataInExports}
            onClick={() => toggleSetting('security', 'anonymizeDataInExports')}
          />
        </SettingRow>
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
          <ActionButton>Export</ActionButton>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Export Environments</SettingLabel>
          <ActionButton>Export</ActionButton>
        </ShortcutRow>
      </SettingSection>
      
      <SettingSection>
        <SectionTitle>Data Import</SectionTitle>
        <ShortcutRow>
          <SettingLabel>Import Collections</SettingLabel>
          <ActionButton>Import</ActionButton>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Import from Postman</SettingLabel>
          <ActionButton>Import</ActionButton>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Import from Insomnia</SettingLabel>
          <ActionButton>Import</ActionButton>
        </ShortcutRow>
      </SettingSection>
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
      case 'appearance':
        return renderAppearanceSettings();
      case 'api':
        return renderApiSettings();
      case 'shortcuts':
        return renderShortcutsSettings();
      case 'security':
        return renderSecuritySettings();
      case 'export':
        return renderExportSettings();
      case 'about':
        return renderAboutSettings();
      default:
        return renderAppearanceSettings();
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