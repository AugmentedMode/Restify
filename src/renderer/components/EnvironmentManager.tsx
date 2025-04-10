import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronRight,
  FaGlobeAmericas,
  FaCopy,
  FaCheck,
  FaEye,
  FaKey,
  FaSearch,
  FaEllipsisV
} from 'react-icons/fa';
import { Environment } from '../types';
import {
  Button,
  ActionButton,
  CollapsibleSection,
  SectionHeader,
  CollectionHeader,
  CollectionIcon,
  CollectionTitle,
  ActionButtons,
  EmptyHistoryMessage,
} from '../styles/StyledComponents';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components for environment management
const EnvironmentItemContainer = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 4px 0;
  background-color: ${(props) => (props.active ? 'rgba(255, 56, 92, 0.15)' : 'rgba(0, 0, 0, 0.2)')};
  color: ${(props) => (props.active ? '#FF385C' : 'inherit')};
  position: relative;
  
  &:hover {
    background-color: ${(props) => (props.active ? 'rgba(255, 56, 92, 0.2)' : 'rgba(255, 255, 255, 0.05)')};
  }
  
  &:after {
    content: ${(props) => (props.active ? "''" : 'none')};
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #FF385C;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }
`;

const EnvName = styled.div`
  flex: 1;
  font-size: 14px;
  margin-left: 8px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EnvDetailItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 6px 8px;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  margin-bottom: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

const EnvVarKey = styled.span`
  color: #FF385C;
  font-family: 'SF Mono', monospace;
  margin-right: 6px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EnvVarValue = styled.span`
  color: rgba(255, 255, 255, 0.5);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'SF Mono', monospace;
  font-size: 11px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
`;

const EnvironmentSearch = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 6px 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &:focus-within {
    border-color: rgba(255, 56, 92, 0.3);
  }
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: white;
  font-size: 13px;
  width: 100%;
  outline: none;
  margin-left: 8px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  width: 550px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  color: #f5f5f5;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalFooter = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #333;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #bbb;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #f5f5f5;
  font-size: 14px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const VariableRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
`;

const VariablesContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 8px;
  padding-right: 4px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 3px;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: #f5f5f5;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:focus {
    outline: none;
  }
`;

const CancelButton = styled.button`
  background-color: transparent;
  border: 1px solid #555;
  color: #f5f5f5;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const SaveButton = styled.button`
  background-color: #FF385C;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e6324f;
  }
`;

const BadgeContainer = styled.div`
  position: relative;
`;

// Custom styled button for the 3-dot menu
const EllipsisButton = styled(ActionButton)`
  opacity: 1;
  background: transparent;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Context menu for environment actions
const ContextMenu = styled.div`
  position: absolute;
  background-color: #2a2a2a;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ContextMenuItem = styled.div`
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.15);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

