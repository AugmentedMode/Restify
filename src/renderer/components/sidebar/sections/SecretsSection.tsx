import React from 'react';
import { FaKey, FaPlus } from 'react-icons/fa';
import styled from 'styled-components';
import { CollectionTitle } from '../../../styles/StyledComponents';

// Styled components
const Section = styled.div`
  margin-bottom: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  
  svg {
    margin-right: 10px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

interface SecretsSectionProps {
  expanded: boolean;
  toggleSection: () => void;
  onSelectProfile: (profile: any) => void;
  onAddProfile: () => void;
  onImportSecrets: () => void;
  onExportSecrets: (profileId: string) => void;
  secretsProfiles: any[];
  activeProfileId: string | null;
  filter?: string;
}

const SecretsSection: React.FC<SecretsSectionProps> = ({
  toggleSection,
  onAddProfile
}) => {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle onClick={toggleSection}>
          <FaKey />
          <CollectionTitle>Secrets Manager</CollectionTitle>
        </SectionTitle>
        <ActionButton 
          onClick={(e) => {
            e.stopPropagation();
            onAddProfile();
          }}
          title="New Secret Group"
        >
          <FaPlus size={14} />
        </ActionButton>
      </SectionHeader>
    </Section>
  );
};

export default SecretsSection; 