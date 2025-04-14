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
  FaServer,
  FaBan,
  FaCopy,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { Secret, SecretsProfile } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
  background-color: #121212;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #f5f5f5;
  overflow: hidden; /* Prevent outer container from scrolling */
`;

const ScrollWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 20px 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #121212;
  position: sticky;
  top: 0;
  z-index: 10;
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
  background: linear-gradient(to right, rgba(30, 30, 30, 0.9), rgba(34, 34, 34, 0.9));
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
    background: linear-gradient(to right, rgba(40, 40, 40, 0.9), rgba(44, 44, 44, 0.9));
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
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoSecretsMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 40px;
  background: rgba(30, 30, 30, 0.3);
  border-radius: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
`;

const NoSecretsIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(30, 30, 30, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.5);
  border: 1px dashed rgba(255, 255, 255, 0.2);
`;

const SecretListTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 10px;
  background-color: rgba(26, 26, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(90deg, rgba(30, 30, 30, 0.9), rgba(25, 25, 25, 0.9));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.3px;
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  gap: 8px;
  padding: 14px 16px;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SecretKeyText = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  background-color: rgba(255, 255, 255, 0.05);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SecretValueCell = styled.div`
  padding: 8px 12px;
  background-color: rgba(20, 20, 20, 0.4);
  border-radius: 6px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    background-color: rgba(20, 20, 20, 0.6);
  }
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
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.8);
    color: #f5f5f5;
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AddSecretForm = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
  background: rgba(30, 30, 30, 0.5);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const AddSecretTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
`;

const FormRow = styled.div`
  display: flex;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const InputLabel = styled.label`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 2px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  background-color: #222222;
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

const StyledInput = styled(Input)`
  padding: 10px 14px;
  background-color: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #f5f5f5;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(50, 144, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(50, 144, 255, 0.2);
    background-color: rgba(25, 25, 25, 0.8);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled(ActionButton)`
  padding: 10px 16px;
  background: linear-gradient(90deg, rgba(255, 56, 92, 0.7), rgba(220, 40, 70, 0.7));
  border-color: rgba(255, 56, 92, 0.3);
  
  &:hover:not(:disabled) {
    background: linear-gradient(90deg, rgba(255, 56, 92, 0.8), rgba(230, 50, 80, 0.8));
    border-color: rgba(255, 56, 92, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DescriptionArea = styled.div`
  margin-top: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
`;

const SecurityNoticeContainer = styled(motion.div)`
  margin-bottom: 24px;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(25, 25, 25, 0.8), rgba(20, 20, 20, 0.9));
  border: 1px solid rgba(255, 56, 92, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 56, 92, 0.1);
`;

const SecurityHeader = styled.div`
  background: linear-gradient(90deg, rgba(255, 56, 92, 0.8), rgba(200, 40, 70, 0.8));
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  justify-content: space-between;
`;

const SecurityHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SecurityTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const CaretButton = styled(motion.div)`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SecurityContent = styled(motion.div)`
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
`;

const SecurityFeatures = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const SecurityFeature = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(30, 30, 30, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1;
  min-width: 200px;
`;

const IconWrapper = styled(motion.div)`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 56, 92, 0.7), rgba(200, 40, 70, 0.7));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Add a Toast notification component
const Toast = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  background-color: ${props => props.type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)'};
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  font-size: 14px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: fadeInUp 0.3s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Add these styled components before using them in the EncryptModal
const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #dddddd;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
  }
