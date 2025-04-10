import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaFolder,
  FaFolderOpen,
  FaPlus,
  FaPen,
  FaTrash,
  FaArrowRight,
  FaFolderPlus,
  FaGlobe,
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaEraser,
  FaBookmark,
  FaChevronUp,
  FaEllipsisV,
  FaFileImport,
  FaTerminal,
  FaCopy,
  FaGlobeAmericas,
  FaStickyNote,
  FaFile,
  FaFileAlt,
  FaHistory,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiRequest, Folder, HttpMethod, RequestHistoryItem, Environment, Note } from '../types';
import { getMethodColor } from '../utils/uiUtils';
import {
  Sidebar as SidebarContainer,
  SidebarHeader,
  Logo,
  SidebarContent,
  FolderItem,
  RequestItem,
  ContextMenu,
  ContextMenuItem,
  ContextMenuDivider,
  CollectionItemContainer,
  RequestItemContainer,
  ResizeHandle,
  CreateButton,
  CreatePanel,
  CreatePanelHeader,
  CreatePanelItem,
  CollapsibleSection,
  SectionHeader,
  HistoryItem,
  HistoryItemsContainer,
  EmptyHistoryMessage,
  SearchContainer,
  SearchInput,
  SearchIcon,
  SidebarFooter,
  FooterButton,
  CollectionHeader,
  CollectionIcon,
  CollectionTitle,
  ActionButtons,
  ActionButton,
} from '../styles/StyledComponents';
import RenameModal from './modals/RenameModal';
import DeleteModal from './modals/DeleteModal';
import MoveModal from './modals/MoveModal';
import ImportCurlModal from './modals/ImportCurlModal';
import ImportFileModal from './modals/ImportFileModal';
import EnvironmentManager from './EnvironmentManager';
import { handleNoteOptions } from './notes/NotesContainer';
import NoteOptionsModal from './notes/modals/NoteOptionsModal';

// Animation variants
const sidebarVariants = {
  expanded: { width: 300 },
  collapsed: { width: 70 },
};

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

