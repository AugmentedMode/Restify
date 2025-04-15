import React, { useEffect, useState } from 'react';
import { FaCog, FaChevronLeft, FaChevronRight, FaGithub, FaUser } from 'react-icons/fa';
import { SidebarFooter as Footer } from '../../../styles/StyledComponents';
import NavTooltip from './NavTooltip';
import styled from 'styled-components';
import githubService from '../../../services/GitHubService';

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Avatar = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const ProfilePlaceholder = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const UserInfo = styled.div<{ isCollapsed: boolean }>`
  display: ${props => props.isCollapsed ? 'none' : 'flex'};
  flex-direction: column;
  margin-left: 12px;
  overflow: hidden;
`;

const Username = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const Login = styled.span`
  font-size: 12px;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const LoadingAnimation = styled.div`
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  display: flex;
  align-items: center;
  animation: pulse 1.2s infinite ease-in-out;
  color: #bbb;
  font-size: 14px;
  font-weight: 500;
`;

interface SidebarFooterProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onOpenSettings?: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ 
  isSidebarCollapsed, 
  toggleSidebar,
  onOpenSettings = () => {} 
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokenCheckInterval, setTokenCheckInterval] = useState<number | null>(null);

  // Function to fetch GitHub profile
  const fetchProfile = async () => {
    try {
      if (githubService.isInitialized()) {
        const userData = await githubService.getCurrentUser();
        setProfile(userData);
        setLoading(false);
        if (tokenCheckInterval) {
          window.clearInterval(tokenCheckInterval);
          setTokenCheckInterval(null);
        }
      }
    } catch (error) {
      console.error('[GitHub Profile] Error fetching user data:', error);
    }
  };

  // Set up polling to check GitHub authentication status
  useEffect(() => {
    // Initial fetch
    fetchProfile();
    
    // Check every 2 seconds if not authenticated yet
    const interval = window.setInterval(() => {
      if (!profile) {
        fetchProfile();
      }
    }, 2000);
    
    setTokenCheckInterval(interval);
    
    // Cleanup
    return () => {
      if (tokenCheckInterval) {
        window.clearInterval(tokenCheckInterval);
      }
    };
  }, []);

  // Handle profile section click based on connection status
  const handleProfileClick = () => {
    // If profile exists, open GitHub profile page in browser
    if (profile) {
      window.open(profile.html_url, '_blank');
    } else {
      // If not connected, trigger settings panel to open GitHub section
      onOpenSettings();
    }
  };

  return (
    <Footer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <NavTooltip title={profile ? profile.login : "Connect to GitHub"} isCollapsed={isSidebarCollapsed}>
          <ProfileSection className="nav-item" onClick={handleProfileClick}>
            {profile ? (
              <Avatar src={profile.avatar_url} alt={profile.login} />
            ) : (
              <ProfilePlaceholder>
                <FaGithub size={20} />
              </ProfilePlaceholder>
            )}
            <UserInfo isCollapsed={isSidebarCollapsed}>
              {loading ? (
                <LoadingAnimation>Connecting...</LoadingAnimation>
              ) : profile ? (
                <>
                  <Username>{profile.name || profile.login}</Username>
                  {profile.name && <Login>@{profile.login}</Login>}
                </>
              ) : (
                <Username>Not connected</Username>
              )}
            </UserInfo>
          </ProfileSection>
        </NavTooltip>

        <NavTooltip title="Settings" isCollapsed={isSidebarCollapsed}>
          <div 
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onClick={onOpenSettings}
            className="nav-item"
          >
            <FaCog size={20} />
          </div>
        </NavTooltip>
      </div>
    </Footer>
  );
};

export default SidebarFooter; 