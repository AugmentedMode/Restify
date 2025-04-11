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
  FaSun
} from 'react-icons/fa';

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
  overflow: hidden;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const SettingsTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const SettingsContent = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const SettingsSidebar = styled.div`
  width: 200px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  overflow-y: auto;
`;

const CategoryItem = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  color: ${props => props.active ? '#FF385C' : 'inherit'};
  background-color: ${props => props.active ? 'rgba(255, 56, 92, 0.1)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(255, 56, 92, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const CategoryIcon = styled.div`
  margin-right: 10px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const SettingsPanel = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
`;

const SettingSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const SettingLabel = styled.div`
  font-size: 14px;
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: #777;
  margin-top: 4px;
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  width: 50px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.isActive ? '#FF385C' : '#ccc'};
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
  border: 1px solid #ddd;
  background-color: white;
  font-size: 14px;
  width: 180px;
`;

const ShortcutRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const ShortcutKey = styled.div`
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  border: 1px solid #ddd;
  margin-left: 8px;
`;

const ShortcutKeysContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AboutVersion = styled.div`
  font-size: 14px;
  margin-bottom: 20px;
`;

const AboutLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AboutLink = styled.a`
  color: #FF385C;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

interface SettingsSectionProps {
  onClose: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ onClose }) => {
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
          <button>Export</button>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Export Environments</SettingLabel>
          <button>Export</button>
        </ShortcutRow>
      </SettingSection>
      
      <SettingSection>
        <SectionTitle>Data Import</SectionTitle>
        <ShortcutRow>
          <SettingLabel>Import Collections</SettingLabel>
          <button>Import</button>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Import from Postman</SettingLabel>
          <button>Import</button>
        </ShortcutRow>
        <ShortcutRow>
          <SettingLabel>Import from Insomnia</SettingLabel>
          <button>Import</button>
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
        <AboutLinks>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}>Check for Updates</AboutLink>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}>View Documentation</AboutLink>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}>Report an Issue</AboutLink>
          <AboutLink href="#" onClick={(e) => e.preventDefault()}>View License</AboutLink>
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
        <SettingsTitle>Settings</SettingsTitle>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
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

export default SettingsSection; 