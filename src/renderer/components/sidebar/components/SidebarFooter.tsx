import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { SidebarFooter as Footer, FooterButton } from '../../../styles/StyledComponents';

interface SidebarFooterProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isSidebarCollapsed,
  toggleSidebar,
}) => {
  return (
    <Footer>
      <FooterButton
        onClick={toggleSidebar}
        title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        style={{
          transform: isSidebarCollapsed ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.3s ease',
        }}
      >
        <FaArrowRight />
      </FooterButton>
    </Footer>
  );
};

export default SidebarFooter; 