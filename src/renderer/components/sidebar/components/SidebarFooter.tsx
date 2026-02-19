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
  gap: 8px;
  padding: 6px;
  border-radius: 12px;
  margin: 2px 4px 0;
  background: rgba(17, 18, 24, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 8px 16px rgba(0, 0, 0, 0.2);
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 10px;
  transition: all 0.2s;
  flex: 1;
  min-width: 0;
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

const ProfilePlaceholder = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(205, 210, 226, 0.78);
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  flex-shrink: 0;
`;

const ProfileMeta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 10px;
`;

const ProfileName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: rgba(245, 246, 250, 0.94);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileStatus = styled.span`
  font-size: 11px;
  color: rgba(187, 192, 207, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SettingsButton = styled.button`
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(194, 200, 216, 0.74);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;

  &:hover {
    color: rgba(248, 248, 252, 0.98);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.24);
  }
`;

interface SidebarFooterProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onOpenSettings?: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isSidebarCollapsed,
  onOpenSettings = () => {},
}) => {
  const { profile, loading } = useGitHubProfile();

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
              <ProfileMeta>
                <ProfileName>
                  {loading ? 'Connecting...' : profile ? (profile.name || profile.login) : 'GitHub'}
                </ProfileName>
                <ProfileStatus>
                  {profile ? `@${profile.login}` : 'Connect account'}
                </ProfileStatus>
              </ProfileMeta>
            )}
          </ProfileSection>
        </NavTooltip>
        <NavTooltip title="Settings" isCollapsed={isSidebarCollapsed}>
          <SettingsButton onClick={onOpenSettings} className="nav-item">
            <FaCog size={16} />
          </SettingsButton>
        </NavTooltip>
      </ProfileRow>
    </Footer>
  );
};

export default SidebarFooter;
