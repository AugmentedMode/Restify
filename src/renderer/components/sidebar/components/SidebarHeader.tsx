import React from 'react';
import { FaGlobe, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { SidebarHeader as Header, Logo, CreateButton } from '../../../styles/StyledComponents';

interface SidebarHeaderProps {
  isSidebarCollapsed: boolean;
  toggleCreatePanel: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isSidebarCollapsed,
  toggleCreatePanel,
}) => {
  return (
    <Header>
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
        <CreateButton onClick={toggleCreatePanel}>
          <FaPlus />
        </CreateButton>
      )}
    </Header>
  );
};

export default SidebarHeader; 