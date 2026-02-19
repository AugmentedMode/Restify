import React from 'react';
import { FaCog, FaGithub, FaQuestionCircle } from 'react-icons/fa';
import { SidebarFooter as Footer } from '../../../styles/StyledComponents';
import NavTooltip from './NavTooltip';
import NavItemRow from './NavItemRow';
import styled from 'styled-components';
import { useGitHubProfile } from '../../../hooks/useGitHubProfile';

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
  border-radius: 8px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
  flex: 1;
  min-width: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const ProfilePlaceholder = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const Username = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 10px;
`;

interface SidebarFooterProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onOpenSettings?: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isSidebarCollapsed,
  toggleSidebar,
  onOpenSettings = () => {},
}) => {
  const { profile, loading, isConnected } = useGitHubProfile();

  const handleProfileClick = () => {
    if (profile) {
      window.open(profile.html_url, '_blank');
    } else {
      onOpenSettings();
    }
  };

  return (
    <Footer>
      <NavItemRow
        icon={<FaQuestionCircle />}
        label="Support"
        onClick={() => window.open('https://github.com', '_blank')}
      />
      <ProfileRow>
        <NavTooltip title={profile ? profile.login : 'Connect to GitHub'} isCollapsed={isSidebarCollapsed}>
          <ProfileSection onClick={handleProfileClick}>
            {profile ? (
              <Avatar src={profile.avatar_url} alt={profile.login} />
            ) : (
              <ProfilePlaceholder>
                <FaGithub size={16} />
              </ProfilePlaceholder>
            )}
            {!isSidebarCollapsed && (
              <Username>
                {loading ? 'Connecting...' : profile ? (profile.name || profile.login) : 'Not connected'}
              </Username>
            )}
          </ProfileSection>
        </NavTooltip>
        <NavTooltip title="Settings" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(255,255,255,0.6)',
            }}
            onClick={onOpenSettings}
            className="nav-item"
          >
            <FaCog size={16} />
          </div>
        </NavTooltip>
      </ProfileRow>
    </Footer>
  );
};

export default SidebarFooter;
