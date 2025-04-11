import React from 'react';
import { FaCog, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarFooter as Footer } from '../../../styles/StyledComponents';
import NavTooltip from './NavTooltip';

interface SidebarFooterProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onOpenSettings?: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ 
  isSidebarCollapsed, 
  toggleSidebar,
  onOpenSettings = () => {} 
}) => {
  return (
    <Footer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <NavTooltip title="Settings" isCollapsed={isSidebarCollapsed}>
          <motion.div 
            className="nav-item"
            onClick={onOpenSettings}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaCog size={22} />
          </motion.div>
        </NavTooltip>

        <AnimatePresence mode="wait">
          <motion.div 
            className="nav-item"
            key={isSidebarCollapsed ? 'expand' : 'collapse'}
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, rotate: isSidebarCollapsed ? -90 : 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {isSidebarCollapsed ? <FaChevronRight size={18} /> : <FaChevronLeft size={18} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Footer>
  );
};

export default SidebarFooter; 