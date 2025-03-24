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
import { ApiRequest, ApiResponse, Folder, RequestHistoryItem, Environment } from './types';
import { clearAllStorageData, executeRequest, processUrl } from './utils/apiUtils';
import { findFirstRequest, findRequestById } from './helpers/CollectionHelpers';
import { RequestService } from './services/RequestService';
import { ImportService } from './services/ImportService';
import useCollections from './hooks/useCollections';
import useRequestHistory from './hooks/useRequestHistory';
import { v4 as uuidv4 } from 'uuid';

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
      <h3>Welcome to API Client</h3>
      <p>
        Select a request from the sidebar or create a new collection to get
        started. This client helps you build, test, and document APIs with ease.
      </p>
      <button type="button" onClick={onCreateCollection}>
        <FaPlus /> Create New Collection
      </button>
      <button 
        type="button" 
        onClick={handleClearStorage} 
        style={{ marginTop: '10px', backgroundColor: '#e74c3c' }}
      >
        <FaTrash /> Clear All Storage Data
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

  // Use our custom hooks for collections and history
  const {
    collections,
    addFolder,
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

  // Load environments from localStorage on component mount
  useEffect(() => {
    try {
      const savedEnvironments = localStorage.getItem('api-client-environments');
      const savedCurrentEnvId = localStorage.getItem('api-client-current-environment');
      
      if (savedEnvironments) {
        setEnvironments(JSON.parse(savedEnvironments));
      }
      
      if (savedCurrentEnvId) {
        setCurrentEnvironmentId(JSON.parse(savedCurrentEnvId));
      }
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  }, []);

  // Save environments to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('api-client-environments', JSON.stringify(environments));
    } catch (error) {
      console.error('Failed to save environments:', error);
    }
  }, [environments]);

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
    setEnvironments(prev => [...prev, environment]);
  };

  const updateEnvironment = (environment: Environment) => {
    setEnvironments(prev => 
      prev.map(env => env.id === environment.id ? environment : env)
    );
  };

  const deleteEnvironment = (environmentId: string) => {
    setEnvironments(prev => prev.filter(env => env.id !== environmentId));
    if (currentEnvironmentId === environmentId) {
      setCurrentEnvironmentId(null);
    }
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
      const savedResponses = localStorage.getItem('api-client-responses');
      if (savedResponses) {
        const parsedResponses = JSON.parse(savedResponses);
        setResponseMap(parsedResponses);
      }
    } catch (err) {
      console.error('Failed to load saved responses:', err);
    }
  }, []);

  // Save responses when they change
  useEffect(() => {
    try {
      localStorage.setItem('api-client-responses', JSON.stringify(responseMap));
    } catch (err) {
      console.error('Failed to save responses:', err);
    }
  }, [responseMap]);

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

  // Handle selecting a request from sidebar
  const handleSelectRequest = useCallback(
    (request: ApiRequest) => {
    setActiveRequest(request);
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
      
      // Save the response to the responseMap for persistence
      setResponseMap(prev => ({
        ...prev,
        [request.id]: response
      }));
      
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
      
      // Save error response to responseMap
      setResponseMap(prev => ({
        ...prev,
        [request.id]: errorResponse
      }));
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

  // Render the app
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Sidebar
          collections={collections}
          activeRequestId={activeRequest?.id ?? null}
          onSelectRequest={handleSelectRequest}
          onAddFolder={addFolder}
          onAddRequest={addRequest}
          onRenameItem={renameItem}
          onDeleteItem={deleteItem}
          onMoveItem={moveItem}
          onDuplicateRequest={duplicateRequest}
          onImportFromCurl={handleImportFromCurl}
          onImportFromFile={handleImportFromFile}
          requestHistory={requestHistory.slice().reverse()}
          onRestoreFromHistory={handleRestoreFromHistory}
          onClearHistory={clearHistory}
          environments={environments}
          currentEnvironmentId={currentEnvironmentId}
          onAddEnvironment={addEnvironment}
          onUpdateEnvironment={updateEnvironment}
          onDeleteEnvironment={deleteEnvironment}
          onSelectEnvironment={selectEnvironment}
        />
        <MainContent>
          {activeRequest ? (
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
              <ResponsePanel response={activeResponse} request={activeRequest} isLoading={loading} />
            </RequestResponseContainer>
          ) : (
            <EmptyStateView onCreateCollection={addFolder} />
          )}
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;
