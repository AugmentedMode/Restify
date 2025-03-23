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
import { ApiRequest, ApiResponse, Folder, RequestHistoryItem } from './types';
import { clearAllStorageData } from './utils/apiUtils';
import { findFirstRequest, findRequestById } from './helpers/CollectionHelpers';
import { RequestService } from './services/RequestService';
import { ImportService } from './services/ImportService';
import useCollections from './hooks/useCollections';
import useRequestHistory from './hooks/useRequestHistory';

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

  // When collections change or are first loaded, possibly set active request
  useEffect(() => {
    // If no active request yet and collections are loaded, try to find one
    if (!activeRequest && collections.length > 0) {
          // Check for saved active request ID first
      const savedActiveRequestId = localStorage.getItem(
        'api-client-active-request-id',
      );

      if (savedActiveRequestId) {
        // Try to find this request in collections
        const request = findRequestById(collections, savedActiveRequestId);
        if (request) {
          console.log(`Found request to restore: ${request.name}`);
          setActiveRequest(request);
          
          // Get response from responseMap if available
          const response = responseMap[request.id];
          if (response) {
            setActiveResponse(response);
            console.log(`Restored response for request ${request.name}`);
          } else {
            setActiveResponse(null);
          }
        } else {
          console.log(
            'Could not find saved request in collections, ID:',
            savedActiveRequestId,
          );
          // If we couldn't find the saved request, clear the saved ID
          localStorage.removeItem('api-client-active-request-id');

          // Select first available request
          const firstRequest = findFirstRequest(collections);
          if (firstRequest) {
            setActiveRequest(firstRequest);
            setActiveResponse(responseMap[firstRequest.id] || null);
          }
        }
      } else {
        // No saved ID, select first request
        const firstRequest = findFirstRequest(collections);
        if (firstRequest) {
          setActiveRequest(firstRequest);
          setActiveResponse(responseMap[firstRequest.id] || null);
        }
      }
    }
  }, [collections, activeRequest, responseMap]);

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
      localStorage.setItem('api-client-active-request-id', activeRequest.id);
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
        localStorage.setItem('api-client-active-request-id', request.id);
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
          localStorage.setItem('api-client-active-request-id', firstRequest.id);
        }
      } catch (error) {
        console.error('Failed to import file:', error);
      }
    },
    [addCollection],
  );

  // Handle sending a request
  const handleSendRequest = useCallback(async () => {
    if (!activeRequest) return;

      try {
        // Start loading
        setLoading(true);
        const startTime = Date.now();
        
      // Execute the request using our service
      const response = await RequestService.executeApiRequest(activeRequest);
        
        // Calculate elapsed time
        const elapsed = Date.now() - startTime;
        setLastRequestTime(elapsed);
        
        // Store the active request ID before updating any state
        const activeRequestId = activeRequest.id;
        
        // Set the response state
        setActiveResponse(response);
        
        // Save response for this request
      setResponseMap((prev) => ({
          ...prev,
        [activeRequestId]: response,
        }));
        
        // Add to history
      addToHistory(activeRequest, response);
        
        // Ensure localStorage has the correct active request ID
        localStorage.setItem('api-client-active-request-id', activeRequestId);
      } catch (error) {
        console.error('Failed to execute request:', error);
      } finally {
        setLoading(false);
      }
  }, [activeRequest, addToHistory]);

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
          activeRequestId={activeRequest?.id || null}
          onSelectRequest={handleSelectRequest}
          onAddFolder={addFolder}
          onAddRequest={addRequest}
          onRenameItem={renameItem}
          onDeleteItem={deleteItem}
          onMoveItem={moveItem}
          onDuplicateRequest={duplicateRequest}
          onImportFromCurl={handleImportFromCurl}
          onImportFromFile={handleImportFromFile}
          requestHistory={requestHistory}
          onRestoreFromHistory={handleRestoreFromHistory}
          onClearHistory={clearHistory}
        />
        <MainContent>
          {activeRequest ? (
            <RequestResponseContainer>
              <RequestContainer>
                <RequestPanel
                  request={activeRequest}
                  onRequestChange={handleRequestChange}
                  onSendRequest={handleSendRequest}
                  isLoading={loading}
                  lastRequestTime={lastRequestTime}
                />
              </RequestContainer>
              <ResponsePanel response={activeResponse} isLoading={loading} />
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
