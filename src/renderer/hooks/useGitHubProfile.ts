import { useState, useEffect } from 'react';
import githubService from '../services/GitHubService';
import { useSettings } from '../utils/SettingsContext';

/**
 * Hook to manage GitHub profile state across components
 * @returns {Object} GitHub profile state
 */
export const useGitHubProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!settings.github.isConnected) {
        setProfile(null);
        return;
      }

      if (githubService.isInitialized()) {
        const userData = await githubService.getCurrentUser();
        setProfile(userData);
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      console.error('[GitHub Profile] Error fetching user data:', error);
      setError(error?.message || 'Failed to fetch GitHub profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial profile fetch
    fetchProfile();

    // Listen for auth changes
    const handleAuthChange = () => {
      fetchProfile();
    };

    window.addEventListener('github-auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('github-auth-changed', handleAuthChange);
    };
  }, [settings.github.isConnected]);

  return {
    profile,
    loading,
    error,
    isConnected: settings.github.isConnected,
    refresh: fetchProfile
  };
};

export default useGitHubProfile; 