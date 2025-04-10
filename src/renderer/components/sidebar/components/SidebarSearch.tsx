import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { SearchContainer, SearchIcon, SearchInput } from '../../../styles/StyledComponents';

interface SidebarSearchProps {
  filter: string;
  setFilter: (value: string) => void;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({ filter, setFilter }) => {
  return (
    <SearchContainer>
      <SearchIcon>
        <FaSearch size={14} />
      </SearchIcon>
      <SearchInput
        placeholder="Search..."
        value={filter}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
      />
    </SearchContainer>
  );
};

export default SidebarSearch; 