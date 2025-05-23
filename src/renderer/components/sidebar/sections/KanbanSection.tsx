import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaColumns, FaPlus } from 'react-icons/fa';
import {
  ActionButton,
  ActionButtons,
  CollectionHeader,
  CollectionIcon,
  CollectionTitle,
} from '../../../styles/StyledComponents';
import CollapsibleSection from '../components/CollapsibleSection';

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

interface KanbanSectionProps {
  expanded: boolean;
  toggleSection: () => void;
  onAddTodo?: () => void;
  filter?: string;
}

interface Todo {
  id: string;
  text: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  epic?: string;
  createdAt: number;
}

const KanbanSection: React.FC<KanbanSectionProps> = ({
  expanded,
  toggleSection,
  onAddTodo,
  filter,
}) => {
  const [todoCounts, setTodoCounts] = useState({
    todo: 0,
    'in-progress': 0,
    done: 0
  });
  
  const [epicCounts, setEpicCounts] = useState<Record<string, number>>({});
  const [showEpics, setShowEpics] = useState(false);

  // Load todos from localStorage and count them
  useEffect(() => {
    const loadTodos = () => {
      const savedTodos = localStorage.getItem('kanban-todos');
      if (savedTodos) {
        const todos = JSON.parse(savedTodos) as Todo[];
        
        // Count todos by status
        const counts = {
          todo: 0,
          'in-progress': 0,
          done: 0
        };
        
        // Count by epic
        const epics: Record<string, number> = {};
        
        todos.forEach(todo => {
          counts[todo.status]++;
          
          if (todo.epic) {
            epics[todo.epic] = (epics[todo.epic] || 0) + 1;
          }
        });
        
        setTodoCounts(counts);
        setEpicCounts(epics);
      }
    };
    
    // Load initially
    loadTodos();
    
    // Set up an event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kanban-todos') {
        loadTodos();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check for updates every 2 seconds in case the user has the Kanban board open in another tab
    const interval = setInterval(loadTodos, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Navigation function to go to Kanban board
  const navigateToKanban = () => {
    // Navigate to the kanban route
    if (window.location.pathname !== '/kanban') {
      window.history.pushState({}, '', '/kanban');
      
      // Dispatch a custom event to notify the App component
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Handle section header click - navigate directly to kanban board
  const handleSectionClick = () => {
    navigateToKanban();
  };

  const sectionTitle = (
    <CollectionHeader>
      <CollectionIcon>
        <FaColumns />
      </CollectionIcon>
      <CollectionTitle>Kanban Board</CollectionTitle>
    </CollectionHeader>
  );

  const sectionActions = (
    <ActionButtons>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          if (onAddTodo) onAddTodo();
        }}
        title="Add Todo"
        className="action-button"
      >
        <FaPlus />
      </ActionButton>
    </ActionButtons>
  );

  // Get epic background and text colors
  const getEpicColors = (epic: string) => {
    const colorMap: Record<string, { bg: string, text: string }> = {
      'Frontend': { bg: 'rgba(79, 70, 229, 0.1)', text: 'rgb(79, 70, 229)' },
      'Backend': { bg: 'rgba(16, 185, 129, 0.1)', text: 'rgb(16, 185, 129)' },
      'Documentation': { bg: 'rgba(245, 158, 11, 0.1)', text: 'rgb(245, 158, 11)' },
      'Infrastructure': { bg: 'rgba(6, 182, 212, 0.1)', text: 'rgb(6, 182, 212)' },
      'Design': { bg: 'rgba(236, 72, 153, 0.1)', text: 'rgb(236, 72, 153)' },
      'Testing': { bg: 'rgba(124, 58, 237, 0.1)', text: 'rgb(124, 58, 237)' },
    };
    
    return colorMap[epic] || { bg: 'rgba(100, 100, 240, 0.1)', text: 'rgb(100, 100, 240)' };
  };

  return (
    <CollapsibleSection
      title={sectionTitle}
      expanded={expanded}
      onToggle={handleSectionClick}
      actions={sectionActions}
    >
      {/* We still need to provide children for CollapsibleSection */}
      <div></div>
    </CollapsibleSection>
  );
};

export default KanbanSection; 