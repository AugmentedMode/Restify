import React, { useState } from 'react';

interface NavTooltipProps {
  children: React.ReactNode;
  title: string;
  isCollapsed: boolean;
}

const NavTooltip: React.FC<NavTooltipProps> = ({ children, title, isCollapsed }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isCollapsed && (
        <div
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: `translateY(-50%) translateX(${isHovered ? '0' : '-4px'})`,
            backgroundColor: 'rgba(18, 18, 24, 0.95)',
            color: 'rgba(243, 245, 251, 0.95)',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.18s ease',
            marginLeft: '10px',
            zIndex: 1000,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 18px rgba(0, 0, 0, 0.32)',
          }}
          className="nav-tooltip"
        >
          {title}
        </div>
      )}
    </div>
  );
};

export default NavTooltip;
