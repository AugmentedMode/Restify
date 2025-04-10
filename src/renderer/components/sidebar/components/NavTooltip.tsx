import React from 'react';

interface NavTooltipProps {
  children: React.ReactNode;
  title: string;
  isCollapsed: boolean;
}

const NavTooltip: React.FC<NavTooltipProps> = ({ children, title, isCollapsed }) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {children}
      {isCollapsed && (
        <div
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s',
            marginLeft: '8px',
            zIndex: 1000,
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