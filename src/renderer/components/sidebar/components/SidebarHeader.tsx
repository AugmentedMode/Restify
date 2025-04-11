import React from 'react';
import { FaGlobe, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <FaGlobe size={24} />
          </motion.div>
        ) : (
          <motion.div
            style={{ display: 'flex', alignItems: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaGlobe size={22} />
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, type: "spring", stiffness: 300 }}
            >
              Restify
            </motion.span>
          </motion.div>
        )}
      </Logo>
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CreateButton 
              onClick={toggleCreatePanel}
              as={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaPlus />
            </CreateButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Header>
  );
};

export default SidebarHeader; 