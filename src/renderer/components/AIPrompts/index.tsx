import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaLightbulb, FaStar, FaTrash, FaEdit, FaPlus, FaSearch, FaChevronDown, FaCheck } from 'react-icons/fa';
import { AIPrompt, AIPromptCategory } from '../../types';
import PromptModal from './PromptModal';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #121212;
  color: #fff;
  padding: 0;
`;

const HeaderSection = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #121212;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  padding: 28px 32px 20px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    color: #FF385C;
    margin-right: 12px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 45px;
  border-radius: 40px;
  border: none;
  background-color: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
`;

const FiltersSection = styled.div`
  padding: 0 32px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
`;

const CategoryTab = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.active ? 'rgba(255, 56, 92, 0.9)' : 'transparent'};
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  border: ${props => props.active ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
  border-radius: 40px;
  font-size: 14px;
  font-weight: ${props => props.active ? '500' : 'normal'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(255, 56, 92, 0.9)' : 'rgba(255, 255, 255, 0.06)'};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 40px;
  border: none;
  background-color: #FF385C;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 2px 10px rgba(255, 56, 92, 0.2);
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #ff1f47;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 56, 92, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ContentSection = styled.div`
  flex: 1;
  overflow: auto;
  padding: 28px 32px;
`;

const PromptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const PromptCard = styled.div<{ copied?: boolean }>`
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  ${props => props.copied && `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      box-shadow: 0 0 0 2px #FF385C;
      opacity: 0;
      animation: pulseHighlight 1.5s ease;
    }
    
    @keyframes pulseHighlight {
      0% { opacity: 0; }
      30% { opacity: 1; }
      100% { opacity: 0; }
    }
  `}
`;

const PromptCardHeader = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  justify-content: space-between;
`;

const PromptTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionIcon = styled.button<{ favorite?: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.favorite ? '#FF385C' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: ${props => props.favorite ? '#FF385C' : '#fff'};
  }
`;

const PromptDescription = styled.div`
  padding: 0 16px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3em; /* Force consistent height: 2 lines x 1.5 line height */
`;

const PromptCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const CategoryBadge = styled.div`
  padding: 4px 10px;
  background-color: rgba(255, 56, 92, 0.15);
  color: #FF385C;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const PromptDate = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
`;

const ExpandedContent = styled.div`
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  white-space: pre-wrap;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 60px 0;
  text-align: center;
  
  svg {
    font-size: 48px;
    margin-bottom: 24px;
    color: rgba(255, 255, 255, 0.1);
  }
  
  h3 {
    margin: 0 0 12px 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 20px;
    font-weight: 500;
  }
  
  p {
    margin: 0 0 28px 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 15px;
  }
`;

const CopyToast = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 9px 20px 9px 16px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  gap: 6px;
  animation: slideUp 2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  
  @keyframes slideUp {
    0% { opacity: 0; transform: translate(-50%, 10px); }
    10% { opacity: 1; transform: translate(-50%, 0); }
    90% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, 0); }
  }
`;

const CheckIcon = styled.div`
  background-color: #FF385C;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: white;
    font-size: 12px;
  }
`;

interface AIPromptsProps {
  prompts: AIPrompt[];
  categories: AIPromptCategory[];
  onAddPrompt: (promptData: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditPrompt: (id: string, promptData: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeletePrompt: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopyPrompt: (prompt: AIPrompt) => void;
}

const AIPrompts: React.FC<AIPromptsProps> = ({
  prompts,
  categories,
  onAddPrompt,
  onEditPrompt,
  onDeletePrompt,
  onToggleFavorite,
  onCopyPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPromptIds, setExpandedPromptIds] = useState<string[]>([]);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  
  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | undefined>(undefined);
  
  // Handle opening the create/edit modal
  const openCreateModal = () => {
    setEditingPrompt(undefined);
    setIsModalOpen(true);
  };
  
  const openEditModal = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };
  
  // Handle saving prompt from modal
  const handleSavePrompt = (promptData: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPrompt) {
      onEditPrompt(editingPrompt.id, promptData);
    } else {
      onAddPrompt(promptData);
    }
    setIsModalOpen(false);
  };
  
  // Handle copying and showing feedback
  const handleCopyPrompt = (prompt: AIPrompt, e?: React.MouseEvent) => {
    // If this was triggered by an event and it has a target that's a button, don't copy
    if (e && (e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Copy the prompt
    onCopyPrompt(prompt);
    
    // Show visual feedback
    setCopiedPromptId(prompt.id);
    
    // Clear feedback after 1.5 seconds
    setTimeout(() => {
      setCopiedPromptId(null);
    }, 1500);
  };
  
  // Filter prompts based on search query and category
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = searchQuery === '' || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === null || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  // Truncate text helpers
  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };
  
  return (
    <Container>
      <HeaderSection>
        <Header>
          <TitleRow>
            <Title>
              <FaLightbulb />
              AI Prompts
            </Title>
            <AddButton onClick={openCreateModal}>
              <FaPlus />
              New Prompt
            </AddButton>
          </TitleRow>
          <SearchContainer>
            <SearchIcon>
              <FaSearch size={18} />
            </SearchIcon>
            <SearchInput 
              placeholder="Search prompts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
        </Header>

        <FiltersSection>
          <FiltersRow>
            <CategoryTabs>
              <CategoryTab 
                active={selectedCategory === null} 
                onClick={() => setSelectedCategory(null)}
              >
                All Prompts
              </CategoryTab>
              
              {categories.map(category => (
                <CategoryTab 
                  key={category.id}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </CategoryTab>
              ))}
            </CategoryTabs>
          </FiltersRow>
        </FiltersSection>
      </HeaderSection>
      
      <ContentSection>
        {filteredPrompts.length === 0 ? (
          <EmptyState>
            <FaLightbulb />
            <h3>No prompts found</h3>
            <p>Try adjusting your search or create a new prompt</p>
            <AddButton onClick={openCreateModal}>
              <FaPlus />
              Add New Prompt
            </AddButton>
          </EmptyState>
        ) : (
          <PromptGrid>
            {filteredPrompts.map(prompt => (
              <PromptCard 
                key={prompt.id} 
                copied={copiedPromptId === prompt.id}
                onClick={(e) => handleCopyPrompt(prompt, e)}
              >
                {copiedPromptId === prompt.id && 
                  <CopyToast>
                    <CheckIcon>
                      <FaCheck />
                    </CheckIcon>
                    Copied to clipboard
                  </CopyToast>
                }
                <PromptCardHeader>
                  <PromptTitle>{prompt.title}</PromptTitle>
                  <ActionIcons>
                    <ActionIcon 
                      favorite={prompt.isFavorite}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(prompt.id);
                      }}
                    >
                      <FaStar size={16} />
                    </ActionIcon>
                    <ActionIcon onClick={(e) => {
                      e.stopPropagation(); 
                      openEditModal(prompt.id);
                    }}>
                      <FaEdit size={16} />
                    </ActionIcon>
                    <ActionIcon onClick={(e) => {
                      e.stopPropagation(); 
                      onDeletePrompt(prompt.id);
                    }}>
                      <FaTrash size={16} />
                    </ActionIcon>
                  </ActionIcons>
                </PromptCardHeader>
                
                <PromptDescription>
                  {prompt.content}
                </PromptDescription>
                
                <PromptCardFooter>
                  <CategoryBadge>
                    {categories.find(c => c.id === prompt.category)?.name || 'Uncategorized'}
                  </CategoryBadge>
                  <PromptDate>{formatDate(prompt.updatedAt)}</PromptDate>
                </PromptCardFooter>
              </PromptCard>
            ))}
          </PromptGrid>
        )}
      </ContentSection>
      
      <PromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePrompt}
        prompt={editingPrompt}
        categories={categories}
      />
    </Container>
  );
};

export default AIPrompts; 