import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaCodeBranch, FaCode, FaLink, FaTag, FaGithub, FaChevronLeft, FaArchive, FaEyeSlash, FaTrashRestore } from 'react-icons/fa';
import styled from 'styled-components';

// Define the Todo item type
interface Todo {
  id: string;
  text: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  epic?: string;
  createdAt: number;
  repo?: string;
  branch?: string;
  codeRef?: string;
  assignee?: string;
  archived?: boolean;
  archivedAt?: number;
}

// Styled components with ResponsePanel-inspired dark theme
const KanbanContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 16px;
  background-color: #1e1e1e;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #f5f5f5;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
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
  font-size: 1.5rem;
  font-weight: 500;
  color: #f5f5f5;
`;

const ReturnButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(to right, rgba(36, 36, 36, 0.9), rgba(40, 40, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 6px 12px;
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

const Column = styled.div`
  flex: 1;
  background-color: #2a2a2a;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  max-width: 350px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  height: calc(100vh - 110px); /* Set a fixed height based on viewport */
`;

const ColumnHeader = styled.div`
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Badge = styled.span<{ status: string }>`
  background-color: ${props => 
    props.status === 'todo' ? 'rgba(255, 56, 92, 0.15)' : 
    props.status === 'in-progress' ? 'rgba(255, 169, 64, 0.15)' : 
    'rgba(63, 185, 80, 0.15)'
  };
  color: ${props => 
    props.status === 'todo' ? '#FF385C' : 
    props.status === 'in-progress' ? '#ffa940' : 
    '#3fb950'
  };
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
`;

const TaskList = styled.div`
  margin-top: 12px;
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 12px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const Task = styled.div<{ status: string; priority?: string; isEpic?: boolean }>`
  background-color: #1e1e1e;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  ${props => props.priority === 'high' && `
    border-left: 3px solid #FF385C;
  `}
  
  ${props => props.priority === 'medium' && `
    border-left: 3px solid #ffa940;
  `}
  
  ${props => props.priority === 'low' && `
    border-left: 3px solid #3fb950;
  `}
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TaskId = styled.div`
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.75rem;
  color: #bbb;
`;

const TaskContent = styled.div`
  font-size: 0.85rem;
  word-break: break-word;
  line-height: 1.4;
  color: #f5f5f5;
  margin: 10px 0;
  padding: 0 2px;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${Task}:hover & {
    opacity: 1;
  }
  justify-content: flex-end;
`;

const TaskMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.75rem;
  color: #bbb;
`;

const TaskTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`;

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding-top: 8px;
`;

