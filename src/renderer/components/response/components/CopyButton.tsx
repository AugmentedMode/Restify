import React, { useState } from 'react';
import { FaCopy } from 'react-icons/fa';

interface CopyButtonProps {
  onClick: () => void;
  text?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  onClick,
  text = 'Copy to Clipboard',
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    onClick();
    setIsActive(true);
    // Reset the active state after animation completes
    setTimeout(() => setIsActive(false), 600);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        background: isActive ? '#4a4a4a' : '#2a2a2a',
        color: '#e0e0e0',
        border: '1px solid #444',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        transition: 'all 0.2s ease',
        transform: isActive ? 'scale(0.95)' : 'scale(1)',
        position: 'relative',
      }}
    >
      <FaCopy size={14} color={isActive ? '#ff7eb9' : '#e0e0e0'} />
      {text}
      {isActive && (
        <span
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#ff7eb9',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            animation: 'fadeInOut 1.5s ease',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          Copied!
        </span>
      )}
    </button>
  );
};

export default CopyButton; 