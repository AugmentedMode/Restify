import React from 'react';
import { FaSmile } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { SidebarHeader as Header, Logo } from '../../../styles/StyledComponents';

interface SidebarHeaderProps {
  isSidebarCollapsed: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isSidebarCollapsed,
}) => {
  const navigateToHome = () => {
    window.history.pushState({}, '', '/home');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <Header>
      <Logo onClick={navigateToHome} style={{ cursor: 'pointer' }}>
        {isSidebarCollapsed ? (
          <FaSmile color="#FF385C" size={22} />
        ) : (
          <>
            <FaSmile color="#FF385C" size={18} />
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
    </Header>
  );
};

export default SidebarHeader;
