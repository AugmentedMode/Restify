import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaKey,
  FaCheck,
  FaShieldAlt,
  FaDatabase
} from 'react-icons/fa';
import { Secret, SecretsProfile } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Styled components with enhanced design
const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 20px;
  gap: 16px;
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #f5f5f5;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: radial-gradient(circle at top right, rgba(80, 50, 255, 0.05), transparent 60%);
    pointer-events: none;
  }
`;

const GlassPanel = styled(motion.div)`
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const HeaderContainer = styled(GlassPanel)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 12px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.6rem;
  font-weight: 600;
  color: #f5f5f5;
  
  svg {
    filter: drop-shadow(0 0 8px rgba(80, 50, 255, 0.5));
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to right, rgba(40, 40, 40, 0.9), rgba(50, 50, 50, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: #f5f5f5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: linear-gradient(to right, rgba(50, 50, 50, 0.9), rgba(60, 60, 60, 0.9));
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    transform: none;
    cursor: not-allowed;
  }
  
  svg {
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
  }
`;

const DeleteButton = styled(ActionButton)`
  background: linear-gradient(to right, rgba(80, 20, 20, 0.9), rgba(100, 30, 30, 0.9));
  border-color: rgba(255, 100, 100, 0.2);
  
  &:hover {
    background: linear-gradient(to right, rgba(100, 30, 30, 0.9), rgba(120, 40, 40, 0.9));
    border-color: rgba(255, 100, 100, 0.3);
  }
`;

const EncryptButton = styled(ActionButton)`
  background: linear-gradient(to right, rgba(30, 30, 80, 0.9), rgba(40, 40, 100, 0.9));
  border-color: rgba(100, 100, 255, 0.2);
  
  &:hover {
    background: linear-gradient(to right, rgba(40, 40, 100, 0.9), rgba(50, 50, 120, 0.9));
    border-color: rgba(100, 100, 255, 0.3);
  }
`;

const ContentContainer = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: auto;
  padding: 0 4px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const NoSecretsMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 24px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 60px;
  
  svg {
    font-size: 48px;
    opacity: 0.5;
    margin-bottom: 16px;
    filter: drop-shadow(0 0 10px rgba(80, 50, 255, 0.3));
  }
`;

const SecretListTable = styled(GlassPanel)`
  display: flex;
  flex-direction: column;
  background-color: rgba(25, 25, 30, 0.5);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  gap: 16px;
  padding: 16px 24px;
  background-color: rgba(20, 20, 25, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  gap: 16px;
  padding: 16px 24px;
  align-items: center;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    
    &::before {
      opacity: 1;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #7367f0, #ce9ffc);
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const SecretKeyCell = styled.div`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f5f5f5;
  font-size: 15px;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #7367f0, #ce9ffc);
    border-radius: 50%;
    margin-right: 12px;
  }
