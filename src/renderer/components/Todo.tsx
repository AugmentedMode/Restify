import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import styled from 'styled-components';

// Define the Todo item type
interface Todo {
  id: string;
  text: string;
  status: 'todo' | 'in-progress' | 'done';
}

// Styled components
const KanbanContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 20px;
  background-color: var(--bg);
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 20px;
  flex: 1;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const ReturnButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-light);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--bg-hover);
  }
`;

const Column = styled.div`
  flex: 1;
  background-color: var(--bg-light);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  max-width: 350px;
`;

const ColumnHeader = styled.div`
  font-weight: bold;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
`;

const Badge = styled.span<{ status: string }>`
  background-color: ${props => 
    props.status === 'todo' ? 'var(--color-primary-light)' : 
    props.status === 'in-progress' ? 'var(--color-warning-light)' : 
    'var(--color-success-light)'
  };
  color: ${props => 
    props.status === 'todo' ? 'var(--color-primary)' : 
    props.status === 'in-progress' ? 'var(--color-warning)' : 
    'var(--color-success)'
  };
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
`;

const TaskList = styled.div`
  margin-top: 16px;
  flex-grow: 1;
  overflow-y: auto;
`;

const Task = styled.div`
  background-color: var(--bg);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const TaskActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${Task}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color-light);
  
  &:hover {
    color: var(--text-color);
  }
`;

const AddTaskButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--bg);
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  width: 100%;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--bg-hover);
  }
`;

const NewTaskInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  margin-top: 12px;
  background-color: var(--bg);
`;

// Main Kanban component
const TodoKanban: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [addingStatus, setAddingStatus] = useState<'todo' | 'in-progress' | 'done' | null>(null);
  
  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('kanban-todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      // Set some initial sample todos
      const initialTodos: Todo[] = [
        { id: '1', text: 'Create API endpoints', status: 'todo' },
        { id: '2', text: 'Implement authentication', status: 'in-progress' },
        { id: '3', text: 'Design database schema', status: 'done' },
      ];
      setTodos(initialTodos);
      localStorage.setItem('kanban-todos', JSON.stringify(initialTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kanban-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (status: 'todo' | 'in-progress' | 'done') => {
    if (newTaskText.trim() === '') return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTaskText,
      status,
    };
    
    setTodos([...todos, newTodo]);
    setNewTaskText('');
    setAddingStatus(null);
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

  // Render a single task
  const renderTask = (todo: Todo) => {
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

    return (
      <Task 
        key={todo.id}
        onDoubleClick={() => setEditingId(todo.id)}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('todoId', todo.id);
        }}
      >
        {todo.text}
        <TaskActions>
          <ActionButton onClick={() => setEditingId(todo.id)}>
            <FaEdit />
          </ActionButton>
          <ActionButton onClick={() => deleteTodo(todo.id)}>
            <FaTrash />
          </ActionButton>
        </TaskActions>
      </Task>
    );
  };

  // Render a column with its tasks
  const renderColumn = (status: 'todo' | 'in-progress' | 'done', title: string) => {
    const filteredTodos = todos.filter(todo => todo.status === status);

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
            <FaPlus size={12} /> Add Task
          </AddTaskButton>
        )}
      </Column>
    );
  };

  return (
    <KanbanContainer>
      <HeaderContainer>
        <HeaderTitle>Kanban Board</HeaderTitle>
        <ReturnButton onClick={returnToMainView}>
          Return to Main View
        </ReturnButton>
      </HeaderContainer>
      <ColumnsContainer>
        {renderColumn('todo', 'To Do')}
        {renderColumn('in-progress', 'In Progress')}
        {renderColumn('done', 'Done')}
      </ColumnsContainer>
    </KanbanContainer>
  );
};

export default TodoKanban; 