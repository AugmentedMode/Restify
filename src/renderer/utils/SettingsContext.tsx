import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import githubService, { GitHubService } from '../services/GitHubService';

// Define settings types (matching our settings component)
interface GeneralSettings {
  showCollections: boolean;
  showHistory: boolean;
  showSecretsManager: boolean;
  showBoards: boolean;
  showNotes: boolean;
  showGitHub: boolean;
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

interface GitHubSettings {
  token: string;
  isConnected: boolean;
}

export interface AppSettings {
  general: GeneralSettings;
  api: ApiSettings;
  security: SecuritySettings;
  ai: AISettings;
  github: GitHubSettings;
}

// Default settings
const defaultSettings: AppSettings = {
  general: {
    showCollections: true,
    showHistory: true,
    showSecretsManager: true,
    showBoards: true,
    showNotes: false,
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
  },
  ai: {
    apiKey: '',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiUrl: ''
  },
  github: {
    token: '',
    isConnected: false
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
  setGitHubToken: (token: string) => Promise<void>;
  clearGitHubToken: () => Promise<void>;
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
      },
      github: {
        ...defaultSettings.github,
        ...parsedSettings.github
      }
    };
  });

  // Initialize GitHub connection on first load
  useEffect(() => {
    const initGitHub = async () => {
      try {
        const savedToken = await GitHubService.loadStoredToken();
        if (savedToken && settings.security.storeGitHubToken) {
          await githubService.initialize(savedToken, settings.security.storeGitHubToken);
          setSettings(prev => ({
            ...prev,
            github: {
              ...prev.github,
              isConnected: true,
              token: '******' // Mask token in memory for security
            }
          }));
        }
      } catch (error) {
        console.error('Failed to initialize GitHub service:', error);
      }
    };
    
    initGitHub();
  }, []);

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

  // Set GitHub token and initialize service
  const setGitHubToken = async (token: string) => {
    try {
      await githubService.initialize(token, settings.security.storeGitHubToken);
      
      // Dispatch a custom event to notify components about GitHub authentication
      window.dispatchEvent(new CustomEvent('github-auth-changed', { detail: { authenticated: true } }));
      
      // Update settings
      setSettings(prev => ({
        ...prev,
        github: {
          ...prev.github,
          isConnected: true,
          token: '******' // Mask token in memory for security
        }
      }));
    } catch (error) {
      console.error('Failed to set GitHub token:', error);
      throw error;
    }
  };

  // Clear GitHub token
  const clearGitHubToken = async () => {
    try {
      // Clear token from service
      githubService.clearToken();
      
      // Clear from storage
      GitHubService.clearStoredToken();
      
      // Dispatch a custom event to notify components
      window.dispatchEvent(new CustomEvent('github-auth-changed', { detail: { authenticated: false } }));
      
      // Update settings
      setSettings(prev => ({
        ...prev,
        github: {
          ...prev.github,
          isConnected: false,
          token: ''
        }
      }));
    } catch (error) {
      console.error('Failed to clear GitHub token:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      toggleSetting,
      setGitHubToken,
      clearGitHubToken
    }}>
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