import React, { useEffect, useRef } from 'react';
import { FaFolderPlus, FaPlus, FaTerminal, FaFileImport } from 'react-icons/fa';
import {
  CreatePanel as CreatePanelContainer,
  CreatePanelHeader,
  CreatePanelItem
} from '../../../styles/StyledComponents';

interface CreatePanelProps {
  isVisible: boolean;
  onClose: () => void;
  onAddCollection: () => void;
  onAddRequest: () => void;
  onImportCurl: () => void;
  onImportFile: () => void;
}

const CreatePanel: React.FC<CreatePanelProps> = ({
  isVisible,
  onClose,
  onAddCollection,
  onAddRequest,
  onImportCurl,
  onImportFile
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close create panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <CreatePanelContainer ref={panelRef}>
      <CreatePanelHeader>Create New</CreatePanelHeader>
      <CreatePanelItem onClick={onAddCollection}>
        <FaFolderPlus size={16} />
        <span>Collection</span>
      </CreatePanelItem>
      <CreatePanelItem onClick={onAddRequest}>
        <FaPlus size={16} />
        <span>Request</span>
      </CreatePanelItem>
      <CreatePanelHeader style={{ marginTop: 4 }}>
        Import
      </CreatePanelHeader>
      <CreatePanelItem onClick={onImportCurl}>
        <FaTerminal size={16} />
        <span>From cURL</span>
      </CreatePanelItem>
      <CreatePanelItem onClick={onImportFile}>
        <FaFileImport size={16} />
        <span>From File</span>
      </CreatePanelItem>
    </CreatePanelContainer>
  );
};

export default CreatePanel; 