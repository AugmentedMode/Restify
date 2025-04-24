import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaKey, FaLock, FaPlus, FaFileImport, FaChevronLeft } from 'react-icons/fa';
import { SecretsProfile } from '../../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
  background-color: #121212;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #f5f5f5;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: #f5f5f5;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to right, rgba(30, 30, 30, 0.9), rgba(34, 34, 34, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #f5f5f5;
  
  &:hover {
    background: linear-gradient(to right, rgba(40, 40, 40, 0.9), rgba(44, 44, 44, 0.9));
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(90deg, #FF385C, #D02A49);
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ProfileCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(25, 25, 25, 0.9));
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const ProfileHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const IconContainer = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background-color: ${props => props.color || 'rgba(255, 56, 92, 0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor || '#FF385C'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
`;

const ProfileContent = styled.div`
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProfileDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

const ProfileMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: rgba(25, 25, 25, 0.4);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  margin-top: 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: rgba(255, 56, 92, 0.6);
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  max-width: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
`;

const EncryptedBadge = styled(Badge)`
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
`;

interface SecretsManagerListProps {
  profiles: SecretsProfile[];
  onSelectProfile: (profile: SecretsProfile) => void;
  onAddProfile: () => void;
  onImportSecrets: () => void;
  onReturn: () => void;
}

const SecretsManagerList: React.FC<SecretsManagerListProps> = ({
  profiles,
  onSelectProfile,
  onAddProfile,
  onImportSecrets,
  onReturn,
}) => {
  // Helper function to count secrets in a profile
  const countSecrets = (profile: SecretsProfile) => {
    if (!profile.secrets) return 0;
    return Object.keys(profile.secrets).length;
  };
  
  // Format date helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>
          <FaKey size={24} />
          Secrets Manager
        </HeaderTitle>
        <ButtonsContainer>
          <Button onClick={onImportSecrets}>
            <FaFileImport size={16} />
            Import
          </Button>
          <PrimaryButton onClick={onAddProfile}>
            <FaPlus size={16} />
            New Secret Group
          </PrimaryButton>
          <Button onClick={onReturn}>
            <FaChevronLeft size={16} />
            Return
          </Button>
        </ButtonsContainer>
      </HeaderContainer>
      
      {profiles.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaKey />
          </EmptyStateIcon>
          <EmptyStateText>
            You don't have any secret groups yet. Create a new group to securely store your API keys, tokens, and other sensitive information.
          </EmptyStateText>
          <ButtonGroup>
            <PrimaryButton onClick={onAddProfile}>
              <FaPlus size={16} />
              Create New Secret Group
            </PrimaryButton>
            <Button onClick={onImportSecrets}>
              <FaFileImport size={16} />
              Import from .env File
            </Button>
          </ButtonGroup>
        </EmptyState>
      ) : (
        <ProfileGrid>
          {profiles.map((profile, index) => (
            <ProfileCard
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <ProfileHeader>
                <IconContainer>
                  {profile.isEncrypted ? (
                    <FaLock size={20} />
                  ) : (
                    <FaKey size={20} />
                  )}
                </IconContainer>
                <ProfileTitle>{profile.name}</ProfileTitle>
                {profile.isEncrypted && (
                  <EncryptedBadge>
                    <FaLock size={10} />
                    Encrypted
                  </EncryptedBadge>
                )}
              </ProfileHeader>
              
              <ProfileContent>
                {profile.description && (
                  <ProfileDescription>
                    {profile.description.length > 100
                      ? `${profile.description.substring(0, 100)}...`
                      : profile.description}
                  </ProfileDescription>
                )}
                
                <ProfileMeta>
                  <span>{countSecrets(profile)} secrets</span>
                  <span>Created {formatDate(profile.createdAt)}</span>
                </ProfileMeta>
              </ProfileContent>
            </ProfileCard>
          ))}
        </ProfileGrid>
      )}
    </Container>
  );
};

export default SecretsManagerList; 