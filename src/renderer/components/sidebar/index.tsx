import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaBookmark,
  FaHistory,
  FaGlobeAmericas,
  FaStickyNote,
  FaFolderPlus,
  FaPlus,
  FaColumns,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCode,
  FaDatabase,
  FaPalette,
  FaSitemap,
  FaTimes,
  FaCog,
  FaGithub,
  FaRobot,
  FaLightbulb,
  FaKey
} from 'react-icons/fa';
import { 
  Sidebar as SidebarContainer, 
  SidebarContent, 
  ResizeHandle,
} from '../../styles/StyledComponents';
import { modalDataStore } from '../../utils/modalDataStore';
import { useSettings } from '../../utils/SettingsContext';

// Components
import SidebarHeader from './components/SidebarHeader';
import SidebarFooter from './components/SidebarFooter';
import SidebarSearch from './components/SidebarSearch';
import CreatePanel from './components/CreatePanel';
import NavTooltip from './components/NavTooltip';
import ContextMenu from './components/ContextMenu';
import CollectionsSection from './sections/CollectionsSection';
import HistorySection from './sections/HistorySection';
import NotesSection from './sections/NotesSection';
import KanbanSection from './sections/KanbanSection';
import EnvironmentManager from '../EnvironmentManager';
import SecretsSection from './sections/SecretsSection';
import GitHubSection from './sections/GitHubSection';
import AISection from '../sidebar/sections/AISection';
import AIPromptsSection from '../sidebar/sections/AIPromptsSection';

// Dynamically load the SettingsSection with an import() to avoid errors
// when the file hasn't been created yet
const SettingsSection = React.lazy(() => import('../settings/SettingsSection'));

// Hooks
import { useSidebarResize } from './hooks/useSidebarResize';
import { useExpandedSections } from './hooks/useExpandedSections';
import { useExpandedFolders } from './hooks/useExpandedFolders';
import { useContextMenu } from './hooks/useContextMenu';
import { useModalState } from './hooks/useModalState';

// Modals
import RenameModal from '../modals/RenameModal';
import DeleteModal from '../modals/DeleteModal';
import MoveModal from '../modals/MoveModal';
import ImportCurlModal from '../modals/ImportCurlModal';
import ImportFileModal from '../modals/ImportFileModal';
import NoteOptionsModal from '../notes/modals/NoteOptionsModal';
import AddRequestModal from '../modals/AddRequestModal';
import AddCollectionModal from '../modals/AddCollectionModal';

// Types
import { ApiRequest, Folder, HttpMethod, RequestHistoryItem, Environment, Note, SecretsProfile } from '../../types';

// Animation variants
const sidebarVariants = {
  expanded: { width: 300 },
  collapsed: { width: 70 },
};

interface SidebarProps {
  collections: Folder[];
  activeRequestId: string | null;
  onSelectRequest: (request: ApiRequest) => void;
  onAddFolder: (path: string) => void;
  onAddRequest: (parentPath: string[]) => void;
  onRenameItem: (id: string, name: string, isFolder: boolean) => void;
  onDeleteItem: (id: string, isFolder: boolean) => void;
  onMoveItem: (itemId: string, targetPath: string[], isFolder: boolean) => void;
  onDuplicateRequest: (requestId: string) => void;
  onImportFromCurl: () => void;
  onImportFromFile: () => void;
  requestHistory: RequestHistoryItem[];
  onRestoreFromHistory: (requestId: string) => void;
  onClearHistory: () => void;
  environments: Environment[];
  currentEnvironmentId: string | null;
  onAddEnvironment: (env: Environment) => void;
  onUpdateEnvironment: (env: Environment) => void;
  onDeleteEnvironment: (id: string) => void;
  onSelectEnvironment: (id: string | null) => void;
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onAddNote: () => void;
  onRenameNote: (id: string, title: string) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onExportNote: (id: string) => void;
  secretsProfiles?: SecretsProfile[];
  activeSecretsProfileId?: string | null;
  onSelectSecretsProfile?: (profile: SecretsProfile) => void;
  onAddSecretsProfile?: () => void;
  onImportSecrets?: () => void;
  onExportSecrets?: (profileId: string) => void;
  onOpenSettings?: () => void;
  onNavigateToNotes?: () => void;
}

