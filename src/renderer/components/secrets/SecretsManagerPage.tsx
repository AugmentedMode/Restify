import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaKey, FaUpload, FaDownload } from 'react-icons/fa';
import { SecretsProfile } from '../../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.textPrimary};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: ${props => props.theme.buttonPrimary};
  color: ${props => props.theme.buttonTextPrimary};
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.buttonPrimaryHover};
  }
`;

const SecretGroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const SecretGroupCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.borderColor};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SecretGroupTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: ${props => props.theme.textPrimary};
`;

const SecretGroupDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 12px;
`;

const SecretCount = styled.span`
  font-size: 12px;
  color: ${props => props.theme.textTertiary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: ${props => props.theme.textSecondary};
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 20px;
`;

interface SecretsManagerPageProps {
  secretsProfiles: SecretsProfile[];
  onSelectProfile: (profile: SecretsProfile) => void;
  onAddProfile: () => void;
  onImportSecrets: () => void;
  onExportSecrets: (profileId: string) => void;
}

const SecretsManagerPage: React.FC<SecretsManagerPageProps> = ({
  secretsProfiles = [],
  onSelectProfile,
  onAddProfile,
  onImportSecrets,
  onExportSecrets,
}) => {
  // Helper function to count the number of secrets in a profile
  const countSecrets = (profile: SecretsProfile) => {
    if (!profile.secrets) return 0;
    return Object.keys(profile.secrets).length;
  };

  return (
    <Container>
      <Header>
        <Title>Secrets Manager</Title>
        <ButtonRow>
          <Button onClick={onImportSecrets}>
            <FaUpload /> Import
          </Button>
          <Button onClick={onAddProfile}>
            <FaPlus /> New Secret Group
          </Button>
        </ButtonRow>
      </Header>

      {secretsProfiles.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaKey />
          </EmptyStateIcon>
          <EmptyStateText>
            You don't have any secret groups yet. Create one to securely store your API keys, tokens, and other sensitive information.
          </EmptyStateText>
          <Button onClick={onAddProfile}>
            <FaPlus /> Create Secret Group
          </Button>
        </EmptyState>
      ) : (
        <SecretGroupsGrid>
          {secretsProfiles.map((profile) => (
            <SecretGroupCard 
              key={profile.id} 
              onClick={() => onSelectProfile(profile)}
            >
              <SecretGroupTitle>{profile.name}</SecretGroupTitle>
              {profile.description && (
                <SecretGroupDescription>{profile.description}</SecretGroupDescription>
              )}
              <SecretCount>{countSecrets(profile)} secrets</SecretCount>
            </SecretGroupCard>
          ))}
        </SecretGroupsGrid>
      )}
    </Container>
  );
};

export default SecretsManagerPage; 