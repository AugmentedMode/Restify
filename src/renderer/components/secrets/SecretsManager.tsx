import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaChevronLeft, 
  FaPlus, 
  FaTrash, 
  FaEye, 
  FaEyeSlash, 
  FaFileExport, 
  FaFileImport, 
  FaEdit, 
  FaLock, 
  FaUnlock,
  FaKey
} from 'react-icons/fa';
import { Secret, SecretsProfile } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
  gap: 16px;
  background-color: #1e1e1e;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #f5f5f5;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderTitle = styled.h2`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 500;
  color: #f5f5f5;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to right, rgba(36, 36, 36, 0.9), rgba(40, 40, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(to right, rgba(46, 46, 46, 0.9), rgba(50, 50, 50, 0.9));
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
`;

const NoSecretsMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 40px;
`;

const SecretListTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 8px;
  background-color: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 80px;
  gap: 8px;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 80px;
  gap: 8px;
  padding: 12px 16px;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const SecretKeyCell = styled.div`
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f5f5f5;
`;

const SecretValueCell = styled.div`
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionIcon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
  }
`;

const AddSecretForm = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #f5f5f5;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(50, 144, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(50, 144, 255, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const DescriptionArea = styled.div`
  margin-top: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
`;

interface SecretsManagerProps {
  activeProfile: SecretsProfile | null;
  profiles: SecretsProfile[];
  onAddSecret: (profileId: string, secret: Secret) => void;
  onUpdateSecret: (profileId: string, secret: Secret) => void;
  onDeleteSecret: (profileId: string, secretId: string) => void;
  onUpdateProfile: (profile: SecretsProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  onExportSecrets: (profileId: string) => void;
  onImportSecrets: () => void;
  onEncryptProfile: (profileId: string, password: string) => void;
  onDecryptProfile: (profileId: string, password: string) => void;
  onReturn: () => void;
}

const SecretsManager: React.FC<SecretsManagerProps> = ({
  activeProfile,
  profiles,
  onAddSecret,
  onUpdateSecret,
  onDeleteSecret,
  onUpdateProfile,
  onDeleteProfile,
  onExportSecrets,
  onImportSecrets,
  onEncryptProfile,
  onDecryptProfile,
  onReturn,
}) => {
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [editingSecretId, setEditingSecretId] = useState<string | null>(null);
  const [showEncryptModal, setShowEncryptModal] = useState(false);
  const [password, setPassword] = useState('');

  // Clear form fields when profile changes
  useEffect(() => {
    setNewSecretKey('');
    setNewSecretValue('');
    setEditingSecretId(null);
  }, [activeProfile?.id]);

  const handleAddSecret = () => {
    if (!activeProfile || !newSecretKey.trim()) return;
    
    const newSecret: Secret = {
      id: uuidv4(),
      key: newSecretKey.trim(),
      value: newSecretValue,
      isMasked: true,
    };
    
    onAddSecret(activeProfile.id, newSecret);
    setNewSecretKey('');
    setNewSecretValue('');
  };
  
  const toggleSecretMask = (secretId: string) => {
    if (!activeProfile) return;
    
    const secret = activeProfile.secrets.find(s => s.id === secretId);
    if (!secret) return;
    
    onUpdateSecret(activeProfile.id, {
      ...secret,
      isMasked: !secret.isMasked,
    });
  };
  
  const handleDeleteSecret = (secretId: string) => {
    if (!activeProfile) return;
    onDeleteSecret(activeProfile.id, secretId);
  };
  
  const handleEncryptProfile = () => {
    if (!activeProfile) return;
    
    if (activeProfile.isEncrypted) {
      onDecryptProfile(activeProfile.id, password);
    } else {
      onEncryptProfile(activeProfile.id, password);
    }
    
    setShowEncryptModal(false);
    setPassword('');
  };
  
  const handleDeleteProfile = () => {
    if (!activeProfile) return;
    
    if (confirm(`Are you sure you want to delete the profile "${activeProfile.name}"? This action cannot be undone.`)) {
      onDeleteProfile(activeProfile.id);
    }
  };

  if (!activeProfile) {
    return (
      <Container>
        <NoSecretsMessage>
          <div>Select a secrets profile from the sidebar or create a new one.</div>
          <ActionButton onClick={onReturn}>
            <FaChevronLeft size={12} /> Return to API Client
          </ActionButton>
        </NoSecretsMessage>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>
          {activeProfile.isEncrypted ? <FaLock size={18} /> : <FaKey size={18} />}
          {activeProfile.name}
        </HeaderTitle>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ActionButton 
            onClick={() => setShowEncryptModal(true)}
            title={activeProfile.isEncrypted ? "Decrypt Profile" : "Encrypt Profile"}
          >
            {activeProfile.isEncrypted ? <FaUnlock size={12} /> : <FaLock size={12} />}
            {activeProfile.isEncrypted ? "Decrypt" : "Encrypt"}
          </ActionButton>
          <ActionButton 
            onClick={() => onExportSecrets(activeProfile.id)}
            title="Export as .env file"
          >
            <FaFileExport size={12} /> Export
          </ActionButton>
          <ActionButton onClick={onReturn}>
            <FaChevronLeft size={12} /> Return
          </ActionButton>
        </div>
      </HeaderContainer>
      
      <ContentContainer>
        {activeProfile.description && (
          <DescriptionArea>
            {activeProfile.description}
          </DescriptionArea>
        )}
        
        <AddSecretForm>
          <Input
            type="text"
            placeholder="Secret Key (e.g. API_KEY)"
            value={newSecretKey}
            onChange={(e) => setNewSecretKey(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Secret Value"
            value={newSecretValue}
            onChange={(e) => setNewSecretValue(e.target.value)}
          />
          <ActionButton onClick={handleAddSecret} disabled={!newSecretKey.trim()}>
            <FaPlus size={12} /> Add Secret
          </ActionButton>
        </AddSecretForm>
        
        {activeProfile.secrets.length === 0 ? (
          <NoSecretsMessage>
            <div>No secrets yet. Use the form above to add your first secret.</div>
          </NoSecretsMessage>
        ) : (
          <SecretListTable>
            <TableHeader>
              <div>Key</div>
              <div>Value</div>
              <div>Actions</div>
            </TableHeader>
            {activeProfile.secrets.map((secret) => (
              <TableRow key={secret.id}>
                <SecretKeyCell>{secret.key}</SecretKeyCell>
                <SecretValueCell>
                  {secret.isMasked ? '••••••••••••••••' : secret.value}
                </SecretValueCell>
                <ActionsCell>
                  <ActionIcon 
                    onClick={() => toggleSecretMask(secret.id)}
                    title={secret.isMasked ? "Show value" : "Hide value"}
                  >
                    {secret.isMasked ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                  </ActionIcon>
                  <ActionIcon
                    onClick={() => handleDeleteSecret(secret.id)}
                    title="Delete secret"
                  >
                    <FaTrash size={14} />
                  </ActionIcon>
                </ActionsCell>
              </TableRow>
            ))}
          </SecretListTable>
        )}
      </ContentContainer>
      
      {/* Encrypt Modal - Simplified version, would be better with a proper modal component */}
      {showEncryptModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: '400px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}>
            <h3>
              {activeProfile.isEncrypted ? "Decrypt Profile" : "Encrypt Profile"}
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '16px' }}>
              {activeProfile.isEncrypted 
                ? "Enter your password to decrypt this profile." 
                : "Enter a password to encrypt this profile with AES-256 encryption."}
            </p>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <ActionButton 
                onClick={() => setShowEncryptModal(false)}
                style={{ backgroundColor: 'transparent' }}
              >
                Cancel
              </ActionButton>
              <ActionButton 
                onClick={handleEncryptProfile}
                disabled={!password}
              >
                {activeProfile.isEncrypted ? "Decrypt" : "Encrypt"}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SecretsManager; 