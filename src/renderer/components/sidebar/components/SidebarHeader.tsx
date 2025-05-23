import React from 'react';
import { FaSmile, FaPlus } from 'react-icons/fa';
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
  // Function to navigate to home screen
  const navigateToHome = () => {
    window.history.pushState({}, '', '/home');
    window.dispatchEvent(new Event('popstate'));
  };

  

  return (
    <Header>
      <Logo onClick={navigateToHome} style={{ cursor: 'pointer' }}>
        {isSidebarCollapsed ? (
          <FaSmile color="#FF385C" size={24} />
        ) : (
          <>
            <FaSmile color="#FF385C" size={20} />
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              Hapi Dev
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