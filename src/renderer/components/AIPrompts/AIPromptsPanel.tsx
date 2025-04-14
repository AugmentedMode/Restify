import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { 
  FaLightbulb, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCopy, 
  FaSearch, 
  FaTimes, 
  FaCheck, 
  FaStar as FaSolidStar, 
  FaRegStar, 
  FaSort, 
  FaSortAlphaDown, 
  FaSortAlphaUp, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaFilter,
  FaTags,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { AIPrompt, AIPromptsService } from '../../services/AIPromptsService';

// Enhanced prompt interface with favorite flag
interface EnhancedAIPrompt extends AIPrompt {
  isFavorite?: boolean;
}

// Update the service with favorite functionality
const FAVORITES_KEY = 'restify-ai-prompts-favorites';

const getFavorites = (): string[] => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load favorite prompts:', error);
    return [];
  }
};

const saveFavorites = (favoriteIds: string[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  } catch (error) {
    console.error('Failed to save favorite prompts:', error);
  }
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1e1e1e;
  color: #f0f0f0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 20px 0;
  margin-bottom: 16px;
  
  svg {
    color: #FF385C;
    margin-right: 12px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const TopControls = styled.div`
  padding: 0 20px;
  margin-bottom: 16px;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #FF385C;
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background-color: rgba(255, 56, 92, 0.2);
    border-color: rgba(255, 56, 92, 0.4);
    color: #FF385C;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const CategoryTabs = styled.div`
  display: flex;
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`;

const TabButton = styled.button<{ isActive: boolean }>`
  background-color: ${props => props.isActive ? 'rgba(255, 56, 92, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.isActive ? '#FF385C' : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.isActive ? 'rgba(255, 56, 92, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
  
  &:hover {
    background-color: ${props => props.isActive ? 'rgba(255, 56, 92, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const SortButton = styled(ControlButton)`
  position: relative;
`;

const SortMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  overflow: hidden;
  width: 200px;
`;

const SortMenuItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &.active {
    background-color: rgba(255, 56, 92, 0.1);
    color: #FF385C;
  }
  
  svg {
    width: 16px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #FF385C;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e82e50;
  }
`;

const PromptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: calc(100% - 80px);
  color: rgba(255, 255, 255, 0.5);
  padding: 0 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #FF385C;
  opacity: 0.7;
`;

const EmptyText = styled.div`
  font-size: 16px;
  max-width: 400px;
  line-height: 1.5;
`;

const PromptCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PromptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const PromptTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const PromptActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #FF385C;
  }
  
  &.success {
    color: #10B981;
  }
  
  &.favorite {
    color: #FFD700;
  }
`;

const PromptContent = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-wrap;
  overflow-y: auto;
  max-height: 200px;
  line-height: 1.5;
  margin: 10px 0;
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.3);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const PromptFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PromptCategory = styled.div`
  display: inline-block;
  background-color: rgba(255, 56, 92, 0.2);
  color: #FF385C;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
`;

const PromptDate = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const PromptFormContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.primary {
    background-color: #FF385C;
    color: white;
    border: none;
    
    &:hover {
      background-color: #e82e50;
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.4);
    }
  }
`;

const CopyFeedback = styled.div`
  position: absolute;
  background-color: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  top: 4px;
  right: 4px;
  z-index: 100;
  animation: fadeOut 1.5s forwards;
  
  @keyframes fadeOut {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

// Sort options
type SortOption = 'title-asc' | 'title-desc' | 'date-asc' | 'date-desc';

interface AIPromptFormData {
  title: string;
  content: string;
  category?: string;
}

interface AIPromptsPanelProps {
  // Will add props later as the feature expands
}

// Add the ExpandButton and ContentPreview components
const ExpandButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  margin-top: 8px;
  align-self: flex-start;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const ContentPreview = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 8px;
  padding: 0 4px;
`;

const AIPromptsPanel: React.FC<AIPromptsPanelProps> = () => {
  const [prompts, setPrompts] = useState<EnhancedAIPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPrompt, setEditingPrompt] = useState<EnhancedAIPrompt | null>(null);
  const [formData, setFormData] = useState<AIPromptFormData>({
    title: '',
    content: '',
    category: ''
  });
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  
  // Get unique categories from prompts
  const categories = useMemo(() => {
    const allCategories = prompts
      .map(prompt => prompt.category)
      .filter((category): category is string => !!category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [prompts]);

  // Load prompts when component mounts
  useEffect(() => {
    loadPrompts();
    loadFavorites();
  }, []);

  const loadPrompts = () => {
    const loadedPrompts = AIPromptsService.getAllPrompts();
    
    // If no prompts exist, create sample prompts
    if (loadedPrompts.length === 0) {
      const samplePrompts = [
        {
          title: "PR Review",
          content: "Can you review my PR? Focus on code quality, potential bugs, and opportunities for improvement or simplification. Highlight anything that might need refactoring or additional tests.",
          category: "Development"
        },
        {
          title: "Code Refactoring",
          content: "Refactor this code to improve readability, performance, and maintainability. Identify any bad practices and explain your changes.",
          category: "Development"
        },
        {
          title: "Debug Help",
          content: "I'm experiencing the following error. Can you help me understand what's causing it and how to fix it?\n\n[PASTE ERROR MESSAGE HERE]\n\nHere's the relevant code:\n\n[PASTE CODE HERE]",
          category: "Development"
        },
        {
          title: "Meeting Summary",
          content: "Summarize the following meeting notes into key points, action items, and decisions made:\n\n[PASTE MEETING NOTES HERE]",
          category: "Productivity"
        }
      ];
      
      const createdPrompts = samplePrompts.map(sample => 
        AIPromptsService.createPrompt(sample.title, sample.content, sample.category)
      );
      
      setPrompts(createdPrompts);
    } else {
      setPrompts(loadedPrompts);
    }
  };

  const loadFavorites = () => {
    const favorites = getFavorites();
    setFavoriteIds(favorites);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Apply all filters and sorting
  const filteredAndSortedPrompts = useMemo(() => {
    // First apply filters
    let result = prompts.map(prompt => ({
      ...prompt,
      isFavorite: favoriteIds.includes(prompt.id)
    }));
    
    // Apply text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(prompt => 
        prompt.title.toLowerCase().includes(searchLower) ||
        prompt.content.toLowerCase().includes(searchLower) ||
        (prompt.category && prompt.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(prompt => prompt.category === selectedCategory);
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
      result = result.filter(prompt => favoriteIds.includes(prompt.id));
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'title-asc':
        return result.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return result.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-asc':
        return result.sort((a, b) => a.createdAt - b.createdAt);
      case 'date-desc':
        return result.sort((a, b) => b.createdAt - a.createdAt);
      default:
        return result;
    }
  }, [prompts, searchTerm, selectedCategory, favoriteIds, showFavoritesOnly, sortOption]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: ''
    });
    setEditingPrompt(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (prompt: EnhancedAIPrompt) => {
    setFormData({
      title: prompt.title,
      content: prompt.content,
      category: prompt.category || ''
    });
    setEditingPrompt(prompt);
    setShowForm(true);
  };

  const handleSave = () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        alert('Please provide both a title and content for your prompt.');
        return;
      }

      if (editingPrompt) {
        // Update existing prompt
        const updatedPrompt = AIPromptsService.savePrompt({
          ...editingPrompt,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category?.trim() || undefined
        });
        
        setPrompts(prev => 
          prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
        );
      } else {
        // Create new prompt
        const newPrompt = AIPromptsService.createPrompt(
          formData.title.trim(),
          formData.content.trim(),
          formData.category?.trim() || undefined
        );
        
        setPrompts(prev => [...prev, newPrompt]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt. Please try again.');
    }
  };

  const handleDelete = (promptId: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      const success = AIPromptsService.deletePrompt(promptId);
      if (success) {
        setPrompts(prev => prev.filter(p => p.id !== promptId));
        
        // Remove from favorites if needed
        if (favoriteIds.includes(promptId)) {
          const newFavorites = favoriteIds.filter(id => id !== promptId);
          setFavoriteIds(newFavorites);
          saveFavorites(newFavorites);
        }
        
        // If we're editing this prompt, close the form
        if (editingPrompt?.id === promptId) {
          resetForm();
        }
      } else {
        alert('Failed to delete prompt. Please try again.');
      }
    }
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyFeedback('Copied!');
      
      // Clear the feedback after animation completes
      setTimeout(() => {
        setCopyFeedback(null);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const toggleFavorite = (promptId: string) => {
    let newFavorites;
    
    if (favoriteIds.includes(promptId)) {
      newFavorites = favoriteIds.filter(id => id !== promptId);
    } else {
      newFavorites = [...favoriteIds, promptId];
    }
    
    setFavoriteIds(newFavorites);
    saveFavorites(newFavorites);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderSortMenu = () => {
    if (!showSortMenu) return null;
    
    return (
      <SortMenu>
        <SortMenuItem 
          className={sortOption === 'title-asc' ? 'active' : ''}
          onClick={() => {
            setSortOption('title-asc');
            setShowSortMenu(false);
          }}
        >
          <FaSortAlphaDown /> Name (A-Z)
        </SortMenuItem>
        <SortMenuItem 
          className={sortOption === 'title-desc' ? 'active' : ''}
          onClick={() => {
            setSortOption('title-desc');
            setShowSortMenu(false);
          }}
        >
          <FaSortAlphaUp /> Name (Z-A)
        </SortMenuItem>
        <SortMenuItem 
          className={sortOption === 'date-desc' ? 'active' : ''}
          onClick={() => {
            setSortOption('date-desc');
            setShowSortMenu(false);
          }}
        >
          <FaSortAmountDown /> Newest First
        </SortMenuItem>
        <SortMenuItem 
          className={sortOption === 'date-asc' ? 'active' : ''}
          onClick={() => {
            setSortOption('date-asc');
            setShowSortMenu(false);
          }}
        >
          <FaSortAmountUp /> Oldest First
        </SortMenuItem>
      </SortMenu>
    );
  };

  const renderPromptsList = () => {
    if (prompts.length === 0) {
      return (
        <EmptyState>
          <EmptyIcon>
            <FaLightbulb />
          </EmptyIcon>
          <EmptyText>
            You don't have any saved AI prompts yet.
            <br />
            Click the "Add New Prompt" button to create your first one.
          </EmptyText>
        </EmptyState>
      );
    }

    if (filteredAndSortedPrompts.length === 0) {
      return (
        <EmptyState>
          <EmptyText>
            No prompts found matching your filters.
          </EmptyText>
        </EmptyState>
      );
    }

    return (
      <PromptGrid>
        {filteredAndSortedPrompts.map(prompt => (
          <PromptCard key={prompt.id}>
            <PromptHeader>
              <PromptTitle title={prompt.title}>{prompt.title}</PromptTitle>
              <PromptActions>
                <ActionButton 
                  onClick={() => toggleFavorite(prompt.id)}
                  title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  className={prompt.isFavorite ? "favorite" : ""}
                >
                  {prompt.isFavorite ? <FaSolidStar /> : <FaRegStar />}
                </ActionButton>
                <ActionButton 
                  onClick={() => handleCopyToClipboard(prompt.content)}
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </ActionButton>
                <ActionButton 
                  onClick={() => handleEdit(prompt)}
                  title="Edit prompt"
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton 
                  onClick={() => handleDelete(prompt.id)}
                  title="Delete prompt"
                >
                  <FaTrash />
                </ActionButton>
              </PromptActions>
            </PromptHeader>
            
            {expandedPromptId === prompt.id ? (
              <>
                <PromptContent>{prompt.content}</PromptContent>
                <ExpandButton onClick={() => setExpandedPromptId(null)}>
                  <FaChevronUp size={10} /> Hide Content
                </ExpandButton>
              </>
            ) : (
              <>
                <ContentPreview title="Click to view full content">
                  {prompt.content.slice(0, 65)}
                  {prompt.content.length > 65 ? '...' : ''}
                </ContentPreview>
                <ExpandButton onClick={() => setExpandedPromptId(prompt.id)}>
                  <FaChevronDown size={10} /> View Content
                </ExpandButton>
              </>
            )}
            
            <PromptFooter>
              {prompt.category && <PromptCategory title={prompt.category}>{prompt.category}</PromptCategory>}
              <PromptDate>{formatDate(prompt.createdAt)}</PromptDate>
            </PromptFooter>
          </PromptCard>
        ))}
      </PromptGrid>
    );
  };

  const renderForm = () => {
    if (!showForm) return null;

    return (
      <PromptFormContainer>
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="E.g., PR Review, Code Refactoring..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Prompt Content</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Enter your prompt here..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="category">Category (optional)</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="E.g., Development, Writing, Research..."
            list="categories"
          />
          <datalist id="categories">
            {categories
              .filter(cat => cat !== 'all')
              .map(category => (
                <option key={category} value={category} />
              ))}
          </datalist>
        </FormGroup>
        
        <FormActions>
          <Button className="secondary" onClick={resetForm}>
            Cancel
          </Button>
          <Button className="primary" onClick={handleSave}>
            <FaCheck size={14} />
            {editingPrompt ? 'Update Prompt' : 'Save Prompt'}
          </Button>
        </FormActions>
      </PromptFormContainer>
    );
  };

  return (
    <Container>
      <Header>
        <FaLightbulb size={24} />
        <Title>AI Prompts</Title>
      </Header>
      
      <TopControls>
        <SearchRow>
          <SearchContainer>
            <SearchIcon>
              <FaSearch size={14} />
            </SearchIcon>
            <SearchInput
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <ClearButton onClick={clearSearch}>
                <FaTimes size={14} />
              </ClearButton>
            )}
          </SearchContainer>

          <SortButton 
            onClick={() => setShowSortMenu(!showSortMenu)}
            title="Sort prompts"
          >
            <FaSort />
            {renderSortMenu()}
          </SortButton>
          
          <ControlButton 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={showFavoritesOnly ? 'active' : ''}
            title={showFavoritesOnly ? "Show all prompts" : "Show favorites only"}
          >
            <FaSolidStar />
          </ControlButton>
        </SearchRow>
        
        {categories.length > 1 && (
          <FilterRow>
            <FaTags size={14} style={{ color: 'rgba(255, 255, 255, 0.5)', marginRight: '8px' }} />
            <CategoryTabs>
              {categories.map(category => (
                <TabButton
                  key={category}
                  isActive={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Categories' : category}
                </TabButton>
              ))}
            </CategoryTabs>
          </FilterRow>
        )}
      </TopControls>
      
      <Content>
        <AddButton onClick={handleAddNew}>
          <FaPlus size={16} />
          Add New Prompt
        </AddButton>
        
        {renderForm()}
        {renderPromptsList()}
        
        {copyFeedback && <CopyFeedback>{copyFeedback}</CopyFeedback>}
      </Content>
    </Container>
  );
};

export default AIPromptsPanel; 