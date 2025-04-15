import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AIPrompts from './index';
import { AIPrompt, AIPromptCategory } from '../../types';

// Sample data for initial testing
const sampleCategories: AIPromptCategory[] = [
  { id: 'development', name: 'Development' },
  { id: 'writing', name: 'Content Writing' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'design', name: 'Design' },
  { id: 'research', name: 'Research' },
];

const samplePrompts: AIPrompt[] = [
  {
    id: uuidv4(),
    title: 'PR Review',
    content: 'Can you review my PR? Focus on code quality, potential bugs, and suggest improvements.',
    category: 'development',
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    updatedAt: Date.now() - 86400000 * 2,
    isFavorite: true,
  },
  {
    id: uuidv4(),
    title: 'React Component Generator',
    content: 'Create a React component that has the following functionality: [describe functionality]. Use TypeScript and styled-components.',
    category: 'development',
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    updatedAt: Date.now() - 86400000 * 4, // 4 days ago
    isFavorite: false,
  },
  {
    id: uuidv4(),
    title: 'Blog Post Introduction',
    content: 'Write an introduction for a blog post about [topic]. The target audience is [audience]. The tone should be [tone].',
    category: 'writing',
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    updatedAt: Date.now() - 86400000 * 7,
    isFavorite: true,
  },
];

// Define local storage keys
const PROMPTS_STORAGE_KEY = 'aiPrompts';
const CATEGORIES_STORAGE_KEY = 'aiPromptCategories';

const AIPromptsContainer: React.FC = () => {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [categories, setCategories] = useState<AIPromptCategory[]>([]);
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Load data from localStorage on first render
  useEffect(() => {
    const savedPrompts = localStorage.getItem(PROMPTS_STORAGE_KEY);
    const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    } else {
      // Use sample data for first time
      setPrompts(samplePrompts);
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Use sample categories for first time
      setCategories(sampleCategories);
    }
  }, []);
  
  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
      // Check if we're in saved mode
      setShowFavorites(window.location.pathname === '/ai-prompts/saved');
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    if (prompts.length > 0) {
      localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
    }
  }, [prompts]);
  
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);
  
  // Handle adding a new prompt 
  const handleAddPrompt = (promptData: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrompt: AIPrompt = {
      id: uuidv4(),
      ...promptData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPrompts([newPrompt, ...prompts]);
  };
  
  // Handle editing a prompt
  const handleEditPrompt = (id: string, promptData: Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updatedPrompts = prompts.map(p => 
      p.id === id 
        ? { 
            ...p, 
            ...promptData, 
            updatedAt: Date.now() 
          } 
        : p
    );
    setPrompts(updatedPrompts);
  };
  
  // Handle deleting a prompt
  const handleDeletePrompt = (id: string) => {
    const updatedPrompts = prompts.filter(p => p.id !== id);
    setPrompts(updatedPrompts);
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = (id: string) => {
    const updatedPrompts = prompts.map(p => 
      p.id === id 
        ? { ...p, isFavorite: !p.isFavorite } 
        : p
    );
    setPrompts(updatedPrompts);
  };
  
  // Handle copying prompt
  const handleCopyPrompt = (prompt: AIPrompt) => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      console.log('Prompt copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy prompt', err);
    });
  };
  
  // Filter prompts if showing saved
  const displayedPrompts = showFavorites 
    ? prompts.filter(p => p.isFavorite)
    : prompts;
  
  return (
    <AIPrompts
      prompts={displayedPrompts}
      categories={categories}
      onAddPrompt={handleAddPrompt}
      onEditPrompt={handleEditPrompt}
      onDeletePrompt={handleDeletePrompt}
      onToggleFavorite={handleToggleFavorite}
      onCopyPrompt={handleCopyPrompt}
    />
  );
};

export default AIPromptsContainer; 