import React from 'react';
import { SidebarFooter as Footer } from '../../../styles/StyledComponents';

interface SidebarFooterProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = () => {
  return (
    <Footer>
      {/* Collapse button removed */}
    </Footer>
  );
};

export default SidebarFooter; 