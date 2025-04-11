import React, { useState, useEffect, useCallback } from 'react';
import { FaCode, FaPlus, FaTrash } from 'react-icons/fa';
import {
  AppContainer,
  MainContent,
  EmptyStateContainer,
  RequestResponseContainer,
  RequestContainer,
} from './styles/StyledComponents';
import Sidebar from './components/Sidebar';
import RequestPanel from './components/RequestPanel';
import ResponsePanel from './components/ResponsePanel';
import GlobalStyle from './components/GlobalStyle';
import NotesContainer from './components/notes/NotesContainer';
import { ApiRequest, ApiResponse, Folder, RequestHistoryItem, Environment, Note } from './types';
import { clearAllStorageData, executeRequest, processUrl } from './utils/apiUtils';
import { findFirstRequest, findRequestById } from './helpers/CollectionHelpers';
import { RequestService } from './services/RequestService';
import { ImportService } from './services/ImportService';
import useCollections from './hooks/useCollections';
import useRequestHistory from './hooks/useRequestHistory';
import { v4 as uuidv4 } from 'uuid';
import { 
  NotesService, 
  initializeDatabase, 
  SettingsService, 
  EnvironmentsService,
  ResponsesService
} from './services/DatabaseService';
import { modalDataStore } from './utils/modalDataStore';
import { initializeEncryption } from './utils/encryptionUtils';

// Sample initial data for new users
const initialCollections: Folder[] = [
  {
    id: 'collection1',
    name: 'My Collection',
    items: [
      {
        id: 'folder1',
        name: 'Authentication',
        items: [
          {
            id: 'request1',
            name: 'Login',
            method: 'POST',
            url: 'https://api.example.com/login',
            params: [],
            headers: [
              {
                name: 'Content-Type',
                value: 'application/json',
                enabled: true,
              },
            ],
            body: JSON.stringify(
              { username: 'user', password: 'pass' },
              null,
              2,
            ),
            bodyType: 'json',
            folderPath: ['collection1', 'folder1'],
          },
        ],
        parentPath: ['collection1'],
      },
      {
        id: 'request2',
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        params: [
          { name: 'page', value: '1', enabled: true },
          { name: 'limit', value: '10', enabled: true },
        ],
        headers: [],
        body: '',
        bodyType: 'none',
        folderPath: ['collection1'],
      },
    ],
    parentPath: [],
  },
];

function EmptyStateView({
  onCreateCollection,
}: {
  onCreateCollection: () => void;
}) {
  // Add function to handle storage clearing
  const handleClearStorage = () => {
    const result = clearAllStorageData();
    if (result.success) {
      alert(result.message);
      // Reload the page to reset state
      window.location.reload();
    } else {
      alert(result.message);
    }
  };
  
  return (
    <EmptyStateContainer>
      <FaCode size={64} />
      <h3>Restify</h3>
      <p>
        Select a request from the sidebar or create a new collection to get
        started. Opensource IDE for exploring and testing APIs
      </p>
      <button type="button" onClick={onCreateCollection}>
        <FaPlus /> Create New Collection
      </button>
    </EmptyStateContainer>
  );
}

