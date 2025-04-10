import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBookmark,
  FaHistory,
  FaGlobeAmericas,
  FaStickyNote,
  FaFolderPlus,
  FaPlus,
} from 'react-icons/fa';
import { Sidebar as SidebarContainer, SidebarContent, ResizeHandle } from '../../styles/StyledComponents';

// Components
import SidebarHeader from './components/SidebarHeader';
import SidebarFooter from './components/SidebarFooter';
import SidebarSearch from './components/SidebarSearch';
import CreatePanel from './components/CreatePanel';
import NavTooltip from './components/NavTooltip';
import CollectionsSection from './sections/CollectionsSection';
import HistorySection from './sections/HistorySection';
import NotesSection from './sections/NotesSection';
import EnvironmentManager from '../EnvironmentManager';

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

// Types
import { ApiRequest, Folder, HttpMethod, RequestHistoryItem, Environment, Note } from '../../types';

// Animation variants
const sidebarVariants = {
  expanded: { width: 300 },
  collapsed: { width: 70 },
};

interface SidebarProps {
  collections: Folder[];
  activeRequestId: string | null;
  onSelectRequest: (request: ApiRequest) => void;
  onAddFolder: () => void;
  onAddRequest: (folderPath: string[]) => void;
  onRenameItem: (
    itemId: string,
    newName: string,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => void;
  onDeleteItem: (
    itemId: string,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => void;
  onMoveItem: (
    itemId: string,
    itemType: 'folder' | 'request',
    sourcePath: string[],
    targetPath: string[],
  ) => void;
  onDuplicateRequest: (requestId: string, path: string[]) => void;
  onImportFromCurl?: (curlCommand: string) => void;
  onImportFromFile?: (fileContent: string, fileName: string) => void;
  requestHistory?: RequestHistoryItem[];
  onRestoreFromHistory?: (historyItem: RequestHistoryItem) => void;
  onClearHistory?: () => void;
  environments?: Environment[];
  currentEnvironmentId?: string | null;
  onAddEnvironment?: (environment: Environment) => void;
  onUpdateEnvironment?: (environment: Environment) => void;
  onDeleteEnvironment?: (environmentId: string) => void;
  onSelectEnvironment?: (environmentId: string | null) => void;
  notes?: Note[];
  activeNoteId?: string | null;
  onSelectNote?: (note: Note) => void;
  onAddNote?: () => void;
  onRenameNote?: (noteId: string, newName: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDuplicateNote?: (note: Note) => void;
  onExportNote?: (note: Note) => void;
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
}: SidebarProps) {
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
    noteOptionsModal,
    setNoteOptionsModal,
    showCreatePanel,
    toggleCreatePanel,
  } = useModalState();

  // Additional state
  const [filter, setFilter] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
      onDeleteItem(deleteModal.item.id, deleteModal.itemType, deleteModal.path);
      setDeleteModal({ ...deleteModal, visible: false });
    }
  };

  // Handle move
  const handleMove = (targetPath: string[]) => {
    if (moveModal.item && moveModal.itemType) {
      onMoveItem(
        moveModal.item.id,
        moveModal.itemType,
        moveModal.path,
        targetPath,
      );
      setMoveModal({ ...moveModal, visible: false });
    }
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
          onClick={() => toggleSection('notes')}
          className="nav-item"
        >
          <FaStickyNote size={20} />
        </div>
      </NavTooltip>

      <NavTooltip title="New Collection" isCollapsed={isSidebarCollapsed}>
        <div
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onClick={onAddFolder}
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
              onAddFolder();
            }
          }}
          className="nav-item"
        >
          <FaPlus size={20} />
        </div>
      </NavTooltip>
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
        maxWidth: '100vw',
      }}
    >
      <SidebarContainer style={{ width: '100%', overflowX: 'hidden' }}>
        <ResizeHandle
          className={isResizing ? 'active' : ''}
          onMouseDown={handleResizeStart}
        />
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
              <CollectionsSection
                collections={collections}
                activeRequestId={activeRequestId}
                expandedFolders={expandedFolders}
                expandedSections={expandedSections}
                toggleSection={() => toggleSection('collections')}
                toggleFolder={toggleFolder}
                toggleAllFolders={() => toggleAllFolders(collections)}
                onSelectRequest={onSelectRequest}
                onAddFolder={onAddFolder}
                onAddRequest={onAddRequest}
                handleContextMenu={handleContextMenu}
                filter={filter}
              />

              <EnvironmentManager 
                environments={environments}
                currentEnvironmentId={currentEnvironmentId}
                onAddEnvironment={onAddEnvironment}
                onUpdateEnvironment={onUpdateEnvironment}
                onDeleteEnvironment={onDeleteEnvironment}
                onSelectEnvironment={onSelectEnvironment}
                expanded={expandedSections.environments}
                onToggleExpanded={() => toggleSection('environments')}
              />

              <NotesSection
                notes={notes}
                activeNoteId={activeNoteId}
                expanded={expandedSections.notes}
                toggleSection={() => toggleSection('notes')}
                onSelectNote={onSelectNote}
                onAddNote={onAddNote}
                onOpenNoteOptions={setNoteOptionsModal}
                filter={filter}
              />

              <HistorySection
                requestHistory={requestHistory}
                expanded={expandedSections.history}
                toggleSection={() => toggleSection('history')}
                onRestoreFromHistory={onRestoreFromHistory}
                onClearHistory={onClearHistory}
              />
            </SidebarContent>
          </>
        )}

        <SidebarFooter 
          isSidebarCollapsed={isSidebarCollapsed} 
          toggleSidebar={toggleSidebar} 
        />

        {/* CreatePanel */}
        <CreatePanel 
          isVisible={showCreatePanel}
          onClose={() => toggleCreatePanel()}
          onAddCollection={onAddFolder}
          onAddRequest={() => {
            if (collections.length > 0) {
              onAddRequest([collections[0].id]);
            } else {
              onAddFolder();
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
          onImport={(fileContent, fileName) => {
            onImportFromFile(fileContent, fileName);
          }}
        />

        {/* Modals */}
        {renameModal.visible && (
          <RenameModal
            isOpen={renameModal.visible}
            onClose={() => setRenameModal({ ...renameModal, visible: false })}
            onRename={handleRename}
            currentName={renameModal.item.name}
            itemType={renameModal.itemType}
          />
        )}

        {deleteModal.visible && (
          <DeleteModal
            isOpen={deleteModal.visible}
            onClose={() => setDeleteModal({ ...deleteModal, visible: false })}
            onDelete={handleDelete}
            itemType={deleteModal.itemType}
            itemName={deleteModal.item.name}
          />
        )}

        {moveModal.visible && (
          <MoveModal
            isOpen={moveModal.visible}
            onClose={() => setMoveModal({ ...moveModal, visible: false })}
            onMove={handleMove}
            collections={collections}
            itemType={moveModal.itemType}
            currentPath={moveModal.path}
          />
        )}

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
              onDuplicateNote && onDuplicateNote(note);
              setNoteOptionsModal(null);
            }}
            onExport={(note) => {
              onExportNote && onExportNote(note);
              setNoteOptionsModal(null);
            }}
          />
        )}
      </SidebarContainer>
    </motion.div>
  );
}

export default Sidebar; 