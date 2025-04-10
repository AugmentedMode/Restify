import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaStickyNote, FaSearch } from 'react-icons/fa';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid #333;
  z-index: 10;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: rgba(255, 56, 92, 0.1);
  color: #FF385C;
  font-size: 1rem;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 220px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 6px 12px 6px 32px;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: #333;
  color: #fff;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }

  &::placeholder {
    color: #777;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
  font-size: 0.8rem;
`;

interface ActionButtonProps {
  $isPrimary?: boolean;
  $iconOnly?: boolean;
}

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$isPrimary ? '#FF385C' : '#333'};
  color: ${props => props.$isPrimary ? 'white' : '#ccc'};
  border: ${props => props.$isPrimary ? 'none' : '1px solid #444'};
  border-radius: 4px;
  padding: ${props => props.$isPrimary ? '6px 12px' : '6px 8px'};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$isPrimary ? '#e63054' : '#444'};
  }
  
  svg {
    margin-right: ${props => props.$iconOnly ? '0' : '6px'};
    font-size: 0.9rem;
  }
`;

interface NoteHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNote: () => void;
}

const NoteHeader: React.FC<NoteHeaderProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onAddNote
}) => {
  return (
    <Header>
      <TitleArea>
        <IconWrapper>
          <FaStickyNote />
        </IconWrapper>
        <Title>{title}</Title>
      </TitleArea>
      <Controls>
        <SearchWrapper>
          <SearchIconWrapper>
            <FaSearch />
          </SearchIconWrapper>
          <SearchInput 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchWrapper>
        <ActionButton 
          $isPrimary 
          onClick={onAddNote}
        >
          <FaPlus />
          New Note
        </ActionButton>
      </Controls>
    </Header>
  );
};

export default NoteHeader; 