function Sidebar({
  collections,
  activeRequestId,
  onSelectRequest,
  onAddFolder,
  onAddRequest,
  onRenameItem,
  onDeleteItem,
  onMoveItem,
  onDuplicateRequest,
  onImportFromCurl = () => {},
  onImportFromFile = () => {},
  requestHistory = [],
  onRestoreFromHistory = () => {},
  onClearHistory = () => {},
  environments = [],
  currentEnvironmentId = null,
  onAddEnvironment = () => {},
  onUpdateEnvironment = () => {},
  onDeleteEnvironment = () => {},
  onSelectEnvironment = () => {},
  notes = [],
  activeNoteId = null,
  onSelectNote = () => {},
  onAddNote = () => {},
  onRenameNote = () => {},
  onDeleteNote = () => {},
  onDuplicateNote = () => {},
  onExportNote = () => {},
  secretsProfiles = [],
  activeSecretsProfileId = null,
  onSelectSecretsProfile = () => {},
  onAddSecretsProfile = () => {},
  onImportSecrets = () => {},
  onExportSecrets = () => {},
  onOpenSettings = () => {},
  onNavigateToNotes = () => {},
}: SidebarProps) {
  // Get settings from context
  const { settings } = useSettings();

  // Use hooks for state management
  const { sidebarWidth, isResizing, handleResizeStart } = useSidebarResize(300);
  const { expandedFolders, toggleFolder, toggleAllFolders } = useExpandedFolders();
  const { expandedSections, toggleSection } = useExpandedSections();
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();
  const {
    showImportCurlModal,
    setShowImportCurlModal,
    showImportFileModal, 
    setShowImportFileModal,
    renameModal,
    setRenameModal,
    showRenameModal,
    deleteModal,
    setDeleteModal,
    showDeleteModal,
    moveModal,
    setMoveModal,
    showMoveModal,
    addRequestModal,
    showAddRequestModal,
    hideAddRequestModal,
    addCollectionModal,
    showAddCollectionModal,
    hideAddCollectionModal,
    noteOptionsModal,
    setNoteOptionsModal,
    showCreatePanel,
    toggleCreatePanel,
  } = useModalState();

  // Additional state
  const [filter, setFilter] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);

  // Listen for route changes to update the current route state
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Toggle settings panel visibility
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Navigation function for AI Prompts
  const navigateToAIPrompts = () => {
    if (window.location.pathname !== '/ai-prompts') {
      window.history.pushState({}, '', '/ai-prompts');
      window.dispatchEvent(new Event('popstate'));
    }
  };
  
  // Handle adding a new AI Prompt
  const handleAddNewPrompt = () => {
    if (window.location.pathname !== '/ai-prompts/new') {
      window.history.pushState({}, '', '/ai-prompts/new');
      window.dispatchEvent(new Event('popstate'));
    }
  };
  
  // Handle viewing saved prompts
  const handleViewSavedPrompts = () => {
    if (window.location.pathname !== '/ai-prompts/saved') {
      window.history.pushState({}, '', '/ai-prompts/saved');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Handle rename
  const handleRename = (newName: string) => {
    if (renameModal.item && renameModal.itemType) {
      onRenameItem(
        renameModal.item.id,
        newName,
        renameModal.itemType,
        renameModal.path,
      );
      setRenameModal({ ...renameModal, visible: false });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteModal.item && deleteModal.itemType) {
      onDeleteItem(deleteModal.item.id, deleteModal.itemType);
      setDeleteModal({ ...deleteModal, visible: false });
    }
  };

  // Handle move
  const handleMove = (targetPath: string[]) => {
    if (moveModal.item && moveModal.itemType) {
      onMoveItem(
        moveModal.item.id,
        targetPath,
        moveModal.itemType,
      );
      setMoveModal({ ...moveModal, visible: false });
    }
  };

  // Handle add request
  const handleAddRequest = (request: ApiRequest, path: string[]) => {
    // Save the request data in our store
    modalDataStore.setLastCreatedRequest(request);
    
    // Call the parent's function with just the path
    onAddRequest(path);
    hideAddRequestModal();
  };

  // Handle add collection
  const handleAddCollection = (collection: Folder) => {
    // Save the collection data in our store
    modalDataStore.setLastCreatedCollection(collection);
    
    // Call the parent's function
    onAddFolder(collection.id);
    hideAddCollectionModal();
  };

  // Handle context menu actions
  const handleContextMenuAction = (
    action: string, 
    item: any, 
    itemType: 'collection' | 'folder' | 'request' | 'note', 
    path: string[]
  ) => {
    switch (action) {
      case 'rename':
        setRenameModal({
          visible: true,
          item,
          itemType: itemType === 'note' ? 'request' : itemType, // Handle note type
          path,
        });
        break;
      case 'delete':
        setDeleteModal({
          visible: true,
          item,
          itemType: itemType === 'note' ? 'request' : itemType, // Handle note type
          path,
        });
        break;
      case 'move':
        if (itemType !== 'note') {
          setMoveModal({
            visible: true,
            item,
            itemType: itemType === 'collection' ? 'folder' : (itemType as 'folder' | 'request'),
            path,
          });
        }
        break;
      case 'duplicate':
        if (itemType === 'request') {
          onDuplicateRequest(item.id);
        } else if ('title' in item) { // Check for note property
          onDuplicateNote && onDuplicateNote(item.id);
        }
        break;
      case 'add-request':
        showAddRequestModal([...path, item.id]);
        break;
      case 'note-options':
        setNoteOptionsModal(item);
        break;
      default:
        break;
    }
    closeContextMenu();
  };

  // Render context menu based on type
  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;
    
    return (
      <ContextMenu
        item={contextMenu.item}
        itemType={contextMenu.itemType as 'collection' | 'folder' | 'request' | 'note'}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onAction={(action: string) => handleContextMenuAction(
          action, 
          contextMenu.item, 
          contextMenu.itemType as 'collection' | 'folder' | 'request' | 'note', 
          contextMenu.path
        )}
      />
    );
  };

  // Render collapsed sidebar navigation
  const renderCollapsedNav = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        gap: '20px',
      }}
    >
      {settings.general.showCollections && (
        <NavTooltip title="Collections" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: expandedSections.collections
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: expandedSections.collections ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
            onClick={() => toggleSection('collections')}
            className="nav-item"
          >
            <FaBookmark size={20} />
          </div>
        </NavTooltip>
      )}

      {/* AI Assistant */}
      <NavTooltip title="AI Assistant" isCollapsed={isSidebarCollapsed}>
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: expandedSections.ai
              ? 'rgba(255, 56, 92, 0.1)'
              : 'transparent',
            color: expandedSections.ai ? '#FF385C' : 'inherit',
            transition: 'all 0.2s',
          }}
          onClick={() => {
            toggleSection('ai');
            window.history.pushState({}, '', '/ai');
            window.dispatchEvent(new Event('popstate'));
          }}
          className="nav-item"
        >
          <FaRobot size={20} />
        </div>
      </NavTooltip>

      {/* AI Prompts */}
      <NavTooltip title="AI Prompts" isCollapsed={isSidebarCollapsed}>
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: currentRoute.startsWith('/ai-prompts')
              ? 'rgba(255, 56, 92, 0.1)'
              : 'transparent',
            color: currentRoute.startsWith('/ai-prompts') ? '#FF385C' : 'inherit',
            transition: 'all 0.2s',
          }}
          onClick={() => {
            navigateToAIPrompts();
          }}
          className="nav-item"
        >
          <FaLightbulb size={20} />
        </div>
      </NavTooltip>

      {settings.general.showBoards && (
        <NavTooltip title="Kanban Board" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: expandedSections.kanban
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: expandedSections.kanban ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
            onClick={() => toggleSection('kanban')}
            className="nav-item"
          >
            <FaColumns size={20} />
          </div>
        </NavTooltip>
      )}

      <NavTooltip title="Environments" isCollapsed={isSidebarCollapsed}>
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: expandedSections.environments
              ? 'rgba(255, 56, 92, 0.1)'
              : 'transparent',
            color: expandedSections.environments ? '#FF385C' : 'inherit',
            transition: 'all 0.2s',
          }}
          onClick={() => toggleSection('environments')}
          className="nav-item"
        >
          <FaGlobeAmericas size={20} />
        </div>
      </NavTooltip>

      {settings.general.showHistory && (
        <NavTooltip title="History" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: expandedSections.history
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: expandedSections.history ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
            onClick={() => toggleSection('history')}
            className="nav-item"
          >
            <FaHistory size={20} />
          </div>
        </NavTooltip>
      )}

      {settings.general.showNotes && (
        <NavTooltip title="Notes" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: expandedSections.notes
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: expandedSections.notes ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
            onClick={() => {
              toggleSection('notes');
              onNavigateToNotes();
            }}
            className="nav-item"
          >
            <FaStickyNote size={20} />
          </div>
        </NavTooltip>
      )}

      {settings.general.showGitHub && (
        <NavTooltip title="GitHub PRs" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: currentRoute === '/github'
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: currentRoute === '/github' ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
            onClick={navigateToGitHub}
            className="nav-item"
          >
            <FaGithub size={20} />
          </div>
        </NavTooltip>
      )}

      {settings.general.showSecretsManager && (
        <NavTooltip title="Secrets Manager" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: currentRoute === '/secrets'
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: currentRoute === '/secrets' ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                cursor: 'pointer',
              }}
              onClick={() => {
                // Clear any active profile ID to show the list view
                onSelectSecretsProfile && onSelectSecretsProfile({ id: null } as any);
                navigateToSecretsManager();
              }}
              className="nav-item"
            >
              <FaKey size={20} />
            </div>
            {onAddSecretsProfile && (
              <div
                style={{
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSecretsProfile();
                }}
                title="New Secret Group"
              >
                <FaPlus size={12} />
              </div>
            )}
          </div>
        </NavTooltip>
      )}

      <NavTooltip title="New Collection" isCollapsed={isSidebarCollapsed}>
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onClick={showAddCollectionModal}
          className="nav-item"
        >
          <FaFolderPlus size={20} />
        </div>
      </NavTooltip>

      <NavTooltip title="New Request" isCollapsed={isSidebarCollapsed}>
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onClick={() => {
            if (collections.length > 0) {
              onAddRequest([collections[0].id]);
            } else {
              showAddCollectionModal();
            }
          }}
          className="nav-item"
        >
          <FaPlus size={20} />
        </div>
      </NavTooltip>
    </div>
  );

  // Navigation function for Kanban
  const navigateToKanban = () => {
    // Navigate to the kanban route
    if (window.location.pathname !== '/kanban') {
      window.history.pushState({}, '', '/kanban');
      
      // Dispatch a custom event to notify the App component
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Add a function to navigate to Secrets Manager
  const navigateToSecretsManager = () => {
    // Clear any active profile ID to show the list view
    onSelectSecretsProfile && onSelectSecretsProfile({ id: null } as any);
    
    // Navigate to the secrets manager route
    if (window.location.pathname !== '/secrets') {
      window.history.pushState({}, '', '/secrets');
      
      // Dispatch a custom event to notify the App component
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Navigation function for GitHub PRs
  const navigateToGitHub = () => {
    // Navigate to the github route
    if (window.location.pathname !== '/github') {
      window.history.pushState({}, '', '/github');
      
      // Dispatch a custom event to notify the App component
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="expanded"
      animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        width: sidebarWidth,
        height: '100vh',
        position: 'relative',
      }}
    >
      <SidebarContainer style={{ width: '100%', overflowX: 'hidden' }}>
        <ResizeHandle
          className={isResizing ? 'active' : ''}
          onMouseDown={handleResizeStart}
        />
        {/* Don't show the regular sidebar UI if settings are open */}
        {showSettings ? (
          <React.Suspense fallback={<div>Loading Settings...</div>}>
            <SettingsSection 
              onClose={toggleSettings}
            />
          </React.Suspense>
        ) : (
          <>
            <SidebarHeader 
              isSidebarCollapsed={isSidebarCollapsed} 
              toggleCreatePanel={toggleCreatePanel} 
            />

            {/* Collapsed or Expanded Sidebar Content */}
            {isSidebarCollapsed ? (
              renderCollapsedNav()
            ) : (
              <>
                <SidebarSearch filter={filter} setFilter={setFilter} />

                <SidebarContent style={{ overflowX: 'hidden' }}>
                  {settings.general.showCollections && (
                    <CollectionsSection
                      collections={collections}
                      activeRequestId={activeRequestId}
                      expandedFolders={expandedFolders}
                      expandedSections={expandedSections}
                      toggleSection={() => toggleSection('collections')}
                      toggleFolder={toggleFolder}
                      toggleAllFolders={() => toggleAllFolders(collections)}
                      onSelectRequest={onSelectRequest}
                      onAddFolder={showAddCollectionModal}
                      onAddRequest={onAddRequest}
                      handleContextMenu={handleContextMenu}
                      onContextMenuAction={handleContextMenuAction}
                      filter={filter}
                    />
                  )}

              

                  {settings.general.showGitHub && (
                    <GitHubSection
                      onNavigate={navigateToGitHub}
                    />
                  )}

                  {settings.general.showSecretsManager && (
                    <SecretsSection
                      secretsProfiles={secretsProfiles}
                      activeProfileId={activeSecretsProfileId}
                      expanded={expandedSections.secrets}
                      toggleSection={navigateToSecretsManager}
                      onSelectProfile={onSelectSecretsProfile}
                      onAddProfile={onAddSecretsProfile}
                      onImportSecrets={onImportSecrets}
                      onExportSecrets={onExportSecrets}
                      filter={filter}
                    />
                  )}

                  {settings.general.showBoards && (
                    <KanbanSection
                      expanded={expandedSections.kanban}
                      toggleSection={() => toggleSection('kanban')}
                      onAddTodo={navigateToKanban}
                      filter={filter}
                    />
                  )}

                  {settings.general.showNotes && (
                    <NotesSection
                      notes={notes}
                      activeNoteId={activeNoteId}
                      expanded={expandedSections.notes}
                      toggleSection={() => toggleSection('notes')}
                      onSelectNote={onSelectNote}
                      onAddNote={onAddNote}
                      onOpenNoteOptions={setNoteOptionsModal}
                      filter={filter}
                      onNavigateToNotes={onNavigateToNotes}
                    />
                  )}

                      {/* AI Prompts Section */}
                      <AIPromptsSection
                    expanded={expandedSections.aiPrompts}
                    toggleSection={() => toggleSection('aiPrompts')}
                    onNavigateToPrompts={navigateToAIPrompts}
                    onAddNewPrompt={handleAddNewPrompt}
                    onViewSavedPrompts={handleViewSavedPrompts}
                  />

                  {settings.general.showHistory && (
                    <HistorySection
                      requestHistory={requestHistory}
                      expanded={expandedSections.history}
                      toggleSection={() => toggleSection('history')}
                      onRestoreFromHistory={onRestoreFromHistory}
                      onClearHistory={onClearHistory}
                    />
                  )}
                </SidebarContent>
              </>
            )}
          </>
        )}

        <SidebarFooter 
          isSidebarCollapsed={isSidebarCollapsed} 
          toggleSidebar={toggleSidebar}
          onOpenSettings={onOpenSettings}
        />

        {/* CreatePanel */}
        <CreatePanel 
          isVisible={showCreatePanel}
          onClose={() => toggleCreatePanel()}
          onAddCollection={showAddCollectionModal}
          onAddRequest={() => {
            if (collections.length > 0) {
              onAddRequest([collections[0].id]);
            } else {
              showAddCollectionModal();
            }
          }}
          onImportCurl={() => {
            toggleCreatePanel();
            setShowImportCurlModal(true);
          }}
          onImportFile={() => {
            toggleCreatePanel();
            setShowImportFileModal(true);
          }}
        />

        {/* Modals */}
        <ImportCurlModal
          isOpen={showImportCurlModal}
          onClose={() => setShowImportCurlModal(false)}
          onImport={onImportFromCurl}
        />

        <ImportFileModal
          isOpen={showImportFileModal}
          onClose={() => setShowImportFileModal(false)}
          onImport={onImportFromFile}
        />

        {/* Modals */}
        <RenameModal
          isOpen={renameModal.visible}
          onClose={() => setRenameModal({ ...renameModal, visible: false })}
          onRename={handleRename}
          currentName={renameModal.item?.name || renameModal.item?.title || ''}
          itemType={renameModal.itemType}
        />

        <DeleteModal
          isOpen={deleteModal.visible}
          onClose={() => setDeleteModal({ ...deleteModal, visible: false })}
          onDelete={handleDelete}
          itemType={deleteModal.itemType}
          itemName={deleteModal.item?.name || deleteModal.item?.title || ''}
        />

        <MoveModal
          isOpen={moveModal.visible}
          onClose={() => setMoveModal({ ...moveModal, visible: false })}
          onMove={handleMove}
          collections={collections}
          itemType={moveModal.itemType}
          currentPath={moveModal.path}
        />

        {/* Add the NoteOptionsModal */}
        {noteOptionsModal && (
          <NoteOptionsModal
            isOpen={noteOptionsModal !== null}
            note={noteOptionsModal}
            onClose={() => setNoteOptionsModal(null)}
            onRename={(updatedNote) => {
              onRenameNote(updatedNote.id, updatedNote.title);
              setNoteOptionsModal(null);
            }}
            onDelete={(noteId) => {
              onDeleteNote(noteId);
              setNoteOptionsModal(null);
            }}
            onUpdateTags={(note, tags) => {
              // Just close the modal for now - the App component doesn't support tags directly
              setNoteOptionsModal(null);
            }}
            onDuplicate={(note) => {
              onDuplicateNote && onDuplicateNote(note.id);
              setNoteOptionsModal(null);
            }}
            onExport={(note) => {
              onExportNote && onExportNote(note.id);
              setNoteOptionsModal(null);
            }}
          />
        )}

        <AddRequestModal
          isOpen={addRequestModal.visible}
          onClose={hideAddRequestModal}
          onAddRequest={handleAddRequest}
          path={addRequestModal.path}
        />

        <AddCollectionModal
          isOpen={addCollectionModal.visible}
          onClose={hideAddCollectionModal}
          onAddCollection={handleAddCollection}
        />

        {/* Context Menu */}
        {renderContextMenu()}
      </SidebarContainer>
    </motion.div>
  );
}

export default Sidebar; 