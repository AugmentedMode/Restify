import React from 'react';
import { FaCog, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
          <div 
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onClick={onOpenSettings}
            className="nav-item"
          >
            <FaCog size={20} />
          </div>
        </NavTooltip>

        <div 
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onClick={toggleSidebar}
          className="nav-item"
        >
          {isSidebarCollapsed ? <FaChevronRight size={20} /> : <FaChevronLeft size={20} />}
        </div>
      </div>
    </Footer>
  );
};

export default SidebarFooter; 