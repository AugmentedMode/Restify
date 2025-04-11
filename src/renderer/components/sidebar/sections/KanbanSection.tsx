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
        
        todos.forEach(todo => {
          counts[todo.status]++;
        });
        
        setTodoCounts(counts);
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

  // Function to navigate to the Kanban board
  const navigateToKanban = () => {
    // Navigate to the kanban route
    if (window.location.pathname !== '/kanban') {
      window.history.pushState({}, '', '/kanban');
      
      // Dispatch a custom event to notify the App component
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <CollapsibleSection
      title={sectionTitle}
      expanded={expanded}
      onToggle={toggleSection}
      actions={sectionActions}
    >
      <div style={{ padding: '10px' }}>
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.2 }}
            whileHover={{ x: 4 }}
            style={{ 
              cursor: 'pointer',
              padding: '8px',
              marginBottom: '5px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-light)',
              fontSize: '0.85rem'
            }}
            onClick={navigateToKanban}
          >
            Open Kanban Board
          </motion.div>
          
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.85rem'
          }}>
     
          </div>
        </motion.div>
      </div>
    </CollapsibleSection>
  );
};

export default KanbanSection; 