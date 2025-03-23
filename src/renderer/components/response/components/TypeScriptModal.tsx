import React, { useState } from 'react';
import { FaCopy, FaCheck, FaTimes, FaFileCode } from 'react-icons/fa';

interface TypeScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeScript: string;
}

const TypeScriptModal: React.FC<TypeScriptModalProps> = ({
  isOpen,
  onClose,
  typeScript,
}) => {
  const [typesCopied, setTypesCopied] = useState(false);

  if (!isOpen) return null;

  // Copy types to clipboard
  const copyTypesToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(typeScript);
      setTypesCopied(true);
      
      setTimeout(() => {
        setTypesCopied(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy TypeScript types:', err);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        style={{
          backgroundColor: '#1c1c1c',
          borderRadius: '6px',
          width: '85%',
          maxWidth: '900px',
          maxHeight: '90vh',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out',
          border: '1px solid rgba(60, 60, 60, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(60, 60, 60, 0.6)',
            background: '#222',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaFileCode style={{ color: '#8a94a6', fontSize: '16px' }} />
            <h2 
              id="modal-title"
              style={{
                margin: 0,
                color: '#e0e0e0',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              Generated TypeScript Types
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={copyTypesToClipboard}
              style={{
                background: typesCopied ? '#10B981' : '#2a2a2a',
                color: typesCopied ? '#FFFFFF' : '#e0e0e0',
                border: '1px solid rgba(80, 80, 80, 0.4)',
                borderRadius: '4px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                transition: 'all 0.2s ease',
                transform: typesCopied ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {typesCopied ? <FaCheck /> : <FaCopy />}
              {typesCopied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: '#8a94a6',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.2s',
              }}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div
          style={{
            overflow: 'auto',
            flex: 1,
            background: '#1c1c1c',
          }}
        >
          <pre
            style={{
              margin: '0',
              padding: '12px 16px',
              fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              tabSize: 2,
              whiteSpace: 'pre',
              overflowX: 'auto',
              color: '#f8f8f2',
            }}
          >
            <code>
              {typeScript.split('\n').map((line, i) => {
                // Simple syntax highlighting
                const interfaceMatch = line.match(/^interface\s+(\w+)/);
                const typeMatch = line.match(/^type\s+(\w+)/);
                const propertyLine = line.match(
                  /^\s+(\w+|'[^']+')\s*:\s*(.+);/
                );
                
                let lineContent;
                
                if (interfaceMatch || typeMatch) {
                  // Style interface/type declarations
                  const keyword = interfaceMatch ? 'interface' : 'type';
                  const name = interfaceMatch
                    ? interfaceMatch[1]
                    : typeMatch![1];
                  lineContent = (
                    <>
                      <span style={{ color: '#c678dd' }}>{keyword}</span>
                      <span> </span>
                      <span style={{ color: '#61afef' }}>{name}</span>
                      <span style={{ color: '#abb2bf' }}>{line.slice(keyword.length + name.length + 1)}</span>
                    </>
                  );
                } else if (propertyLine) {
                  // Style property declarations
                  const propName = propertyLine[1];
                  const propType = propertyLine[2];
                  
                  lineContent = (
                    <>
                      <span style={{ color: '#e5c07b' }}>{propName}</span>
                      <span style={{ color: '#abb2bf' }}>:</span>
                      <span style={{ color: '#98c379' }}> {propType}</span>
                      <span style={{ color: '#abb2bf' }}>;</span>
                    </>
                  );
                } else {
                  lineContent = <span style={{ color: '#abb2bf' }}>{line}</span>;
                }
                
                return (
                  <div 
                    key={`line-${i}`}
                    style={{
                      display: 'flex',
                      paddingLeft: '10px',
                      position: 'relative',
                      borderLeft: i === 0 || line.includes('interface') || line.includes('type') 
                        ? '2px solid rgba(150, 150, 150, 0.2)' 
                        : '2px solid transparent',
                    }}
                  >
                    <span
                      style={{
                        userSelect: 'none',
                        color: 'rgba(255, 255, 255, 0.2)',
                        marginRight: '15px',
                        textAlign: 'right',
                        minWidth: '30px',
                      }}
                    >
                      {i + 1}
                    </span>
                    {lineContent}
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(60, 60, 60, 0.6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#222',
          }}
        >
          <div style={{ color: '#8a94a6', fontSize: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            Use these types to ensure type safety in your project
          </div>
          <div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#2a2a2a',
                color: '#e0e0e0',
                border: '1px solid rgba(80, 80, 80, 0.4)',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background 0.2s',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeScriptModal; 