function App() {
  // One-time cleanup for potential localStorage format issues
  useEffect(() => {
    try {
      const savedActiveRequestId = localStorage.getItem('api-client-active-request-id');
      if (savedActiveRequestId) {
        try {
          // Try to parse it as JSON
          JSON.parse(savedActiveRequestId);
        } catch (parseError) {
          // If parsing fails, it's not valid JSON, so remove it
          localStorage.removeItem('api-client-active-request-id');
          console.log('Removed invalid active request ID from localStorage');
        }
      }
    } catch (error) {
      // If there's any other issue, just remove the problematic item
      localStorage.removeItem('api-client-active-request-id');
      console.error('Error handling localStorage cleanup:', error);
    }
  }, []);

  // Initialize IndexedDB database
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing IndexedDB database...');
        const result = await initializeDatabase();
        if (result.success) {
          console.log('IndexedDB database initialized successfully');
          
          // After successful database initialization, attempt to clear localStorage
          // only after confirming data is safely in IndexedDB (done in the initializeDatabase function)
          const migrationStatus = await SettingsService.getSetting('migration');
          if (migrationStatus && migrationStatus.completed) {
            // Keep these commented out until we're sure the migration is working well
            // localStorage.removeItem('api-client-notes');
            // localStorage.removeItem('api-client-collections');
            // localStorage.removeItem('api-client-history');
            // localStorage.removeItem('api-client-responses');
            // localStorage.removeItem('api-client-environments');
            console.log('Migration to IndexedDB complete - localStorage can be cleared if needed');
          }
        } else {
          console.error('Failed to initialize IndexedDB database:', result.error);
        }
      } catch (error) {
        console.error('Error initializing IndexedDB database:', error);
      }
    };
    
    init();
  }, []);

  // Initialize the encryption system on app start
  useEffect(() => {
    const initEncryption = async () => {
      try {
        await initializeEncryption();
        console.log('Encryption system initialized');
      } catch (error) {
        console.error('Failed to initialize encryption system:', error);
      }
    };
    
    initEncryption();
  }, []);

  // Use our custom hooks for collections and history
  const {
    collections,
    addFolder: addCollectionToState,
    addRequest,
    renameItem,
    deleteItem,
    moveItem,
    duplicateRequest,
    updateRequest,
    addCollection,
  } = useCollections(initialCollections);

  const { requestHistory, addToHistory, clearHistory } = useRequestHistory();

  // State for the active request and response
  const [activeRequest, setActiveRequest] = useState<ApiRequest | null>(null);
  const [activeResponse, setActiveResponse] = useState<ApiResponse | null>(
    null,
  );

  // State for environments
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [currentEnvironmentId, setCurrentEnvironmentId] = useState<string | null>(null);

  // Load environments from IndexedDB on component mount
  useEffect(() => {
    try {
      const fetchEnvironments = async () => {
        // First try to load from IndexedDB
        const environmentsService = EnvironmentsService;
        const savedEnvironments = await environmentsService.getAllEnvironments();
        
        if (savedEnvironments && savedEnvironments.length > 0) {
          setEnvironments(savedEnvironments);
          
          // Try to load the current environment ID from localStorage
          const savedCurrentEnvId = localStorage.getItem('api-client-current-environment');
          if (savedCurrentEnvId) {
            setCurrentEnvironmentId(JSON.parse(savedCurrentEnvId));
          }
        } else {
          // Fallback to localStorage for migration
          const localEnvironments = localStorage.getItem('api-client-environments');
          if (localEnvironments) {
            setEnvironments(JSON.parse(localEnvironments));
          }
          
          const savedCurrentEnvId = localStorage.getItem('api-client-current-environment');
          if (savedCurrentEnvId) {
            setCurrentEnvironmentId(JSON.parse(savedCurrentEnvId));
          }
        }
      };
      
      fetchEnvironments();
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  }, []);

  // Save current environment ID to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('api-client-current-environment', JSON.stringify(currentEnvironmentId));
    } catch (error) {
      console.error('Failed to save current environment ID:', error);
    }
  }, [currentEnvironmentId]);

  // Handle environment operations
  const addEnvironment = (environment: Environment) => {
    // Save to IndexedDB
    EnvironmentsService.saveEnvironment(environment)
      .then(() => {
        // Update local state
        setEnvironments(prev => [...prev, environment]);
      })
      .catch(error => {
        console.error('Failed to save environment:', error);
      });
  };

  const updateEnvironment = (environment: Environment) => {
    // Save to IndexedDB
    EnvironmentsService.saveEnvironment(environment)
      .then(() => {
        // Update local state
        setEnvironments(prev => 
          prev.map(env => env.id === environment.id ? environment : env)
        );
      })
      .catch(error => {
        console.error('Failed to update environment:', error);
      });
  };

  const deleteEnvironment = (environmentId: string) => {
    // Delete from IndexedDB
    EnvironmentsService.deleteEnvironment(environmentId)
      .then(() => {
        // Update local state
        setEnvironments(prev => prev.filter(env => env.id !== environmentId));
        if (currentEnvironmentId === environmentId) {
          setCurrentEnvironmentId(null);
        }
      })
      .catch(error => {
        console.error('Failed to delete environment:', error);
      });
  };

  const selectEnvironment = (environmentId: string | null) => {
    setCurrentEnvironmentId(environmentId);
  };

  // Get the current environment object
  const getCurrentEnvironment = (): Environment | undefined => {
    if (!currentEnvironmentId) return undefined;
    return environments.find(env => env.id === currentEnvironmentId);
  };

  // State for loading
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  
  // Store responses by request ID for persistence
  const [responseMap, setResponseMap] = useState<Record<string, ApiResponse>>(
    {},
  );

  // Load saved responses on startup
  useEffect(() => {
    try {
      const fetchResponses = async () => {
        // First try to load from IndexedDB
        const savedResponses = await ResponsesService.getAllResponses();
        
        if (savedResponses && Object.keys(savedResponses).length > 0) {
          setResponseMap(savedResponses);
        } else {
          // Fallback to localStorage for migration
          const localResponses = localStorage.getItem('api-client-responses');
          if (localResponses) {
            const parsedResponses = JSON.parse(localResponses);
            setResponseMap(parsedResponses);
          }
        }
      };
      
      fetchResponses();
    } catch (err) {
      console.error('Failed to load saved responses:', err);
    }
  }, []);

  // Initial load and history
  useEffect(() => {
    let foundSavedRequest = false;
    
    // Try to load the active request ID from localStorage
    const savedActiveRequestId = localStorage.getItem(
      'api-client-active-request-id',
    );
    
    if (savedActiveRequestId) {
      try {
        const requestId = JSON.parse(savedActiveRequestId);
        const savedRequest = findRequestById(collections, requestId);
        
        if (savedRequest) {
          setActiveRequest(savedRequest);
          // Also set the response from responseMap if available
          if (responseMap[savedRequest.id]) {
            setActiveResponse(responseMap[savedRequest.id]);
          }
          foundSavedRequest = true;
        }
      } catch (error) {
        console.error('Error loading saved request:', error);
      }
    }

    // Only use the first request if we couldn't find a saved one
    if (!foundSavedRequest && collections.length > 0) {
      const firstRequest = findFirstRequest(collections);
      if (firstRequest) {
        setActiveRequest(firstRequest);
      }
    }
  }, [collections, responseMap]);

  // Ensure active request and response stay in sync
  const ensureResponseMatchesRequest = useCallback(() => {
    if (activeRequest && activeResponse) {
      // Verify the response actually belongs to this request
      const savedResponse = responseMap[activeRequest.id];
      if (savedResponse && savedResponse !== activeResponse) {
        console.log('Fixing mismatched response for request', activeRequest.id);
        setActiveResponse(savedResponse);
      }
    }
  }, [activeRequest, activeResponse, responseMap]);

  // Call this whenever activeRequest changes to ensure correct response
  useEffect(() => {
    ensureResponseMatchesRequest();
  }, [ensureResponseMatchesRequest]);

  // Save the active request ID when it changes
  useEffect(() => {
    if (activeRequest) {
      localStorage.setItem('api-client-active-request-id', JSON.stringify(activeRequest.id));
    }
  }, [activeRequest]);

  // State for notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Load notes from IndexedDB on component mount
  useEffect(() => {
    try {
      const fetchNotes = async () => {
        // First try to load from IndexedDB
        const notesService = NotesService;
        const savedNotes = await notesService.getAllNotes();
        
        if (savedNotes && savedNotes.length > 0) {
          setNotes(savedNotes);
          
          // Try to load the active note ID from localStorage
          const savedActiveNote = localStorage.getItem('api-client-active-note');
          if (savedActiveNote) {
            setActiveNote(JSON.parse(savedActiveNote));
          }
        } else {
          // Fallback to localStorage for migration
          const localNotes = localStorage.getItem('api-client-notes');
          if (localNotes) {
            setNotes(JSON.parse(localNotes));
          }
          
          const savedActiveNote = localStorage.getItem('api-client-active-note');
          if (savedActiveNote) {
            setActiveNote(JSON.parse(savedActiveNote));
          }
        }
      };
      
      fetchNotes();
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  // Save active note ID to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('api-client-active-note', JSON.stringify(activeNote));
    } catch (error) {
      console.error('Failed to save active note ID:', error);
    }
  }, [activeNote]);

  // Handle notes operations
  const addNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'New Note',
      content: '# New Note\n\nStart writing your markdown here...',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Save to IndexedDB
    NotesService.saveNote(newNote)
      .then(() => {
        // Update local state
        setNotes(prev => [...prev, newNote]);
        setActiveNote(newNote.id);
        setActiveRequest(null); // Clear active request when switching to a note
      })
      .catch(error => {
        console.error('Failed to save new note:', error);
      });
  };

  const updateNote = (updatedNote: Note) => {
    // Save to IndexedDB
    NotesService.saveNote(updatedNote)
      .then(() => {
        // Update local state
        setNotes(prev => 
          prev.map(note => note.id === updatedNote.id ? updatedNote : note)
        );
      })
      .catch(error => {
        console.error('Failed to update note:', error);
      });
  };

  const deleteNote = (noteId: string) => {
    // Delete from IndexedDB
    NotesService.deleteNote(noteId)
      .then(() => {
        // Update local state
        setNotes(prev => prev.filter(note => note.id !== noteId));
        if (activeNote === noteId) {
          setActiveNote(null);
        }
      })
      .catch(error => {
        console.error('Failed to delete note:', error);
      });
  };

  const selectNote = (note: Note) => {
    setActiveNote(note.id);
    setActiveRequest(null); // Clear active request when switching to a note
  };

  const renameNote = (noteId: string, newTitle: string) => {
    // Find the note to update
    const noteToUpdate = notes.find(note => note.id === noteId);
    if (!noteToUpdate) return;
    
    const updatedNote = { 
      ...noteToUpdate, 
      title: newTitle, 
      updatedAt: Date.now() 
    };
    
    // Save to IndexedDB
    NotesService.saveNote(updatedNote)
      .then(() => {
        // Update local state
        setNotes(prev => 
          prev.map(note => note.id === noteId ? updatedNote : note)
        );
      })
      .catch(error => {
        console.error('Failed to rename note:', error);
      });
  };

  // Adding duplicate note feature
  const duplicateNote = (note: Note) => {
    const duplicatedNote: Note = {
      id: uuidv4(),
      title: `${note.title} (Copy)`,
      content: note.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: note.tags ? [...note.tags] : [],
    };
    
    // Save to IndexedDB
    NotesService.saveNote(duplicatedNote)
      .then(() => {
        // Update local state
        setNotes(prev => [...prev, duplicatedNote]);
        setActiveNote(duplicatedNote.id);
      })
      .catch(error => {
        console.error('Failed to duplicate note:', error);
      });
  };

  // Adding export note feature
  const exportNote = (note: Note) => {
    try {
      // Create a Blob with the note content
      const blob = new Blob([note.content], { type: 'text/markdown' });
      
      // Create a link element
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      
      // Clean up the note title for filename
      const filename = note.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      a.download = `${filename}.md`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error('Failed to export note:', error);
      alert('Failed to export note. Please try again.');
    }
  };

  // Handle selecting a request from sidebar
  const handleSelectRequest = useCallback(
    (request: ApiRequest) => {
      setActiveRequest(request);
      setActiveNote(null); // Clear active note when switching to a request
      // Use stored response if available for this request
      setActiveResponse(responseMap[request.id] || null);
    },
    [responseMap],
  );

  // Handle request changes
  const handleRequestChange = useCallback(
    (updatedRequest: ApiRequest) => {
    setActiveRequest(updatedRequest);
      updateRequest(updatedRequest);
    },
    [updateRequest],
  );

  // Handle restoring a request from history
  const handleRestoreFromHistory = useCallback(
    (historyItem: RequestHistoryItem) => {
      setActiveRequest(historyItem.request);
      setActiveResponse(historyItem.response);
    },
    [],
  );

  // Handle import from cURL
  const handleImportFromCurl = useCallback(
    (curlCommand: string) => {
      try {
        const request = ImportService.importFromCurl(curlCommand);
        if (!request) return;

        // Add the new request to the first collection if available,
        // or create a new collection if none exists
        if (collections.length === 0) {
          // Create a new collection first
          const newCollection: Folder = {
            id: request.id,
            name: 'Imported Requests',
            items: [request],
      parentPath: [],
    };

          addCollection(newCollection);

          // Set the folderPath for the new request
          request.folderPath = [newCollection.id];
        } else {
          // Add to the first collection
          const firstCollection = collections[0];

          // Set the folderPath for the new request
          request.folderPath = [firstCollection.id];

          // Add the request to the collection
          const updatedCollection = { ...firstCollection };
          updatedCollection.items = [...updatedCollection.items, request];
          updateRequest(request);
        }

        // Set the new request as active
        setActiveRequest(request);
      setActiveResponse(null);

        // Save the active request ID
        localStorage.setItem('api-client-active-request-id', JSON.stringify(request.id));
      } catch (error) {
        console.error('Failed to import cURL command:', error);
      }
    },
    [collections, updateRequest, addCollection],
  );

  // Handle import from file
  const handleImportFromFile = useCallback(
    (fileContent: string, fileName: string) => {
      try {
        const importedCollection = ImportService.importFromFile(
          fileContent,
          fileName,
        );
        if (!importedCollection) return;

        // Add the new collection
        addCollection(importedCollection);

        // Find the first request in the collection
        const firstRequest = findFirstRequest([importedCollection]);
        if (firstRequest) {
          setActiveRequest(firstRequest);
        setActiveResponse(null);
          localStorage.setItem('api-client-active-request-id', JSON.stringify(firstRequest.id));
        }
      } catch (error) {
        console.error('Failed to import file:', error);
      }
    },
    [addCollection],
  );

  // Handle sending a request
  const handleSendRequest = useCallback(() => {
    if (!activeRequest) return;
    
    setLoading(true);
    setLastRequestTime(Date.now());
    handleRequestSend(activeRequest);
    setLoading(false);
  }, [activeRequest]);

  // Execute request with environment variables
  const handleRequestSend = async (request: ApiRequest = activeRequest!) => {
    if (!request) return;
    
    try {
      // Set loading state to true
      setLoading(true);
      setLastRequestTime(Date.now());
      
      setActiveResponse({
        status: 0,
        statusText: 'Pending...',
        data: null,
        headers: {},
        time: 0,
        size: 0,
      });
      
      const currentEnvironment = getCurrentEnvironment();
      const response = await executeRequest(request, currentEnvironment);
      
      setActiveResponse(response);
      
      // Save the response to IndexedDB
      try {
        await ResponsesService.saveResponse(request.id, response);
        
        // Update local responseMap
        setResponseMap(prev => ({
          ...prev,
          [request.id]: response
        }));
      } catch (error) {
        console.error('Failed to save response to IndexedDB:', error);
      }
      
      // Create history item from request and response
      const historyItem: RequestHistoryItem = {
        id: uuidv4(),
        timestamp: Date.now(),
        request,
        response,
        name: request.name
      };
      
      addToHistory(historyItem);
    } catch (error: any) {
      const errorResponse = {
        status: 0,
        statusText: 'Error',
        data: error.message || 'An unknown error occurred',
        headers: {},
        time: 0,
        size: 0,
      };
      
      setActiveResponse(errorResponse);
      
      // Save error response to IndexedDB
      try {
        await ResponsesService.saveResponse(request.id, errorResponse);
        
        // Update local responseMap
        setResponseMap(prev => ({
          ...prev,
          [request.id]: errorResponse
        }));
      } catch (dbError) {
        console.error('Failed to save error response to IndexedDB:', dbError);
      }
    } finally {
      // Always set loading to false when done
      setLoading(false);
    }
  };

  // Add keyboard shortcut for sending request
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Enter key is pressed and not inside a textarea or content-editable element
      if (
        event.key === 'Enter' &&
          activeRequest && 
          !loading && 
          !(event.target instanceof HTMLTextAreaElement) && 
          !(event.target instanceof HTMLInputElement) &&
        !(event.target as HTMLElement)?.isContentEditable
      ) {
        handleSendRequest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeRequest, loading, handleSendRequest]);

  // Determine what content to show in the main area
  const renderMainContent = () => {
    if (!activeRequest) {
      return <EmptyStateView onCreateCollection={addFolder} />;
    }

    if (activeNote) {
      const note = notes.find(n => n.id === activeNote);
      if (note) {
        return <NotesContainer notes={notes} activeNoteId={activeNote} onAddNote={addNote} onUpdateNote={updateNote} />;
      }
    }

    // This means we have an active request
    return (
      <RequestResponseContainer>
        <RequestContainer>
          <RequestPanel
            request={activeRequest}
            onRequestChange={handleRequestChange}
            onSendRequest={handleRequestSend}
            isLoading={loading}
            lastRequestTime={lastRequestTime}
            currentEnvironment={getCurrentEnvironment()}
          />
        </RequestContainer>
        <ResponsePanel
          response={activeResponse}
          request={activeRequest}
          isLoading={loading}
          environments={environments}
          currentEnvironmentId={currentEnvironmentId}
          onAddEnvironment={addEnvironment}
          onUpdateEnvironment={updateEnvironment}
          onDeleteEnvironment={deleteEnvironment}
          onSelectEnvironment={selectEnvironment}
        />
      </RequestResponseContainer>
    );
  };

  // Create empty request template
  const createEmptyRequest = (folderPath: string[]): ApiRequest => ({
    id: uuidv4(),
    name: 'New Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body: '',
    bodyType: 'none',
    folderPath,
    auth: {
      type: 'none',
      bearer: '',
      basic: {
        username: '',
        password: '',
      },
    },
  });

  // Add a new folder (collection)
  const addFolder = () => {
    // Check if we have collection data from the modal
    const newCollection = modalDataStore.getLastCreatedCollection();

    if (newCollection) {
      // Use the collection data from the modal with the name
      console.log(`Creating collection with name: ${newCollection.name}`);
      addCollection({
        id: newCollection.id,
        name: newCollection.name,
        items: [],
        parentPath: [],
      });
    } else {
      // Original logic as fallback
      addCollection({
        id: uuidv4(),
        name: 'New Collection',
        items: [],
        parentPath: [],
      });
    }
  };

  // Adapter for adding a request to handle paths
  const addRequestAdapter = (folderPath: string[]) => {
    // Check if we have request data from the modal
    const newRequest = modalDataStore.getLastCreatedRequest();
    
    if (newRequest) {
      // Use the request data from the modal
      console.log(`Creating request with name: ${newRequest.name} and URL: ${newRequest.url}`);
      
      // Add the request to the specified path
      addRequest(newRequest, folderPath);
    } else {
      // Original logic as fallback
      const defaultRequest = createEmptyRequest(folderPath);
      addRequest(defaultRequest, folderPath);
    }
  };

  // Function to adapt moveItem to match the old interface that Sidebar expects
  const moveItemAdapter = (
    itemId: string,
    itemType: 'folder' | 'request',
    sourcePath: string[],
    targetPath: string[]
  ) => {
    moveItem(itemId, targetPath);
  };

  // Render the app
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Sidebar
          collections={collections}
          activeRequestId={activeRequest?.id || null}
          onSelectRequest={handleSelectRequest}
          onAddFolder={addFolder}
          onAddRequest={addRequestAdapter}
          onRenameItem={renameItem}
          onDeleteItem={deleteItem}
          onMoveItem={moveItemAdapter}
          onDuplicateRequest={duplicateRequest}
          onImportFromCurl={handleImportFromCurl}
          onImportFromFile={handleImportFromFile}
          requestHistory={requestHistory}
          onRestoreFromHistory={handleRestoreFromHistory}
          onClearHistory={clearHistory}
          environments={environments}
          currentEnvironmentId={currentEnvironmentId}
          onAddEnvironment={addEnvironment}
          onUpdateEnvironment={updateEnvironment}
          onDeleteEnvironment={deleteEnvironment}
          onSelectEnvironment={selectEnvironment}
          notes={notes}
          activeNoteId={activeNote}
          onSelectNote={selectNote}
          onAddNote={addNote}
          onRenameNote={renameNote}
          onDeleteNote={deleteNote}
          onDuplicateNote={duplicateNote}
          onExportNote={exportNote}
        />
        <MainContent>
          {renderMainContent()}
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;
