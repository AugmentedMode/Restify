import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(30, 30, 40, 0.9)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                marginLeft: '12px',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              {title}
              <motion.div
                style={{
                  position: 'absolute',
                  left: -5,
                  top: '50%',
                  transform: 'translateY(-50%) rotate(45deg)',
                  width: 10,
                  height: 10,
                  background: 'rgba(30, 30, 40, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRight: 'none',
                  borderTop: 'none',
                  zIndex: -1,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default NavTooltip; 