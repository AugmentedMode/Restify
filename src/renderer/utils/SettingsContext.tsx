import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define settings types (matching our settings component)
interface GeneralSettings {
  showCollections: boolean;
  showHistory: boolean;
  showSecretsManager: boolean;
  showBoards: boolean;
  showNotes: boolean;
  showGitHub: boolean;
  showAIPrompts: boolean;
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
  storeGitHubToken: boolean;
}

interface AISettings {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'custom';
  model: string;
  apiUrl?: string;
}

export interface AppSettings {
  general: GeneralSettings;
  api: ApiSettings;
  security: SecuritySettings;
  ai: AISettings;
}

// Default settings
const defaultSettings: AppSettings = {
  general: {
    showCollections: true,
    showHistory: true,
    showSecretsManager: true,
    showBoards: true,
    showNotes: true,
    showGitHub: true,
    showAIPrompts: true,
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
  },
  ai: {
    apiKey: '',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiUrl: ''
  }
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: <T extends keyof AppSettings>(
    category: T,
    setting: keyof AppSettings[T] & string,
    value: any
  ) => void;
  toggleSetting: <T extends keyof AppSettings>(
    category: T,
    setting: keyof AppSettings[T] & string
  ) => void;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('restifySettings');
    if (!savedSettings) {
      return defaultSettings;
    }
    
    // Parse saved settings and merge with defaults to ensure all properties exist
    const parsedSettings = JSON.parse(savedSettings);
    
    // Deep merge with default settings to ensure new properties are included
    return {
      general: {
        ...defaultSettings.general,
        ...parsedSettings.general
      },
      api: {
        ...defaultSettings.api,
        ...parsedSettings.api
      },
      security: {
        ...defaultSettings.security,
        ...parsedSettings.security
      },
      ai: {
        ...defaultSettings.ai,
        ...parsedSettings.ai
      }
    };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('restifySettings', JSON.stringify(settings));
  }, [settings]);

  // Update a specific setting
  const updateSettings = <T extends keyof AppSettings>(
    category: T,
    setting: keyof AppSettings[T] & string,
    value: any
  ) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value
      }
    });
  };

  // Toggle boolean settings
  const toggleSetting = <T extends keyof AppSettings>(
    category: T,
    setting: keyof AppSettings[T] & string
  ) => {
    console.log(`Before toggle - ${category}.${String(setting)}: ${settings[category][setting as keyof typeof settings[T]]}`);
    
    const currentValue = settings[category][setting as keyof typeof settings[T]];
    
    if (typeof currentValue === 'boolean') {
      setSettings({
        ...settings,
        [category]: {
          ...settings[category],
          [setting]: !currentValue
        }
      });
      
      console.log(`After toggle - ${category}.${String(setting)}: ${!currentValue}`);
    } else {
      console.log(`Not a boolean value: ${currentValue} (type: ${typeof currentValue})`);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext; 