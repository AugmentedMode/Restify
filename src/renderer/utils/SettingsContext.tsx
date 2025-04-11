import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define settings types (matching our settings component)
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

export interface AppSettings {
  general: GeneralSettings;
  api: ApiSettings;
  security: SecuritySettings;
}

// Default settings
const defaultSettings: AppSettings = {
  general: {
    showCollections: true,
    showHistory: true,
    showSecretsManager: true,
    showBoards: true,
    showNotes: false,
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
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
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
    const currentValue = settings[category][setting as keyof typeof settings[T]];
    
    if (typeof currentValue === 'boolean') {
      setSettings({
        ...settings,
        [category]: {
          ...settings[category],
          [setting]: !currentValue
        }
      });
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