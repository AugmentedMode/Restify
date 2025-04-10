import React from 'react';
import styled from 'styled-components';
import { FaEllipsisH } from 'react-icons/fa';
import { Note } from '../../types';

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid #333;
`;

const TitleContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const NoteTitle = styled.input`
  font-size: 0.95rem;
  font-weight: 500;
  color: #eee;
  background: transparent;
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  width: 300px;
  
  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &::placeholder {
    color: #888;
  }
`;

const LastEdited = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-left: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #ccc;
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
`;

interface NoteToolbarProps {
  note: Note;
  onOptions: () => void;
}

const NoteToolbar: React.FC<NoteToolbarProps> = ({ note, onOptions }) => {
  // Format the date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Toolbar>
      <TitleContainer>
        <NoteTitle
          value={note.title}
          placeholder="Untitled Note"
          onChange={(e) => {
            // This needs to be integrated with the parent's onRenameNote
            // Typically would be handled by the parent component
          }}
        />
        <LastEdited>
          Last edited: {formatDate(note.updatedAt)}
        </LastEdited>
      </TitleContainer>
      <ActionButton onClick={onOptions}>
        <FaEllipsisH />
      </ActionButton>
    </Toolbar>
  );
};

export default NoteToolbar; 