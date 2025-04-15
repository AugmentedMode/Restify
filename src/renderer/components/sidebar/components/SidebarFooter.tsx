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

const LoadingDot = styled.div`
  @keyframes pulse {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
  }
  
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #aaa;
  margin-right: 4px;
  animation: pulse 1.5s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
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
  const [loading, setLoading] = useState(false);
  const [tokenCheckInterval, setTokenCheckInterval] = useState<number | null>(null);

  // Function to fetch GitHub profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (githubService.isInitialized()) {
        const userData = await githubService.getCurrentUser();
        setProfile(userData);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('[GitHub Profile] Error fetching user data:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling to check GitHub authentication status
  useEffect(() => {
    // Initial fetch
    fetchProfile();
    
    // Check every 3 seconds if not authenticated yet
    if (!tokenCheckInterval) {
      const interval = window.setInterval(() => {
        if (githubService.isInitialized()) {
          fetchProfile();
          if (tokenCheckInterval) {
            window.clearInterval(tokenCheckInterval);
            setTokenCheckInterval(null);
          }
        }
      }, 3000);
      
      setTokenCheckInterval(interval);
    }
    
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
                <LoadingIndicator>
                  <LoadingDot />
                  <LoadingDot />
                  <LoadingDot />
                </LoadingIndicator>
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