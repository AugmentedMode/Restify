import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { SidebarHeader as Header, Logo } from '../../../styles/StyledComponents';

interface SidebarHeaderProps {
  isSidebarCollapsed: boolean;
}

const BrandMark = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(145deg, #ffb06b 0%, #ff7a3f 100%);
  border: 1px solid rgba(255, 228, 210, 0.45);
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    0 6px 16px rgba(255, 126, 67, 0.35);
`;

const BrandGlyph = styled.div`
  position: absolute;
  left: 8px;
  top: 7px;
  width: 13px;
  height: 13px;
  border-left: 2px solid rgba(25, 19, 16, 0.95);
  border-bottom: 2px solid rgba(25, 19, 16, 0.95);
  border-radius: 0 0 0 4px;

  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: -3px;
    width: 4px;
    height: 4px;
    background: rgba(25, 19, 16, 0.95);
    border-radius: 50%;
  }
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.1;
`;

const BrandName = styled.span`
  font-size: 17px;
  font-weight: 700;
`;

const BrandTag = styled.span`
  font-size: 10px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: rgba(190, 194, 210, 0.74);
  font-family: 'IBM Plex Mono', 'SF Mono', Menlo, monospace;
`;

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
        <BrandMark>
          <BrandGlyph />
        </BrandMark>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: isSidebarCollapsed ? 0 : 1, x: isSidebarCollapsed ? -6 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <BrandText>
              <BrandName>Restify</BrandName>
              <BrandTag>Request Studio</BrandTag>
            </BrandText>
          </motion.div>
        )}
      </Logo>
    </Header>
  );
};

export default SidebarHeader;