`;

const ActionPinkButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: #FF385C;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    background: #E93455;
    transform: translateY(-1px);
  }
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [securityInfoExpanded, setSecurityInfoExpanded] = useState(() => {
    // Try to retrieve the saved preference from localStorage, default to true if not found
    const saved = localStorage.getItem('restify-security-info-expanded');
    return saved !== null ? JSON.parse(saved) : true;
  });

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

  // Save expanded/collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('restify-security-info-expanded', JSON.stringify(securityInfoExpanded));
  }, [securityInfoExpanded]);

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
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('Copied to clipboard', 'success');
      })
      .catch((err: Error) => {
        console.error('Failed to copy: ', err);
      });
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
      <Container>
        <HeaderContainer>
          <HeaderTitle>
            <FaKey size={22} />
            Secrets Manager
          </HeaderTitle>
          <ActionButton onClick={onReturn}>
            <FaChevronLeft size={12} /> Return to API Client
          </ActionButton>
        </HeaderContainer>
        
        <ScrollWrapper>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              height: 'calc(100vh - 200px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 56, 92, 0.1), rgba(25, 25, 25, 0.3))',
                borderRadius: '16px',
                padding: '40px',
                maxWidth: '600px',
                width: '100%',
                border: '1px solid rgba(255, 56, 92, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(255, 56, 92, 0.1)',
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 56, 92, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  border: '1px dashed rgba(255, 56, 92, 0.3)',
                }}
              >
                <FaKey size={40} color="rgba(255, 56, 92, 0.8)" />
              </motion.div>
              
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '16px', 
                fontWeight: 600,
                background: 'linear-gradient(120deg, #ffffff, #FF385C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Manage Your API Secrets
              </h2>
              
              <p style={{ 
                fontSize: '16px', 
                color: 'rgba(255, 255, 255, 0.7)', 
                maxWidth: '450px',
                margin: '0 auto 30px',
                lineHeight: 1.6 
              }}>
                Select an existing profile from the sidebar or create a new one to securely store your API keys, tokens, and other sensitive information.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ y: -3, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ y: 0 }}
                  onClick={onImportSecrets}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    background: 'linear-gradient(90deg, #FF385C, #D02A49)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(255, 56, 92, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  <FaFileImport size={16} />
                  Import from .env file
                </motion.button>
                
                <motion.button
                  whileHover={{ y: -3, boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ y: 0 }}
                  onClick={onImportSecrets}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <FaPlus size={16} />
                  Create New Profile
                </motion.button>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                margin: '40px auto 0',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxWidth: 'fit-content'
              }}>
                <FaLock size={14} color="rgba(255, 56, 92, 0.6)" />
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Your secrets stay local and are encrypted with AES-256. 
                </span>
              </div>
            </motion.div>
          </motion.div>
        </ScrollWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>
          {activeProfile.isEncrypted ? <FaLock size={18} color="#FF385C" /> : <FaKey size={18} color="#FF385C" />}
          {activeProfile.name}
        </HeaderTitle>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ActionButton 
            onClick={() => setShowEncryptModal(true)}
            title={activeProfile.isEncrypted ? "Decrypt Profile" : "Encrypt Profile"}
            style={{ borderColor: 'rgba(255, 56, 92, 0.3)' }}
          >
            {activeProfile.isEncrypted ? <FaUnlock size={12} /> : <FaLock size={12} />}
            {activeProfile.isEncrypted ? "Decrypt" : "Encrypt"}
          </ActionButton>
          <ActionButton 
            onClick={handleExportSecrets}
            title="Export as .env file"
            disabled={activeProfile.isEncrypted}
            style={{ borderColor: 'rgba(255, 56, 92, 0.3)' }}
          >
            <FaFileExport size={12} /> Export
          </ActionButton>
          <ActionButton 
            onClick={handleDeleteProfile}
            title="Delete this profile"
            style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', borderColor: 'rgba(244, 67, 54, 0.3)', color: '#f44336' }}
          >
            <FaTrash size={12} /> Delete
          </ActionButton>
          <ActionButton onClick={onReturn}>
            <FaChevronLeft size={12} /> Return
          </ActionButton>
        </div>
      </HeaderContainer>
      
      <ScrollWrapper>
        <SecurityNoticeContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <SecurityHeader onClick={() => setSecurityInfoExpanded(!securityInfoExpanded)}>
            <SecurityHeaderContent>
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              >
                <FaShieldAlt size={22} color="#ffffff" />
              </motion.div>
              <SecurityTitle>AES-256 Local Encryption</SecurityTitle>
            </SecurityHeaderContent>
            <CaretButton
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {securityInfoExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
            </CaretButton>
          </SecurityHeader>
          
          <AnimatePresence initial={false}>
            {securityInfoExpanded && (
              <SecurityContent
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <p>All secrets are encrypted with industry-standard AES-256 algorithm implemented entirely client-side. The encryption/decryption process happens exclusively on your machine.</p>
                
                <SecurityFeatures>
                  <SecurityFeature
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <IconWrapper
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <FaLock size={18} color="#ffffff" />
                    </IconWrapper>
                    <div>
                      <strong>Zero-Knowledge Architecture</strong>
                      <div style={{ fontSize: "13px", opacity: 0.8 }}>Keys never leave your device</div>
                    </div>
                  </SecurityFeature>
                  
                  <SecurityFeature
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <IconWrapper
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <FaBan size={18} color="#ffffff" />
                    </IconWrapper>
                    <div>
                      <strong>No Remote Storage</strong>
                      <div style={{ fontSize: "13px", opacity: 0.8 }}>Stored only in local filesystem</div>
                    </div>
                  </SecurityFeature>
                  
                  <SecurityFeature
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <IconWrapper
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 4 }}
                    >
                      <FaServer size={18} color="#ffffff" />
                    </IconWrapper>
                    <div>
                      <strong>No Network Transmission</strong>
                      <div style={{ fontSize: "13px", opacity: 0.8 }}>Secrets remain offline</div>
                    </div>
                  </SecurityFeature>
                </SecurityFeatures>
              </SecurityContent>
            )}
          </AnimatePresence>
        </SecurityNoticeContainer>
        
        <ContentContainer>
          {activeProfile.description && !activeProfile.description.startsWith('Imported from .env file') && (
            <DescriptionArea>
              {activeProfile.description}
            </DescriptionArea>
          )}
          
          {activeProfile.isEncrypted && (
            <DescriptionArea style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', borderColor: 'rgba(255, 193, 7, 0.3)', color: '#ffc107' }}>
              <FaLock style={{ marginRight: '8px' }} /> This profile is encrypted. Decrypt it to view or edit secrets.
            </DescriptionArea>
          )}
          
          <AddSecretForm
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AddSecretTitle>
              <FaPlus size={14} />
              Add New Secret
            </AddSecretTitle>
            
            <FormRow>
              <FormGroup>
                <InputLabel>Secret Key</InputLabel>
                <StyledInput
                  type="text"
                  placeholder="e.g. API_KEY, DATABASE_URL"
                  value={newSecretKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSecretKey(e.target.value)}
                  disabled={activeProfile.isEncrypted}
                />
              </FormGroup>
              
              <FormGroup>
                <InputLabel>Secret Value</InputLabel>
                <StyledInput
                  type="text"
                  placeholder="Enter the secret value"
                  value={newSecretValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSecretValue(e.target.value)}
                  disabled={activeProfile.isEncrypted}
                />
              </FormGroup>
              
              <div style={{ alignSelf: 'flex-end' }}>
                <AddButton 
                  onClick={handleAddSecret} 
                  disabled={!newSecretKey.trim() || activeProfile.isEncrypted}
                >
                  <FaPlus size={12} /> Add Secret
                </AddButton>
              </div>
            </FormRow>
          </AddSecretForm>
          
          {activeProfile.secrets.length === 0 ? (
            <NoSecretsMessage
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <NoSecretsIcon>
                <FaKey size={24} />
              </NoSecretsIcon>
              <div>No secrets yet in this profile</div>
              <div style={{ fontSize: '14px', opacity: 0.7, maxWidth: '400px', margin: '0 auto' }}>
                Add your first secret using the form above. Secrets are stored securely and never leave your device.
              </div>
            </NoSecretsMessage>
          ) : (
            <SecretListTable>
              <TableHeader>
                <div>Key</div>
                <div>Value</div>
                <div>Actions</div>
              </TableHeader>
              {activeProfile.secrets.map((secret, index) => (
                <TableRow 
                  key={secret.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <SecretKeyCell>
                    <SecretKeyText>{secret.key}</SecretKeyText>
                  </SecretKeyCell>
                  <SecretValueCell>
                    {secret.isMasked ? '•'.repeat(Math.min(16, secret.value.length || 16)) : secret.value}
                  </SecretValueCell>
                  <ActionsCell>
                    <ActionIcon 
                      onClick={() => toggleSecretMask(secret.id)}
                      title={secret.isMasked ? "Show value" : "Hide value"}
                    >
                      {secret.isMasked ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => copyToClipboard(secret.value)}
                      title="Copy value to clipboard"
                    >
                      <FaCopy size={14} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => handleDeleteSecret(secret.id)}
                      title="Delete secret"
                      disabled={activeProfile.isEncrypted}
                      style={{ opacity: activeProfile.isEncrypted ? 0.5 : 1 }}
                    >
                      <FaTrash size={14} />
                    </ActionIcon>
                  </ActionsCell>
                </TableRow>
              ))}
            </SecretListTable>
          )}
        </ContentContainer>
      </ScrollWrapper>
      
      {/* Encrypt Modal */}
      {showEncryptModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: '450px',
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 30px rgba(255, 56, 92, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '10px',
              marginTop: 0,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#FF385C',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(255, 56, 92, 0.3)',
              }}>
                {activeProfile?.isEncrypted ? <FaUnlock size={18} color="white" /> : <FaLock size={18} color="white" />}
              </div>
              {activeProfile?.isEncrypted ? "Decrypt Profile" : "Encrypt Profile"}
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: 'rgba(255, 255, 255, 0.7)', 
              margin: '0 0 20px 0',
              lineHeight: 1.5 
            }}>
              {activeProfile?.isEncrypted 
                ? "Enter your password to decrypt this profile." 
                : "Enter a password to encrypt this profile with AES-256 encryption. Make sure to remember this password, as there's no way to recover your secrets if you forget it."}
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <InputLabel htmlFor="encrypt-password">Password</InputLabel>
              <StyledInput
                id="encrypt-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            {!activeProfile?.isEncrypted && (
              <div style={{ marginBottom: '16px' }}>
                <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
                <StyledInput
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}
            
            {error && (
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                borderLeft: '4px solid #f44336',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#f44336',
                borderRadius: '4px',
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px' }}>
              <CancelButton 
                onClick={() => {
                  setShowEncryptModal(false);
                  setPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
              >
                Cancel
              </CancelButton>
              <ActionPinkButton 
                onClick={handleEncryptProfile}
                disabled={!password || (!activeProfile?.isEncrypted && password !== confirmPassword)}
              >
                {activeProfile?.isEncrypted ? 
                  <><FaUnlock size={14} style={{ marginRight: '6px' }} /> Decrypt</> : 
                  <><FaLock size={14} style={{ marginRight: '6px' }} /> Encrypt</>}
              </ActionPinkButton>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notifications */}
      {toast && (
        <Toast type={toast.type}>
          {toast.type === 'success' ? <FaCheck size={16} /> : <FaTrash size={16} />}
          {toast.message}
        </Toast>
      )}
    </Container>
  );
};

export default SecretsManager; 