const TaskDate = styled.span`
  font-size: 0.7rem;
  color: #bbb;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PriorityBadge = styled.span<{ priority?: string }>`
  background-color: ${props => 
    props.priority === 'high' ? 'rgba(255, 56, 92, 0.1)' : 
    props.priority === 'medium' ? 'rgba(255, 169, 64, 0.1)' : 
    'rgba(63, 185, 80, 0.1)'
  };
  color: ${props => 
    props.priority === 'high' ? '#FF385C' : 
    props.priority === 'medium' ? '#ffa940' : 
    '#3fb950'
  };
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EpicTag = styled.span<{ epic?: string }>`
  background-color: ${props => {
    switch(props.epic) {
      case 'Frontend': return 'rgba(255, 110, 192, 0.1)';
      case 'Backend': return 'rgba(31, 111, 235, 0.1)';
      case 'Infrastructure': return 'rgba(163, 113, 247, 0.1)';
      case 'Documentation': return 'rgba(46, 160, 67, 0.1)';
      case 'Design': return 'rgba(191, 71, 17, 0.1)';
      case 'Testing': return 'rgba(63, 185, 80, 0.1)';
      default: return 'rgba(110, 118, 129, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.epic) {
      case 'Frontend': return '#ff6ec0';
      case 'Backend': return '#79c0ff';
      case 'Infrastructure': return '#a371f7';
      case 'Documentation': return '#7ee787';
      case 'Design': return '#ff7b54';
      case 'Testing': return '#7ee787';
      default: return '#bbb';
    }
  }};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RepoTag = styled.span`
  background-color: rgba(255, 255, 255, 0.08);
  color: #bbb;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BranchTag = styled.span`
  background-color: rgba(255, 255, 255, 0.08);
  color: #bbb;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #bbb;
  
  &:hover {
    color: #f5f5f5;
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

const AddTaskButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255, 56, 92, 0.1);
  border: 1px solid rgba(255, 56, 92, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  width: 100%;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  font-weight: 500;
  color: #FF385C;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.15);
    border-color: rgba(255, 56, 92, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
`;

const NewTaskInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: 12px;
  background-color: #2a2a2a;
  font-size: 0.85rem;
  color: #f5f5f5;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
  
  &::placeholder {
    color: #888;
  }
`;

const EpicSelector = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  background-color: #2a2a2a;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 8px;
  width: 100%;
`;

const EpicOption = styled.div<{ isSelected?: boolean }>`
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #f5f5f5;
  background-color: ${props => props.isSelected ? 'rgba(255, 56, 92, 0.15)' : 'transparent'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// Epic options for dropdown
const epicOptions = [
  'Frontend',
  'Backend',
  'Documentation',
  'Infrastructure',
  'Design',
  'Testing'
];

// Repo options for GitHub-like integration
const repoOptions = [
  'main-app',
  'api-service',
  'infrastructure',
  'docs',
  'design-system'
];

// Extended sample data with code-related fields
const initialTodoSamples: Todo[] = [
  { 
    id: 'GH-1', 
    text: 'Implement JWT authentication flow for API endpoints', 
    status: 'todo', 
    priority: 'high', 
    epic: 'Backend',
    createdAt: Date.now() - 86400000,
    repo: 'api-service',
    branch: 'feature/auth',
    codeRef: 'src/auth/jwt.ts',
    assignee: 'sarah'
  },
  { 
    id: 'GH-2', 
    text: 'Fix CORS issues when making cross-origin requests', 
    status: 'in-progress', 
    priority: 'medium', 
    epic: 'Backend',
    createdAt: Date.now() - 172800000,
    repo: 'api-service',
    branch: 'fix/cors-headers',
    codeRef: 'src/middleware/cors.ts',
    assignee: 'john'
  },
  { 
    id: 'GH-3', 
    text: 'Design database schema for user profile information', 
    status: 'done', 
    priority: 'low', 
    epic: 'Design',
    createdAt: Date.now() - 259200000,
    repo: 'main-app',
    branch: 'main',
    codeRef: 'database/schema.sql'
  },
  { 
    id: 'GH-4', 
    text: 'Create responsive layout for request history panel', 
    status: 'todo', 
    priority: 'medium', 
    epic: 'Frontend',
    createdAt: Date.now() - 345600000,
    repo: 'main-app',
    branch: 'feature/request-history',
    codeRef: 'src/components/History.tsx',
    assignee: 'alex'
  },
  { 
    id: 'GH-5', 
    text: 'Write API documentation using OpenAPI specification', 
    status: 'in-progress', 
    priority: 'low', 
    epic: 'Documentation',
    createdAt: Date.now() - 432000000,
    repo: 'docs',
    branch: 'feature/openapi-docs',
    codeRef: 'api/openapi.yaml',
    assignee: 'maya'
  },
];

// Add ArchiveButton component
const ArchiveButton = styled(ActionButton)`
  color: #007acc;
  
  &:hover {
    color: #3b99fc;
    background-color: rgba(59, 153, 252, 0.08);
  }
`;

// Add ArchivedColumn component
const ArchivedColumn = styled.div`
  flex: 1;
  background-color: #1e1e1e;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const ArchivedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ArchivedTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ArchivedTaskList = styled(TaskList)`
  max-height: 300px;
`;

const ArchivedTask = styled(Task)`
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

// Create a footer component to hold the Add Task button
const ColumnFooter = styled.div`
  margin-top: auto;
  position: sticky;
  bottom: 0;
  background-color: #2a2a2a;
  padding-top: 8px;
`;

// Main Kanban component
const TodoKanban: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [addingStatus, setAddingStatus] = useState<'todo' | 'in-progress' | 'done' | null>(null);
  const [showEpicSelect, setShowEpicSelect] = useState<string | null>(null);
  const [showRepoSelect, setShowRepoSelect] = useState<string | null>(null);
  const [newTaskCounter, setNewTaskCounter] = useState<number>(6); // For GH-6, GH-7, etc.
  const [showArchived, setShowArchived] = useState<boolean>(false);
  
  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('kanban-todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
      
      // Find the highest task number to continue the sequence
      const highestId = JSON.parse(savedTodos).reduce((max: number, todo: Todo) => {
        const idNum = parseInt(todo.id.replace('GH-', ''), 10);
        return isNaN(idNum) ? max : Math.max(max, idNum);
      }, 0);
      
      setNewTaskCounter(highestId + 1);
    } else {
      // Set sample todos
      setTodos(initialTodoSamples);
      localStorage.setItem('kanban-todos', JSON.stringify(initialTodoSamples));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kanban-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (status: 'todo' | 'in-progress' | 'done') => {
    if (newTaskText.trim() === '') return;
    
    const newTodo: Todo = {
      id: `GH-${newTaskCounter}`,
      text: newTaskText,
      status,
      priority: 'medium',
      createdAt: Date.now(),
    };
    
    setTodos([...todos, newTodo]);
    setNewTaskText('');
    setAddingStatus(null);
    setNewTaskCounter(prev => prev + 1);
  };

  const editTodo = (id: string, newText: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: newText } : todo
    ));
    setEditingId(null);
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const moveTodo = (id: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, status: newStatus } : todo
    ));
  };

  // Navigation function to return to main view
  const returnToMainView = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  // Function to get formatted date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Cycle through priority levels
  const cyclePriority = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(todo.priority || 'medium');
        const nextIndex = (currentIndex + 1) % priorities.length;
        return { ...todo, priority: priorities[nextIndex] };
      }
      return todo;
    }));
  };

  // Toggle epic dropdown
  const toggleEpicSelect = (id: string) => {
    setShowEpicSelect(showEpicSelect === id ? null : id);
    // Close other dropdowns
    if (showRepoSelect === id) {
      setShowRepoSelect(null);
    }
  };

  // Toggle repo dropdown
  const toggleRepoSelect = (id: string) => {
    setShowRepoSelect(showRepoSelect === id ? null : id);
    // Close other dropdowns
    if (showEpicSelect === id) {
      setShowEpicSelect(null);
    }
  };

  // Set epic for a task
  const setEpic = (id: string, epic: string | undefined) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, epic } : todo
    ));
    setShowEpicSelect(null);
  };

  // Set repo for a task
  const setRepo = (id: string, repo: string | undefined) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, repo } : todo
    ));
    setShowRepoSelect(null);
  };

  // Archive a task instead of deleting it
  const archiveTask = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, archived: true, archivedAt: Date.now() } : todo
    ));
  };

  // Restore an archived task
  const restoreTask = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, archived: false, archivedAt: undefined } : todo
    ));
  };

  // Toggle archived tasks visibility
  const toggleArchived = () => {
    setShowArchived(!showArchived);
  };

  // Get active (non-archived) todos for a column
  const getActiveTodos = (status: 'todo' | 'in-progress' | 'done') => {
    return todos.filter(todo => todo.status === status && !todo.archived);
  };

  // Get all archived todos
  const getArchivedTodos = () => {
    return todos.filter(todo => todo.archived).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
  };

  // Render a single task
  const renderTask = (todo: Todo, isArchived: boolean = false) => {
    if (editingId === todo.id) {
      return (
        <NewTaskInput
          autoFocus
          value={todo.text}
          onChange={(e) => {
            const newTodos = [...todos];
            const todoIndex = newTodos.findIndex(t => t.id === todo.id);
            newTodos[todoIndex].text = e.target.value;
            setTodos(newTodos);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              editTodo(todo.id, todo.text);
            } else if (e.key === 'Escape') {
              setEditingId(null);
            }
          }}
          onBlur={() => editTodo(todo.id, todo.text)}
        />
      );
    }

    const TaskComponent = isArchived ? ArchivedTask : Task;

    return (
      <TaskComponent 
        key={todo.id}
        status={todo.status}
        priority={todo.priority}
        isEpic={!!todo.epic}
        draggable={!isArchived}
        onDragStart={(e) => {
          if (!isArchived) {
            e.dataTransfer.setData('todoId', todo.id);
          }
        }}
      >
        <TaskHeader>
          <TaskId>{todo.id}</TaskId>
          <TaskActions>
            {!isArchived ? (
              <>
                <ActionButton onClick={() => cyclePriority(todo.id)} title="Change priority">
                  <FaTag size={12} />
                </ActionButton>
                <ActionButton onClick={() => toggleEpicSelect(todo.id)} title="Set epic">
                  <FaCodeBranch size={12} />
                </ActionButton>
                <ActionButton onClick={() => toggleRepoSelect(todo.id)} title="Set repository">
                  <FaGithub size={12} />
                </ActionButton>
                <ActionButton onClick={() => setEditingId(todo.id)} title="Edit task">
                  <FaEdit size={12} />
                </ActionButton>
                <ArchiveButton onClick={() => archiveTask(todo.id)} title="Archive task">
                  <FaArchive size={12} />
                </ArchiveButton>
                <ActionButton onClick={() => deleteTodo(todo.id)} title="Delete task">
                  <FaTrash size={12} />
                </ActionButton>
              </>
            ) : (
              <>
                <ActionButton onClick={() => restoreTask(todo.id)} title="Restore task">
                  <FaTrashRestore size={12} />
                </ActionButton>
                <ActionButton onClick={() => deleteTodo(todo.id)} title="Delete permanently">
                  <FaTrash size={12} />
                </ActionButton>
              </>
            )}
          </TaskActions>
        </TaskHeader>
        
        <TaskContent onDoubleClick={() => !isArchived && setEditingId(todo.id)}>
          {todo.text}
        </TaskContent>
        
        <TaskMeta>
          <TaskTags>
            {todo.priority && (
              <PriorityBadge priority={todo.priority}>
                <FaTag size={10} /> {todo.priority}
              </PriorityBadge>
            )}
            
            {todo.epic && (
              <EpicTag epic={todo.epic}>
                <FaCodeBranch size={10} /> {todo.epic}
              </EpicTag>
            )}
            
            {todo.repo && (
              <RepoTag>
                <FaGithub size={10} /> {todo.repo}
              </RepoTag>
            )}
            
            {todo.branch && (
              <BranchTag>
                <FaCodeBranch size={10} /> {todo.branch}
              </BranchTag>
            )}
          </TaskTags>
          
          {todo.codeRef && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#bbb', fontSize: '0.75rem' }}>
              <FaCode size={10} /> {todo.codeRef}
            </div>
          )}
        </TaskMeta>

        <TaskFooter>
          {todo.assignee ? (
            <div style={{ 
              backgroundColor: 'rgba(255, 56, 92, 0.15)',
              color: '#f5f5f5',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {todo.assignee.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div></div>
          )}
          <TaskDate>
            <FaLink size={10} /> {isArchived && todo.archivedAt 
              ? `Archived ${formatDate(todo.archivedAt)}` 
              : formatDate(todo.createdAt)}
          </TaskDate>
        </TaskFooter>

        {showEpicSelect === todo.id && !isArchived && (
          <EpicSelector>
            <EpicOption
              onClick={() => setEpic(todo.id, undefined)}
            >
              None
            </EpicOption>
            {epicOptions.map((epic) => (
              <EpicOption 
                key={epic}
                isSelected={todo.epic === epic}
                onClick={() => setEpic(todo.id, epic)}
              >
                {epic}
              </EpicOption>
            ))}
          </EpicSelector>
        )}

        {showRepoSelect === todo.id && !isArchived && (
          <EpicSelector>
            <EpicOption
              onClick={() => setRepo(todo.id, undefined)}
            >
              None
            </EpicOption>
            {repoOptions.map((repo) => (
              <EpicOption 
                key={repo}
                isSelected={todo.repo === repo}
                onClick={() => setRepo(todo.id, repo)}
              >
                {repo}
              </EpicOption>
            ))}
          </EpicSelector>
        )}
      </TaskComponent>
    );
  };

  // Render a column with its tasks
  const renderColumn = (status: 'todo' | 'in-progress' | 'done', title: string) => {
    const filteredTodos = getActiveTodos(status);

    return (
      <Column
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          const todoId = e.dataTransfer.getData('todoId');
          moveTodo(todoId, status);
        }}
      >
        <ColumnHeader>
          <ColumnTitle>{title}</ColumnTitle>
          <Badge status={status}>{filteredTodos.length}</Badge>
        </ColumnHeader>
        
        <TaskList>
          {filteredTodos.map(todo => renderTask(todo))}
        </TaskList>
        
        {status === 'todo' && (
          <ColumnFooter>
            {addingStatus === status ? (
              <NewTaskInput
                autoFocus
                placeholder="Task description..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTodo(status);
                  } else if (e.key === 'Escape') {
                    setNewTaskText('');
                    setAddingStatus(null);
                  }
                }}
                onBlur={() => {
                  if (newTaskText.trim() !== '') {
                    addTodo(status);
                  } else {
                    setAddingStatus(null);
                  }
                }}
              />
            ) : (
              <AddTaskButton onClick={() => setAddingStatus(status)}>
                <FaPlus size={10} /> Add Task
              </AddTaskButton>
            )}
          </ColumnFooter>
        )}
      </Column>
    );
  };

  // Add renderArchivedSection function
  const renderArchivedSection = () => {
    const archivedTodos = getArchivedTodos();
    
    if (!showArchived || archivedTodos.length === 0) return null;
    
    return (
      <ArchivedColumn>
        <ArchivedHeader>
          <ArchivedTitle>
            <FaArchive size={12} /> Archived Tasks
          </ArchivedTitle>
          <Badge status="done">{archivedTodos.length}</Badge>
        </ArchivedHeader>
        
        <ArchivedTaskList>
          {archivedTodos.map(todo => renderTask(todo, true))}
        </ArchivedTaskList>
      </ArchivedColumn>
    );
  };

  return (
    <KanbanContainer>
      <HeaderContainer>
        <HeaderTitle>Development Tasks</HeaderTitle>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ReturnButton onClick={toggleArchived}>
            {showArchived ? <FaEyeSlash size={12} /> : <FaArchive size={12} />} 
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </ReturnButton>
          <ReturnButton onClick={returnToMainView}>
            <FaChevronLeft size={12} /> Return to API Client
          </ReturnButton>
        </div>
      </HeaderContainer>
      <ColumnsContainer>
        {renderColumn('todo', 'Backlog')}
        {renderColumn('in-progress', 'In Progress')}
        {renderColumn('done', 'Done')}
      </ColumnsContainer>
      {renderArchivedSection()}
    </KanbanContainer>
  );
};

export default TodoKanban; 