`;

const SecretValueCell = styled.div`
  padding: 10px 16px;
  background-color: rgba(15, 15, 20, 0.4);
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
  font-size: 14px;
  
  &:hover {
    background-color: rgba(20, 20, 25, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ActionIcon = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background-color: rgba(40, 40, 50, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(60, 60, 70, 0.6);
    color: #f5f5f5;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AddSecretForm = styled(GlassPanel)`
  display: flex;
  gap: 16px;
  padding: 24px;
  margin-bottom: 10px;
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: -30px;
    left: 20px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #7367f0, #ce9ffc);
    border-radius: 6px 6px 0 0;
    font-size: 12px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
  
  &::after {
    content: 'Add New Secret';
    position: absolute;
    top: -30px;
    left: 20px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 1px;
    z-index: 1;
  }
`;

const Input = styled(motion.input)`
  flex: 1;
  padding: 12px 16px;
  background-color: rgba(20, 20, 25, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 14px;
  letter-spacing: 0.3px;
  transition: all 0.2s;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:focus {
    outline: none;
    border-color: rgba(115, 103, 240, 0.5);
    box-shadow: 0 0 0 3px rgba(115, 103, 240, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.1);
    background-color: rgba(30, 30, 35, 0.5);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DescriptionArea = styled(GlassPanel)`
  margin-bottom: 16px;
  padding: 20px 24px;
  line-height: 1.6;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(to bottom, #7367f0, #ce9ffc);
  }
`;

const Toast = styled(motion.div)<{ type: 'success' | 'error' }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95))'
    : 'linear-gradient(135deg, rgba(244, 67, 54, 0.95), rgba(211, 47, 47, 0.95))'};
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px ${props => props.type === 'success' 
    ? 'rgba(76, 175, 80, 0.3)'
    : 'rgba(244, 67, 54, 0.3)'};
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid ${props => props.type === 'success' 
    ? 'rgba(76, 175, 80, 0.5)'
    : 'rgba(244, 67, 54, 0.5)'};
  min-width: 300px;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(GlassPanel)`
  width: 450px;
  padding: 30px;
  background: rgba(25, 25, 30, 0.9);
  border-radius: 16px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
  
  h3 {
    margin-top: 0;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #f5f5f5;
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
      color: #7367f0;
      filter: drop-shadow(0 0 5px rgba(115, 103, 240, 0.5));
    }
  }
`;

const ErrorMessage = styled(motion.div)`
  padding: 12px 16px;
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid #f44336;
  margin-bottom: 20px;
  font-size: 14px;
  color: #f44336;
  border-radius: 0 8px 8px 0;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    x: 20, 
    transition: { duration: 0.2 } 
  }
};

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Clear form fields when profile changes
  useEffect(() => {
    setNewSecretKey('');
    setNewSecretValue('');
    setEditingSecretId(null);
  }, [activeProfile?.id]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleAddSecret = () => {
    if (!activeProfile || !newSecretKey.trim()) return;
    
    // Don't allow adding secrets to encrypted profiles
    if (activeProfile.isEncrypted) {
      showToast('Please decrypt the profile before adding secrets', 'error');
      return;
    }
    
    const newSecret: Secret = {
      id: uuidv4(),
      key: newSecretKey.trim(),
      value: newSecretValue,
      isMasked: true,
    };
    
    onAddSecret(activeProfile.id, newSecret);
    setNewSecretKey('');
    setNewSecretValue('');
    showToast('Secret added successfully', 'success');
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
    
    // Don't allow deleting secrets from encrypted profiles
    if (activeProfile.isEncrypted) {
      showToast('Please decrypt the profile before deleting secrets', 'error');
      return;
    }
    
    onDeleteSecret(activeProfile.id, secretId);
    showToast('Secret deleted successfully', 'success');
  };
  
  const handleEncryptProfile = () => {
    if (!activeProfile) return;
    
    // For encrypting, we need to confirm the password
    if (!activeProfile.isEncrypted && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      if (activeProfile.isEncrypted) {
        onDecryptProfile(activeProfile.id, password);
        showToast('Profile decrypted successfully', 'success');
      } else {
        onEncryptProfile(activeProfile.id, password);
        showToast('Profile encrypted successfully', 'success');
      }
      
      setShowEncryptModal(false);
      setPassword('');
      setConfirmPassword('');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  const handleDeleteProfile = () => {
    if (!activeProfile) return;
    
    if (confirm(`Are you sure you want to delete the profile "${activeProfile.name}"? This action cannot be undone.`)) {
      onDeleteProfile(activeProfile.id);
      showToast('Profile deleted successfully', 'success');
    }
  };

  const handleExportSecrets = () => {
    if (!activeProfile) return;
    
    try {
      onExportSecrets(activeProfile.id);
      showToast('Secrets exported successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to export secrets', 'error');
    }
  };

  if (!activeProfile) {
    return (
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <NoSecretsMessage
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <FaDatabase size={60} />
            <div style={{ fontSize: '22px', fontWeight: 600, marginBottom: '12px' }}>No Secret Profile Selected</div>
            <div style={{ fontSize: '16px', maxWidth: '500px', marginBottom: '20px' }}>
              Select a secrets profile from the sidebar or create a new one to securely store your API keys and tokens.
            </div>
          </motion.div>
          <ActionButton 
            onClick={onReturn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaChevronLeft size={12} /> Return to API Client
          </ActionButton>
        </NoSecretsMessage>
      </Container>
    );
  }

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <HeaderContainer
        variants={itemVariants}
      >
        <HeaderTitle>
          {activeProfile.isEncrypted ? 
            <FaLock size={22} style={{ color: '#7367f0' }} /> : 
            <FaKey size={22} style={{ color: '#7367f0' }} />
          }
          {activeProfile.name}
        </HeaderTitle>
        <div style={{ display: 'flex', gap: '12px' }}>
          <EncryptButton 
            onClick={() => setShowEncryptModal(true)}
            title={activeProfile.isEncrypted ? "Decrypt Profile" : "Encrypt Profile"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {activeProfile.isEncrypted ? <FaUnlock size={14} /> : <FaLock size={14} />}
            {activeProfile.isEncrypted ? "Decrypt" : "Encrypt"}
          </EncryptButton>
          <ActionButton 
            onClick={handleExportSecrets}
            title="Export as .env file"
            disabled={activeProfile.isEncrypted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFileExport size={14} /> Export
          </ActionButton>
          <DeleteButton 
            onClick={handleDeleteProfile}
            title="Delete this profile"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaTrash size={14} /> Delete
          </DeleteButton>
          <ActionButton 
            onClick={onReturn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaChevronLeft size={14} /> Return
          </ActionButton>
        </div>
      </HeaderContainer>
      
      <ContentContainer
        variants={containerVariants}
      >
        {activeProfile.description && (
          <DescriptionArea
            variants={itemVariants}
          >
            {activeProfile.description}
          </DescriptionArea>
        )}
        
        {activeProfile.isEncrypted && (
          <DescriptionArea 
            variants={itemVariants}
            style={{ 
              borderColor: 'rgba(255, 193, 7, 0.3)', 
              background: 'linear-gradient(to right, rgba(255, 193, 7, 0.1), rgba(25, 25, 30, 0.5))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <FaLock size={24} style={{ color: '#ffc107' }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: '#ffc107' }}>Encrypted Profile</div>
                <div>This profile is encrypted. Decrypt it using your password to view or edit secrets.</div>
              </div>
            </div>
          </DescriptionArea>
        )}
        
        <AddSecretForm
          variants={itemVariants}
        >
          <Input
            type="text"
            placeholder="Secret Key (e.g. API_KEY)"
            value={newSecretKey}
            onChange={(e) => setNewSecretKey(e.target.value)}
            disabled={activeProfile.isEncrypted}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
          <Input
            type="text"
            placeholder="Secret Value"
            value={newSecretValue}
            onChange={(e) => setNewSecretValue(e.target.value)}
            disabled={activeProfile.isEncrypted}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
          <ActionButton 
            onClick={handleAddSecret} 
            disabled={!newSecretKey.trim() || activeProfile.isEncrypted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus size={14} /> Add Secret
          </ActionButton>
        </AddSecretForm>
        
        {activeProfile.secrets.length === 0 ? (
          <NoSecretsMessage
            variants={itemVariants}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <FaKey size={40} />
              <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>No secrets yet</div>
              <div>Use the form above to add your first secret key and value.</div>
            </motion.div>
          </NoSecretsMessage>
        ) : (
          <SecretListTable
            variants={itemVariants}
          >
            <TableHeader>
              <div>Key</div>
              <div>Value</div>
              <div>Actions</div>
            </TableHeader>
            <AnimatePresence>
              {activeProfile.secrets.map((secret, index) => (
                <TableRow 
                  key={secret.id}
                  custom={index}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: index * 0.05 }}
                >
                  <SecretKeyCell>{secret.key}</SecretKeyCell>
                  <SecretValueCell>
                    {secret.isMasked ? '••••••••••••••••' : secret.value}
                  </SecretValueCell>
                  <ActionsCell>
                    <ActionIcon 
                      onClick={() => toggleSecretMask(secret.id)}
                      title={secret.isMasked ? "Show value" : "Hide value"}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {secret.isMasked ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => handleDeleteSecret(secret.id)}
                      title="Delete secret"
                      disabled={activeProfile.isEncrypted}
                      style={{ opacity: activeProfile.isEncrypted ? 0.5 : 1 }}
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(244, 67, 54, 0.2)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash size={16} />
                    </ActionIcon>
                  </ActionsCell>
                </TableRow>
              ))}
            </AnimatePresence>
          </SecretListTable>
        )}
      </ContentContainer>
      
      {/* Encrypt Modal */}
      <AnimatePresence>
        {showEncryptModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h3>
                {activeProfile.isEncrypted ? 
                  <><FaUnlock /> Decrypt Profile</> : 
                  <><FaLock /> Encrypt Profile</>
                }
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px', lineHeight: '1.6' }}>
                {activeProfile.isEncrypted 
                  ? "Enter your password to decrypt this profile and view its secrets." 
                  : "Enter a password to encrypt this profile with AES-256 encryption. Make sure to remember this password, as there's no way to recover your secrets if you forget it."}
              </p>
              
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', marginBottom: '16px' }}
                whileFocus={{ scale: 1.02 }}
              />
              
              {!activeProfile.isEncrypted && (
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', marginBottom: '24px' }}
                  whileFocus={{ scale: 1.02 }}
                />
              )}
              
              <AnimatePresence>
                {error && (
                  <ErrorMessage
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {error}
                  </ErrorMessage>
                )}
              </AnimatePresence>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px' }}>
                <ActionButton 
                  onClick={() => {
                    setShowEncryptModal(false);
                    setPassword('');
                    setConfirmPassword('');
                    setError(null);
                  }}
                  style={{ backgroundColor: 'rgba(60, 60, 70, 0.8)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </ActionButton>
                <EncryptButton 
                  onClick={handleEncryptProfile}
                  disabled={!password || (!activeProfile.isEncrypted && password !== confirmPassword)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeProfile.isEncrypted ? <FaUnlock size={14} /> : <FaLock size={14} />}
                  {activeProfile.isEncrypted ? "Decrypt" : "Encrypt"}
                </EncryptButton>
              </div>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
      
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            type={toast.type}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {toast.type === 'success' ? 
              <FaCheck size={18} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '50%' }} /> : 
              <FaTrash size={18} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '50%' }} />
            }
            {toast.message}
          </Toast>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default SecretsManager; 