const iconVariants = {
  expanded: { rotate: 0 },
  collapsed: { rotate: 180 },
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
  // Load expanded folders from localStorage
  const getInitialExpandedFolders = (): Record<string, boolean> => {
    try {
      const saved = localStorage.getItem('api-client-expanded-folders');
      return saved ? JSON.parse(saved) : {};
    } catch (err) {
      console.error('Failed to load expanded folders state:', err);
      return {};
    }
  };

  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >(getInitialExpandedFolders());
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [filter, setFilter] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showImportCurlModal, setShowImportCurlModal] = useState(false);
  const [showImportFileModal, setShowImportFileModal] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const createPanelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    item: any;
    itemType: 'collection' | 'request' | 'folder';
    path: string[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    itemType: 'request',
    path: [],
  });

  const [renameModal, setRenameModal] = useState<{
    visible: boolean;
    item: any;
    itemType: 'collection' | 'request' | 'folder';
    path: string[];
  }>({
    visible: false,
    item: null,
    itemType: 'request',
    path: [],
  });

  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    item: any;
    itemType: 'collection' | 'request' | 'folder';
    path: string[];
  }>({
    visible: false,
    item: null,
    itemType: 'request',
    path: [],
  });

  const [moveModal, setMoveModal] = useState<{
    visible: boolean;
    item: any;
    itemType: 'request' | 'folder';
    path: string[];
  }>({
    visible: false,
    item: null,
    itemType: 'request',
    path: [],
  });

  const [expandedSections, setExpandedSections] = useState<{
    collections: boolean;
    history: boolean;
    environments: boolean;
    notes: boolean;
  }>({
    collections: true,
    history: false,
    environments: false,
    notes: true,
  });

  // Add state for the note options modal
  const [noteOptionsModal, setNoteOptionsModal] = useState<Note | null>(null);

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  // Close create panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCreatePanel &&
        createPanelRef.current &&
        !createPanelRef.current.contains(event.target as Node)
      ) {
        setShowCreatePanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreatePanel]);

  const handleContextMenu = (
    e: React.MouseEvent,
    item: any,
    itemType: 'collection' | 'request' | 'folder',
    path: string[] = [],
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
      itemType,
      path,
    });
  };

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
      onDeleteItem(deleteModal.item.id, deleteModal.itemType, deleteModal.path);
      setDeleteModal({ ...deleteModal, visible: false });
    }
  };

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

  // Move all resize handlers inside useCallback to properly memoize them
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = startWidthRef.current + (e.clientX - startXRef.current);
      if (newWidth >= 180 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    },
    [isResizing],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startXRef.current = e.clientX;
      startWidthRef.current = sidebarWidth;
      setIsResizing(true);
    },
    [sidebarWidth],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Setup global event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Filter collections based on search input
  const filterCollections = (
    collections: Folder[],
    filter: string,
  ): Folder[] => {
    if (!filter.trim()) return collections;

    const lowerFilter = filter.toLowerCase();

    return collections
      .map((collection) => {
        // Check if collection name matches filter
        const collectionMatches = collection.name
          .toLowerCase()
          .includes(lowerFilter);

        // Check if any request in collection matches filter
        const items = [...(collection.items || [])];
        const filteredItems = items.filter((item) => {
          if ('method' in item) {
            // It's a request
            return (
              item.name.toLowerCase().includes(lowerFilter) ||
              item.url.toLowerCase().includes(lowerFilter) ||
              item.method.toLowerCase().includes(lowerFilter)
            );
          }
          // It's a folder
          // Recursively filter folders
          const filteredFolder = filterCollections([item as Folder], filter)[0];
          return (
            filteredFolder &&
            filteredFolder.items &&
            filteredFolder.items.length > 0
          );
        });

        // Return collection with filtered items if it matches or has matching items
        if (collectionMatches || filteredItems.length > 0) {
          return {
            ...collection,
            items: filteredItems,
          };
        }

        return null;
      })
      .filter(Boolean) as Folder[];
  };

  // Toggle expansion for all folders
  const toggleAllFolders = () => {
    // Get all folder IDs
    const folderIds: string[] = [];

    const collectFolderIds = (items: any[], parentPath: string[] = []) => {
      items.forEach((item) => {
        if ('items' in item) {
          folderIds.push(item.id);
          if (item.items) {
            collectFolderIds(item.items, [...parentPath, item.id]);
          }
        }
      });
    };

    collections.forEach((collection) => {
      if (collection.items) {
        collectFolderIds(collection.items);
      }
    });

    // Check if all folders are expanded
    const allExpanded = folderIds.every((id) => expandedFolders[id]);

    // Toggle all folders
    const newExpandedFolders: Record<string, boolean> = {};
    folderIds.forEach((id) => {
      newExpandedFolders[id] = !allExpanded;
    });

    setExpandedFolders(newExpandedFolders);
  };

  // Render collection items recursively
  const renderCollectionItems = (
    items: (ApiRequest | Folder)[],
    parentPath: string[] = [],
  ) => {
    return (
      <motion.div variants={listVariants} initial="hidden" animate="visible">
        {items.map((item) => {
          if ('method' in item) {
            // It's a request
            const request = item as ApiRequest;
            return (
              <motion.div
                key={request.id}
                variants={itemVariants}
                transition={{ duration: 0.2 }}
                whileHover={{ x: 4 }}
              >
                <RequestItemContainer
                  active={activeRequestId === request.id}
                  onClick={() => onSelectRequest(request)}
                  onContextMenu={(e) =>
                    handleContextMenu(e, request, 'request', parentPath)
                  }
                >
                  <RequestItem>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          color: getMethodColor(request.method),
                          fontWeight: 600,
                          marginRight: 8,
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {request.method}
                      </div>
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {request.name}
                      </div>
                    </div>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, request, 'request', parentPath);
                      }}
                      aria-label="Menu"
                      className="action-button"
                    >
                      <FaEllipsisV size={12} />
                    </ActionButton>
                  </RequestItem>
                </RequestItemContainer>
              </motion.div>
            );
          }
          // It's a folder
          const folder = item as Folder;
          const isExpanded = expandedFolders[folder.id];
          const currentPath = [...parentPath, folder.id];

          return (
            <motion.div
              key={folder.id}
              variants={itemVariants}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <CollectionItemContainer
                onContextMenu={(e) =>
                  handleContextMenu(e, folder, 'folder', parentPath)
                }
              >
                <FolderItem
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(folder.id, e);
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                      style={{ marginRight: 8 }}
                    >
                      {isExpanded ? (
                        <FaChevronDown size={12} />
                      ) : (
                        <FaChevronRight size={12} />
                      )}
                    </motion.div>
                    <div style={{ marginRight: 8 }}>
                      {isExpanded ? <FaFolderOpen /> : <FaFolder />}
                    </div>
                    <div>{folder.name}</div>
                  </div>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, folder, 'folder', parentPath);
                    }}
                    aria-label="Menu"
                    className="action-button"
                  >
                    <FaEllipsisV size={12} />
                  </ActionButton>
                </FolderItem>
              </CollectionItemContainer>
              <AnimatePresence>
                {isExpanded && folder.items && folder.items.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginLeft: 16, overflow: 'hidden' }}
                  >
                    {renderCollectionItems(folder.items, currentPath)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  // Toggle section expanded state
  const toggleSectionExpanded = (section: 'collections' | 'history' | 'environments' | 'notes') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Filter collections based on search
  const filteredCollections = filter
    ? filterCollections(collections, filter)
    : collections;

  // Filter notes based on search input
  const filterNotes = (notes: Note[], filter: string): Note[] => {
    if (!filter.trim()) return notes;
    
    const lowerFilter = filter.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerFilter) || 
      (note.content && note.content.toLowerCase().includes(lowerFilter))
    );
  };

  const filteredNotes = filter
    ? filterNotes(notes, filter)
    : notes;

  // Save expanded folders state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'api-client-expanded-folders',
        JSON.stringify(expandedFolders),
      );
    } catch (err) {
      console.error('Failed to save expanded folders state:', err);
    }
  }, [expandedFolders]);

  // Enhanced tooltip for collapsed sidebar
  function NavTooltip({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) {
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {children}
        {isSidebarCollapsed && (
          <div
            style={{
              position: 'absolute',
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.2s',
              marginLeft: '8px',
              zIndex: 1000,
            }}
            className="nav-tooltip"
          >
            {title}
          </div>
        )}
      </div>
    );
  }

  // Handle "From cURL" click in the Create Panel
  const handleCurlImportClick = () => {
    setShowCreatePanel(false);
    setShowImportCurlModal(true);
  };

  // Handle "From File" click in the Create Panel
  const handleFileImportClick = () => {
    setShowCreatePanel(false);
    setShowImportFileModal(true);
  };

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
      <SidebarContainer ref={sidebarRef} style={{ width: '100%', overflowX: 'hidden' }}>
        <ResizeHandle
          className={isResizing ? 'active' : ''}
          onMouseDown={handleResizeStart}
        />
        <SidebarHeader>
          <Logo>
            {isSidebarCollapsed ? (
              <FaGlobe color="#FF385C" size={24} />
            ) : (
              <>
                <FaGlobe color="#FF385C" size={20} />
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Restify API Client
                </motion.span>
              </>
            )}
          </Logo>
          {!isSidebarCollapsed && (
            <CreateButton onClick={() => setShowCreatePanel(!showCreatePanel)}>
              <FaPlus />
            </CreateButton>
          )}
        </SidebarHeader>

        {/* Collapsed navigation menu */}
        {isSidebarCollapsed ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 0',
              gap: '20px',
            }}
          >
            <NavTooltip title="Collections">
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
                onClick={() => toggleSectionExpanded('collections')}
                className="nav-item"
              >
                <FaBookmark size={20} />
              </div>
            </NavTooltip>

            <NavTooltip title="Environments">
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
                onClick={() => toggleSectionExpanded('environments')}
                className="nav-item"
              >
                <FaGlobeAmericas size={20} />
              </div>
            </NavTooltip>

            <NavTooltip title="History">
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
                onClick={() => toggleSectionExpanded('history')}
                className="nav-item"
              >
                <FaHistory size={20} />
              </div>
            </NavTooltip>

            <NavTooltip title="Notes">
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
                onClick={() => toggleSectionExpanded('notes')}
                className="nav-item"
              >
                <FaStickyNote size={20} />
              </div>
            </NavTooltip>

            <NavTooltip title="New Collection">
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

            <NavTooltip title="New Request">
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
        ) : (
          <>
            <SearchContainer>
              <SearchIcon>
                <FaSearch size={14} />
              </SearchIcon>
              <SearchInput
                placeholder="Search..."
                value={filter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilter(e.target.value)
                }
              />
            </SearchContainer>

            <SidebarContent style={{ overflowX: 'hidden' }}>
              <CollapsibleSection expanded={expandedSections.collections} style={{ overflowX: 'hidden' }}>
                <SectionHeader
                  onClick={() => toggleSectionExpanded('collections')}
                >
                  <CollectionHeader>
                    <CollectionIcon>
                      <FaBookmark />
                    </CollectionIcon>
                    <CollectionTitle>Collections</CollectionTitle>
                  </CollectionHeader>
                  <ActionButtons>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFolder();
                      }}
                      title="Add Collection"
                      className="action-button"
                    >
                      <FaFolderPlus />
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllFolders();
                      }}
                      title="Expand/Collapse All"
                      className="action-button"
                    >
                      {expandedFolders ? <FaChevronUp /> : <FaChevronDown />}
                    </ActionButton>
                    <motion.div
                      animate={
                        expandedSections.collections ? 'expanded' : 'collapsed'
                      }
                      variants={iconVariants}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown size={12} />
                    </motion.div>
                  </ActionButtons>
                </SectionHeader>
                <AnimatePresence>
                  {expandedSections.collections && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {filteredCollections.length === 0 ? (
                        <EmptyHistoryMessage>
                          {filter
                            ? 'No matching collections found.'
                            : 'No collections yet. Create one to get started.'}
                        </EmptyHistoryMessage>
                      ) : (
                        filteredCollections.map((collection) => (
                          <motion.div
                            key={collection.id}
                            variants={itemVariants}
                            transition={{ duration: 0.2 }}
                          >
                            <CollectionItemContainer
                              onContextMenu={(e) =>
                                handleContextMenu(
                                  e,
                                  collection,
                                  'collection',
                                  [],
                                )
                              }
                            >
                              <FolderItem
                                onClick={(e) => {
                                  toggleFolder(collection.id, e);
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flex: 1,
                                  }}
                                >
                                  <motion.div
                                    animate={{
                                      rotate: expandedFolders[collection.id]
                                        ? 0
                                        : -90,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    style={{ marginRight: 8 }}
                                  >
                                    {expandedFolders[collection.id] ? (
                                      <FaChevronDown size={12} />
                                    ) : (
                                      <FaChevronRight size={12} />
                                    )}
                                  </motion.div>
                                  <div style={{ marginRight: 8 }}>
                                    {expandedFolders[collection.id] ? (
                                      <FaFolderOpen />
                                    ) : (
                                      <FaFolder />
                                    )}
                                  </div>
                                  <div>{collection.name}</div>
                                </div>
                                <ActionButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContextMenu(
                                      e,
                                      collection,
                                      'collection',
                                      [],
                                    );
                                  }}
                                  aria-label="Menu"
                                  className="action-button"
                                >
                                  <FaEllipsisV size={12} />
                                </ActionButton>
                              </FolderItem>
                            </CollectionItemContainer>
                            {expandedFolders[collection.id] &&
                              collection.items && (
                                <div style={{ marginLeft: 16 }}>
                                  {renderCollectionItems(collection.items, [
                                    collection.id,
                                  ])}
                                </div>
                              )}
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleSection>

              <EnvironmentManager 
                environments={environments}
                currentEnvironmentId={currentEnvironmentId}
                onAddEnvironment={onAddEnvironment}
                onUpdateEnvironment={onUpdateEnvironment}
                onDeleteEnvironment={onDeleteEnvironment}
                onSelectEnvironment={onSelectEnvironment}
                expanded={expandedSections.environments}
                onToggleExpanded={() => toggleSectionExpanded('environments')}
              />

                {/* Notes Section */}
                <CollapsibleSection expanded={expandedSections.notes} style={{ overflowX: 'hidden' }}>
                <SectionHeader onClick={() => toggleSectionExpanded('notes')}>
                  <CollectionHeader>
                    <CollectionIcon>
                      <FaStickyNote />
                    </CollectionIcon>
                    <CollectionTitle>Notes</CollectionTitle>
                  </CollectionHeader>
                  <ActionButtons>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNote();
                      }}
                      title="Add Note"
                      className="action-button"
                    >
                      <FaPlus />
                    </ActionButton>
                    <motion.div
                      animate={
                        expandedSections.notes ? 'expanded' : 'collapsed'
                      }
                      variants={iconVariants}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown size={12} />
                    </motion.div>
                  </ActionButtons>
                </SectionHeader>
                <AnimatePresence>
                  {expandedSections.notes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {filteredNotes.length === 0 ? (
                        <EmptyHistoryMessage>
                          {filter
                            ? 'No matching notes found.'
                            : 'No notes yet. Create one to get started.'}
                        </EmptyHistoryMessage>
                      ) : (
                        <motion.div
                          variants={listVariants}
                          initial="hidden"
                          animate="visible"
                          style={{ marginLeft: 16 }}
                        >
                          {filteredNotes.map((note) => (
                            <motion.div
                              key={note.id}
                              variants={itemVariants}
                              transition={{ duration: 0.2 }}
                              whileHover={{ x: 4 }}
                            >
                              <RequestItemContainer
                                active={activeNoteId === note.id}
                                onClick={() => onSelectNote(note)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenu({
                                    visible: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    item: note,
                                    itemType: 'request', // Reuse request context menu for now
                                    path: [],
                                  });
                                }}
                              >
                                <RequestItem>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      overflow: 'hidden',
                                      flex: 1,
                                    }}
                                  >
                                    <div
                                      style={{
                                        marginRight: 8,
                                        color: '#6c757d',
                                      }}
                                    >
                                      <FaFileAlt size={14} />
                                    </div>
                                    <div
                                      style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {note.title}
                                    </div>
                                  </div>
                                  <ActionButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNoteOptionsModal(note);
                                    }}
                                    aria-label="Options"
                                    className="action-button"
                                  >
                                    <FaEllipsisV size={12} />
                                  </ActionButton>
                                </RequestItem>
                              </RequestItemContainer>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleSection>

              <CollapsibleSection expanded={expandedSections.history} style={{ overflowX: 'hidden' }}>
                <SectionHeader onClick={() => toggleSectionExpanded('history')}>
                  <CollectionHeader>
                    <CollectionIcon>
                      <FaHistory />
                    </CollectionIcon>
                    <CollectionTitle>History</CollectionTitle>
                  </CollectionHeader>
                  <ActionButtons>
                    {requestHistory.length > 0 && (
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearHistory();
                        }}
                        title="Clear History"
                        className="action-button"
                      >
                        <FaEraser />
                      </ActionButton>
                    )}
                    <motion.div
                      animate={
                        expandedSections.history ? 'expanded' : 'collapsed'
                      }
                      variants={iconVariants}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown size={12} />
                    </motion.div>
                  </ActionButtons>
                </SectionHeader>
                <AnimatePresence>
                  {expandedSections.history && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <HistoryItemsContainer style={{ overflowX: 'hidden' }}>
                        {requestHistory.length === 0 ? (
                          <EmptyHistoryMessage>
                            No request history yet.
                          </EmptyHistoryMessage>
                        ) : (
                          <motion.div
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {requestHistory
                              .slice()
                              .sort((a, b) => b.timestamp - a.timestamp)
                              .slice(0, 10)
                              .map((historyItem) => (
                                <motion.div
                                  key={historyItem.id}
                                  variants={itemVariants}
                                  transition={{ duration: 0.2 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <HistoryItem
                                    onClick={() =>
                                      onRestoreFromHistory(historyItem)
                                    }
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <div
                                        style={{
                                          color: getMethodColor(
                                            historyItem.request.method,
                                          ),
                                          fontWeight: 600,
                                          marginRight: 8,
                                          fontSize: '0.75rem',
                                        }}
                                      >
                                        {historyItem.request.method}
                                      </div>
                                      <div
                                        style={{
                                          maxWidth: 150,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {historyItem.request.name ||
                                          historyItem.request.url}
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: '0.7rem',
                                        opacity: 0.7,
                                        marginTop: 4,
                                      }}
                                    >
                                      {formatTimestamp(historyItem.timestamp)}
                                    </div>
                                  </HistoryItem>
                                </motion.div>
                              ))}
                          </motion.div>
                        )}
                      </HistoryItemsContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CollapsibleSection>
            </SidebarContent>
          </>
        )}

        <SidebarFooter>
          <FooterButton
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          >
            <FaArrowRight />
          </FooterButton>
        </SidebarFooter>

        {/* Create Panel */}
        {showCreatePanel && (
          <CreatePanel ref={createPanelRef}>
            <CreatePanelHeader>Create New</CreatePanelHeader>
            <CreatePanelItem onClick={onAddFolder}>
              <FaFolderPlus size={16} />
              <span>Collection</span>
            </CreatePanelItem>
            <CreatePanelItem
              onClick={() => {
                if (collections.length > 0) {
                  onAddRequest([collections[0].id]);
                } else {
                  onAddFolder();
                }
              }}
            >
              <FaPlus size={16} />
              <span>Request</span>
            </CreatePanelItem>
            <CreatePanelHeader style={{ marginTop: 4 }}>
              Import
            </CreatePanelHeader>
            <CreatePanelItem onClick={handleCurlImportClick}>
              <FaTerminal size={16} />
              <span>From cURL</span>
            </CreatePanelItem>
            <CreatePanelItem onClick={handleFileImportClick}>
              <FaFileImport size={16} />
              <span>From File</span>
            </CreatePanelItem>
          </CreatePanel>
        )}

        {/* Import Modals */}
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

        {/* Context Menu */}
        {contextMenu.visible && (
          <ContextMenu
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
            }}
          >
            {contextMenu.itemType === 'request' && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    setRenameModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType: contextMenu.itemType,
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaPen size={12} />
                  <span>Rename</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    onDuplicateRequest(contextMenu.item.id, contextMenu.path);
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaCopy size={12} />
                  <span>Duplicate</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setMoveModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType:
                        contextMenu.itemType === 'collection'
                          ? 'folder'
                          : (contextMenu.itemType as 'folder' | 'request'),
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaArrowRight size={12} />
                  <span>Move</span>
                </ContextMenuItem>
                <ContextMenuDivider />
                <ContextMenuItem
                  onClick={() => {
                    setDeleteModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType: contextMenu.itemType,
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaTrash size={12} />
                  <span>Delete</span>
                </ContextMenuItem>
              </>
            )}
            {contextMenu.itemType === 'folder' && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    onAddRequest([...contextMenu.path, contextMenu.item.id]);
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaPlus size={12} />
                  <span>Add Request</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setRenameModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType: contextMenu.itemType,
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaPen size={12} />
                  <span>Rename</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setMoveModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType:
                        contextMenu.itemType === 'collection'
                          ? 'folder'
                          : (contextMenu.itemType as 'folder' | 'request'),
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaArrowRight size={12} />
                  <span>Move</span>
                </ContextMenuItem>
                <ContextMenuDivider />
                <ContextMenuItem
                  onClick={() => {
                    setDeleteModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType: contextMenu.itemType,
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaTrash size={12} />
                  <span>Delete</span>
                </ContextMenuItem>
              </>
            )}
            {contextMenu.itemType === 'collection' && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    onAddRequest([contextMenu.item.id]);
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaPlus size={12} />
                  <span>Add Request</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setRenameModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType: contextMenu.itemType,
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaPen size={12} />
                  <span>Rename</span>
                </ContextMenuItem>
                <ContextMenuDivider />
                <ContextMenuItem
                  onClick={() => {
                    setDeleteModal({
                      visible: true,
                      item: contextMenu.item,
                      itemType: contextMenu.itemType,
                      path: contextMenu.path,
                    });
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaTrash size={12} />
                  <span>Delete</span>
                </ContextMenuItem>
              </>
            )}
            
            {/* Add note specific context menu handling if the item is a note */}
            {contextMenu.item && 'title' in contextMenu.item && (
              <>
                <ContextMenuItem
                  onClick={() => {
                    // Instead of using the rename modal, open the options modal
                    setNoteOptionsModal(contextMenu.item);
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaPen size={12} />
                  <span>Options</span>
                </ContextMenuItem>
                <ContextMenuDivider />
                <ContextMenuItem
                  onClick={() => {
                    onDeleteNote(contextMenu.item.id);
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  <FaTrash size={12} />
                  <span>Delete</span>
                </ContextMenuItem>
              </>
            )}
          </ContextMenu>
        )}
      </SidebarContainer>

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
    </motion.div>
  );
}

export default Sidebar;