interface EnvironmentManagerProps {
  environments: Environment[];
  currentEnvironmentId: string | null;
  onAddEnvironment: (environment: Environment) => void;
  onUpdateEnvironment: (environment: Environment) => void;
  onDeleteEnvironment: (environmentId: string) => void;
  onSelectEnvironment: (environmentId: string | null) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({
  environments,
  currentEnvironmentId,
  onAddEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment,
  onSelectEnvironment,
  expanded,
  onToggleExpanded,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVarsModal, setShowVarsModal] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [viewingEnvironment, setViewingEnvironment] = useState<Environment | null>(null);
  const [environmentName, setEnvironmentName] = useState('');
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    environment: Environment | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    environment: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const openEditModal = (environment?: Environment) => {
    if (environment) {
      setEditingEnvironment(environment);
      setEnvironmentName(environment.name);
      
      const vars = Object.entries(environment.variables).map(([key, value]) => ({
        key,
        value,
      }));
      
      setVariables(vars.length > 0 ? vars : [{ key: '', value: '' }]);
    } else {
      setEditingEnvironment(null);
      setEnvironmentName('');
      setVariables([{ key: '', value: '' }]);
    }
    
    setShowEditModal(true);
  };

  const openVarsModal = (environment: Environment) => {
    setViewingEnvironment(environment);
    setShowVarsModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingEnvironment(null);
    setEnvironmentName('');
    setVariables([{ key: '', value: '' }]);
  };

  const closeVarsModal = () => {
    setShowVarsModal(false);
    setViewingEnvironment(null);
  };

  const handleSave = () => {
    if (!environmentName.trim()) {
      // Show error or validation
      return;
    }

    const variablesObject: Record<string, string> = {};
    variables.forEach(({ key, value }) => {
      if (key.trim()) {
        variablesObject[key.trim()] = value;
      }
    });

    const environment: Environment = {
      id: editingEnvironment ? editingEnvironment.id : uuidv4(),
      name: environmentName.trim(),
      variables: variablesObject,
    };

    if (editingEnvironment) {
      onUpdateEnvironment(environment);
    } else {
      onAddEnvironment(environment);
    }

    closeEditModal();
  };

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const handleRemoveVariable = (index: number) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables.length > 0 ? newVariables : [{ key: '', value: '' }]);
  };

  const handleVariableChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const handleDuplicateEnvironment = (environment: Environment) => {
    const newEnvironment: Environment = {
      id: uuidv4(),
      name: `${environment.name} (Copy)`,
      variables: { ...environment.variables },
    };
    
    onAddEnvironment(newEnvironment);
  };

  // Handle showing context menu
  const handleContextMenu = (e: React.MouseEvent, environment: Environment) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get container position
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate position (offset from the right edge to avoid going off-screen)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setContextMenu({
      visible: true,
      x,
      y,
      environment,
    });
  };

  // Filter environments based on search term
  const filteredEnvironments = environments.filter(env => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Check if name matches
    if (env.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check if any variable key or value matches
    return Object.entries(env.variables).some(
      ([key, value]) => 
        key.toLowerCase().includes(searchLower) || 
        String(value).toLowerCase().includes(searchLower)
    );
  });

  const iconVariants = {
    expanded: { rotate: 0 },
    collapsed: { rotate: -90 },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };
  
  // Render a single environment item
  const renderEnvironmentItem = (environment: Environment) => {
    const isActive = currentEnvironmentId === environment.id;
    const variablesCount = Object.keys(environment.variables).length;
    
    return (
      <motion.div
        key={environment.id}
        variants={itemVariants}
        transition={{ duration: 0.2 }}
      >
        <EnvironmentItemContainer
          active={isActive}
          onClick={() => onSelectEnvironment(environment.id)}
        >
          <FaGlobeAmericas size={14} color={isActive ? '#FF385C' : 'inherit'} />
          
          <EnvName>{environment.name}</EnvName>
          
          {variablesCount > 0 && (
            <div style={{ 
              fontSize: '10px', 
              color: 'rgba(255, 255, 255, 0.5)', 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '1px 6px',
              borderRadius: '10px',
              marginRight: '8px'
            }}>
              {variablesCount} {variablesCount === 1 ? 'var' : 'vars'}
            </div>
          )}
          
          <EllipsisButton
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e, environment);
            }}
            aria-label="Menu"
          >
            <FaEllipsisV size={12} />
          </EllipsisButton>
        </EnvironmentItemContainer>
      </motion.div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative' }}
      onClick={() => {
        if (contextMenu.visible) {
          setContextMenu(prev => ({ ...prev, visible: false }));
        }
      }}
    >
      <CollapsibleSection expanded={expanded}>
        <SectionHeader onClick={onToggleExpanded}>
          <CollectionHeader>
            <CollectionIcon>
              <FaGlobeAmericas />
            </CollectionIcon>
            <CollectionTitle>Environments</CollectionTitle>
          </CollectionHeader>
          <ActionButtons>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                openEditModal();
              }}
              title="Add Environment"
              className="action-button"
            >
              <FaPlus size={12} />
            </ActionButton>
            <motion.div
              animate={expanded ? 'expanded' : 'collapsed'}
              variants={iconVariants}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown size={12} />
            </motion.div>
          </ActionButtons>
        </SectionHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              {filteredEnvironments.length === 0 ? (
                <EmptyHistoryMessage>
                  No environments yet. Create one to get started.
                </EmptyHistoryMessage>
              ) : (
                <div style={{ padding: '0 4px' }}>
                
                  <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredEnvironments.map(environment => renderEnvironmentItem(environment))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleSection>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.environment && (
        <ContextMenu
          style={{
            top: `${contextMenu.y}px`,
            left: `${Math.min(contextMenu.x, containerRef.current?.clientWidth || 0) - 180}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openVarsModal(contextMenu.environment!);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
          >
            <FaEye size={14} color="#61affe" />
            View Variables
          </ContextMenuItem>
          
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openEditModal(contextMenu.environment!);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
          >
            <FaEdit size={14} color="#49cc90" />
            Edit Environment
          </ContextMenuItem>
          
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleDuplicateEnvironment(contextMenu.environment!);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
          >
            <FaCopy size={14} color="#fca130" />
            Duplicate
          </ContextMenuItem>
          
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDeleteEnvironment(contextMenu.environment!.id);
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
          >
            <FaTrash size={14} color="#f93e3e" />
            Delete
          </ContextMenuItem>
        </ContextMenu>
      )}

      {/* Edit/Add Environment Modal */}
      {showEditModal && (
        <Modal onClick={closeEditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingEnvironment ? `Edit "${editingEnvironment.name}"` : 'New Environment'}
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="env-name">Environment Name</Label>
                <Input
                  id="env-name"
                  type="text"
                  value={environmentName}
                  onChange={(e) => setEnvironmentName(e.target.value)}
                  placeholder="e.g., Development, Production, etc."
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <Label>Variables</Label>
                <VariablesContainer>
                  {variables.map((variable, index) => (
                    <VariableRow key={index}>
                      <Input
                        type="text"
                        value={variable.key}
                        onChange={(e) =>
                          handleVariableChange(index, 'key', e.target.value)
                        }
                        placeholder="Variable name"
                        style={{ flex: 1 }}
                      />
                      <Input
                        type="text"
                        value={variable.value}
                        onChange={(e) =>
                          handleVariableChange(index, 'value', e.target.value)
                        }
                        placeholder="Value"
                        style={{ flex: 2 }}
                      />
                      <IconButton
                        onClick={() => handleRemoveVariable(index)}
                        title="Remove Variable"
                      >
                        <FaTrash size={14} />
                      </IconButton>
                    </VariableRow>
                  ))}
                </VariablesContainer>
                <div style={{ marginTop: '8px' }}>
                  <Button onClick={handleAddVariable} type="button">
                    <FaPlus size={12} style={{ marginRight: '4px' }} /> Add Variable
                  </Button>
                </div>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closeEditModal}>Cancel</CancelButton>
              <SaveButton onClick={handleSave}>Save</SaveButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* View Variables Modal */}
      {showVarsModal && viewingEnvironment && (
        <Modal onClick={closeVarsModal}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
            <ModalHeader>
              <ModalTitle>
                {viewingEnvironment.name} Variables
              </ModalTitle>
            </ModalHeader>
            <ModalBody style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Object.keys(viewingEnvironment.variables).length === 0 ? (
                <div style={{ 
                  padding: '30px 20px', 
                  textAlign: 'center', 
                  color: 'rgba(255,255,255,0.5)' 
                }}>
                  No variables defined in this environment.
                </div>
              ) : (
                <div>
                  {Object.entries(viewingEnvironment.variables).map(([key, value]) => (
                    <EnvDetailItem key={key} title={`${key}: ${value}`}>
                      <FaKey size={10} style={{ color: '#FF385C', marginRight: '8px' }} />
                      <EnvVarKey>{key}</EnvVarKey>
                      <EnvVarValue>{value}</EnvVarValue>
                    </EnvDetailItem>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                onClick={() => {
                  closeVarsModal();
                  openEditModal(viewingEnvironment);
                }} 
                style={{ marginRight: 'auto' }}
              >
                <FaEdit size={12} style={{ marginRight: '4px' }} /> Edit Variables
              </Button>
              <CancelButton onClick={closeVarsModal}>Close</CancelButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default EnvironmentManager; 