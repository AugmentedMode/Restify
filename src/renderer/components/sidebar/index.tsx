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
  FaChevronLeft,
  FaChevronRight,
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
  SectionLabel,
  SectionLabelAction,
  SidebarDivider,
} from '../../styles/StyledComponents';
import { modalDataStore } from '../../utils/modalDataStore';
import { useSettings } from '../../utils/SettingsContext';

// Components
import SidebarHeader from './components/SidebarHeader';
import SidebarFooter from './components/SidebarFooter';
import SidebarSearch from './components/SidebarSearch';
import CreatePanel from './components/CreatePanel';
import NavTooltip from './components/NavTooltip';
import NavItemRow from './components/NavItemRow';
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
  const { settings } = useSettings();

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

  const [filter, setFilter] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Navigation helpers
  const navigateToAIPrompts = () => {
    if (window.location.pathname !== '/ai-prompts') {
      window.history.pushState({}, '', '/ai-prompts');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleAddNewPrompt = () => {
    if (window.location.pathname !== '/ai-prompts/new') {
      window.history.pushState({}, '', '/ai-prompts/new');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleViewSavedPrompts = () => {
    if (window.location.pathname !== '/ai-prompts/saved') {
      window.history.pushState({}, '', '/ai-prompts/saved');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const navigateToKanban = () => {
    if (window.location.pathname !== '/kanban') {
      window.history.pushState({}, '', '/kanban');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const navigateToSecretsManager = () => {
    onSelectSecretsProfile && onSelectSecretsProfile({ id: null } as any);
    if (window.location.pathname !== '/secrets') {
      window.history.pushState({}, '', '/secrets');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const navigateToGitHub = () => {
    if (window.location.pathname !== '/github') {
      window.history.pushState({}, '', '/github');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const navigateToAI = () => {
    if (window.location.pathname !== '/ai') {
      window.history.pushState({}, '', '/ai');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const navigateToHistory = () => {
    toggleSection('history');
  };

  // Handlers
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

  const handleDelete = () => {
    if (deleteModal.item && deleteModal.itemType) {
      onDeleteItem(deleteModal.item.id, deleteModal.itemType);
      setDeleteModal({ ...deleteModal, visible: false });
    }
  };

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

  const handleAddRequest = (request: ApiRequest, path: string[]) => {
    modalDataStore.setLastCreatedRequest(request);
    onAddRequest(path);
    hideAddRequestModal();
  };

  const handleAddCollection = (collection: Folder) => {
    modalDataStore.setLastCreatedCollection(collection);
    onAddFolder(collection.id);
    hideAddCollectionModal();
  };

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
          itemType: itemType === 'note' ? 'request' : itemType,
          path,
        });
        break;
      case 'delete':
        setDeleteModal({
          visible: true,
          item,
          itemType: itemType === 'note' ? 'request' : itemType,
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
        } else if ('title' in item) {
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

  // Collapsed sidebar navigation
  const renderCollapsedNav = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        gap: '12px',
      }}
    >
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
            onClick={navigateToHistory}
            className="nav-item"
          >
            <FaHistory size={18} />
          </div>
        </NavTooltip>
      )}

      {settings.general.showBoards && (
        <NavTooltip title="Kanban Board" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: currentRoute === '/kanban'
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: currentRoute === '/kanban' ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
            onClick={navigateToKanban}
            className="nav-item"
          >
            <FaColumns size={18} />
          </div>
        </NavTooltip>
      )}

      <NavTooltip title="AI Assistant" isCollapsed={isSidebarCollapsed}>
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: currentRoute === '/ai'
              ? 'rgba(255, 56, 92, 0.1)'
              : 'transparent',
            color: currentRoute === '/ai' ? '#FF385C' : 'inherit',
            transition: 'all 0.2s',
          }}
          onClick={navigateToAI}
          className="nav-item"
        >
          <FaRobot size={18} />
        </div>
      </NavTooltip>

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
            <FaBookmark size={18} />
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
            <FaStickyNote size={18} />
          </div>
        </NavTooltip>
      )}

      {settings.general.showSecretsManager && (
        <NavTooltip title="Secrets Manager" isCollapsed={isSidebarCollapsed}>
          <div
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: currentRoute === '/secrets'
                ? 'rgba(255, 56, 92, 0.1)'
                : 'transparent',
              color: currentRoute === '/secrets' ? '#FF385C' : 'inherit',
              transition: 'all 0.2s',
            }}
            onClick={navigateToSecretsManager}
            className="nav-item"
          >
            <FaKey size={18} />
          </div>
        </NavTooltip>
      )}

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
          onClick={navigateToAIPrompts}
          className="nav-item"
        >
          <FaLightbulb size={18} />
        </div>
      </NavTooltip>

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
            <FaGithub size={18} />
          </div>
        </NavTooltip>
      )}
    </div>
  );

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
            />

            {isSidebarCollapsed ? (
              renderCollapsedNav()
            ) : (
              <>
                <SidebarSearch filter={filter} setFilter={setFilter} />

                {/* Zone 1: Quick Nav */}
                <div style={{ padding: '4px 0' }}>
                  {settings.general.showHistory && (
                    <NavItemRow
                      icon={<FaHistory />}
                      label="History"
                      badge={requestHistory.length}
                      active={expandedSections.history}
                      onClick={navigateToHistory}
                    />
                  )}
                  {settings.general.showBoards && (
                    <NavItemRow
                      icon={<FaColumns />}
                      label="Kanban Board"
                      active={currentRoute === '/kanban'}
                      onClick={navigateToKanban}
                    />
                  )}
                  <NavItemRow
                    icon={<FaRobot />}
                    label="AI Assistant"
                    active={currentRoute === '/ai'}
                    onClick={navigateToAI}
                  />
                </div>

                {/* Zone 2: Collections (scrollable middle) */}
                <SidebarContent style={{ overflowX: 'hidden' }}>
                  {settings.general.showCollections && (
                    <>
                      <SectionLabel>
                        <span>COLLECTIONS</span>
                        <SectionLabelAction
                          onClick={showAddCollectionModal}
                          title="New Collection"
                        >
                          <FaPlus />
                        </SectionLabelAction>
                      </SectionLabel>
                      <CollectionsSection
                        collections={collections}
                        activeRequestId={activeRequestId}
                        expandedFolders={expandedFolders}
                        toggleFolder={toggleFolder}
                        onSelectRequest={onSelectRequest}
                        onAddFolder={showAddCollectionModal}
                        onAddRequest={onAddRequest}
                        handleContextMenu={handleContextMenu}
                        onContextMenuAction={handleContextMenuAction}
                        filter={filter}
                      />
                    </>
                  )}

                  {/* Inline expanded sections */}
                  {expandedSections.history && settings.general.showHistory && (
                    <HistorySection
                      requestHistory={requestHistory}
                      expanded={expandedSections.history}
                      toggleSection={() => toggleSection('history')}
                      onRestoreFromHistory={onRestoreFromHistory}
                      onClearHistory={onClearHistory}
                    />
                  )}
                </SidebarContent>

                {/* Zone 3: Lower Nav */}
                <SidebarDivider />
                <div style={{ padding: '4px 0' }}>
                  {settings.general.showNotes && (
                    <NavItemRow
                      icon={<FaStickyNote />}
                      label="Notes"
                      active={expandedSections.notes}
                      onClick={() => {
                        toggleSection('notes');
                        onNavigateToNotes();
                      }}
                    />
                  )}
                  {settings.general.showSecretsManager && (
                    <NavItemRow
                      icon={<FaKey />}
                      label="Secrets Manager"
                      active={currentRoute === '/secrets'}
                      onClick={navigateToSecretsManager}
                    />
                  )}
                  <NavItemRow
                    icon={<FaLightbulb />}
                    label="AI Prompts"
                    active={currentRoute.startsWith('/ai-prompts')}
                    onClick={navigateToAIPrompts}
                  />
                  {settings.general.showGitHub && (
                    <NavItemRow
                      icon={<FaGithub />}
                      label="Pull Requests"
                      active={currentRoute === '/github'}
                      onClick={navigateToGitHub}
                    />
                  )}
                </div>
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
