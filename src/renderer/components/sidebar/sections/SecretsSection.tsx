import React from 'react';
import { motion } from 'framer-motion';
import { FaKey, FaPlus, FaLock, FaFileExport, FaFileImport } from 'react-icons/fa';
import {
  ActionButton,
  ActionButtons,
  CollectionHeader,
  CollectionIcon,
  CollectionTitle,
  EmptyHistoryMessage,
} from '../../../styles/StyledComponents';
import CollapsibleSection from '../components/CollapsibleSection';
import styled from 'styled-components';
import { SecretsProfile } from '../../../types';

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const ProfileItemContainer = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 4px 0;
  background-color: ${(props) => (props.active ? 'rgba(50, 144, 255, 0.15)' : 'transparent')};
  color: ${(props) => (props.active ? '#3290ff' : 'inherit')};
  margin-left: 16px;
  
  &:hover {
    background-color: ${(props) => (props.active ? 'rgba(50, 144, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)')};
  }
`;

const ProfileName = styled.div`
  flex: 1;
  font-size: 13px;
  margin-left: 8px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface SecretsSectionProps {
  secretsProfiles: SecretsProfile[];
  activeProfileId: string | null;
  expanded: boolean;
  toggleSection: () => void;
  onSelectProfile: (profile: SecretsProfile) => void;
  onAddProfile: () => void;
  onImportSecrets: () => void;
  onExportSecrets: (profileId: string) => void;
  filter?: string;
}

const SecretsSection: React.FC<SecretsSectionProps> = ({
  secretsProfiles,
  activeProfileId,
  expanded,
  toggleSection,
  onSelectProfile,
  onAddProfile,
  onImportSecrets,
  onExportSecrets,
  filter,
}) => {
  // Filter profiles based on search term
  const filteredProfiles = filter 
    ? secretsProfiles.filter(profile => 
        profile.name.toLowerCase().includes(filter.toLowerCase()))
    : secretsProfiles;

  const sectionTitle = (
    <CollectionHeader>
      <CollectionIcon>
        <FaKey />
      </CollectionIcon>
      <CollectionTitle>Secrets Manager</CollectionTitle>
    </CollectionHeader>
  );

  const sectionActions = (
    <ActionButtons>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onImportSecrets();
        }}
        title="Import Secrets"
        className="action-button"
      >
        <FaFileImport />
      </ActionButton>
    </ActionButtons>
  );

  return (
    <CollapsibleSection
      title={sectionTitle}
      expanded={expanded}
      onToggle={toggleSection}
      actions={sectionActions}
    >
      {filteredProfiles.length === 0 ? (
        <EmptyHistoryMessage>
          {filter
            ? 'No matching secret profiles found.'
            : 'No secret profiles yet. Create one to get started.'}
        </EmptyHistoryMessage>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProfiles.map((profile) => (
            <motion.div
              key={profile.id}
              variants={itemVariants}
              transition={{ duration: 0.2 }}
              whileHover={{ x: 4 }}
            >
              <ProfileItemContainer
                active={activeProfileId === profile.id}
                onClick={() => onSelectProfile(profile)}
              >
                {profile.isEncrypted ? <FaLock size={12} /> : <FaKey size={12} />}
                <ProfileName>{profile.name}</ProfileName>
                {profile.secrets.length > 0 && (
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    marginRight: '4px'
                  }}>
                    {profile.secrets.length}
                  </div>
                )}
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportSecrets(profile.id);
                  }}
                  title="Export Secrets"
                  className="action-button"
                  style={{ opacity: 0.7, fontSize: '10px' }}
                >
                  <FaFileExport size={10} />
                </ActionButton>
              </ProfileItemContainer>
            </motion.div>
          ))}
        </motion.div>
      )}
    </CollapsibleSection>
  );
};

export default SecretsSection; 