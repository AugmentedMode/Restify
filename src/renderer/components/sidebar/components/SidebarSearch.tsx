import React, { useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { SearchContainer, SearchIcon, SearchInput, KeyboardShortcutBadge } from '../../../styles/StyledComponents';

interface SidebarSearchProps {
  filter: string;
  setFilter: (value: string) => void;
}

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const SidebarSearch: React.FC<SidebarSearchProps> = ({ filter, setFilter }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SearchContainer>
      <SearchIcon>
        <FaSearch size={14} />
      </SearchIcon>
      <SearchInput
        ref={inputRef}
        placeholder="Search workspace"
        value={filter}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
      />
      <KeyboardShortcutBadge>{isMac ? '\u2318K' : 'Ctrl K'}</KeyboardShortcutBadge>
    </SearchContainer>
  );
};

export default SidebarSearch;
