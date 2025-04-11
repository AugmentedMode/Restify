import React, { useState } from 'react';
import { FaCopy, FaLock, FaCheckCircle, FaLink } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessedUrlDisplayProps } from './types';

// Copy button component with animation
const CopyButton = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: copied ? 'rgba(76, 175, 80, 0.15)' : 'rgba(115, 103, 240, 0.15)',
        border: '1px solid',
        borderColor: copied ? 'rgba(76, 175, 80, 0.3)' : 'rgba(115, 103, 240, 0.3)',
        color: copied ? '#4CAF50' : '#7367f0',
        borderRadius: '6px',
        padding: '5px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {copied ? <FaCheckCircle size={11} /> : <FaCopy size={11} />}
      {copied ? 'Copied!' : 'Copy'}
    </motion.button>
  );
};

const ProcessedUrlDisplay: React.FC<ProcessedUrlDisplayProps> = ({
  processedBaseUrl,
  processedFullUrl,
  originalUrl,
  currentEnvironment,
}) => {
  // Helper function to render the processed URL with highlights
  const renderProcessedUrlWithHighlight = () => {
    if (!originalUrl) return '';
    
    const processed = processedFullUrl;
    const baseUrlWithEnvVars = processedBaseUrl;
    
    // Check if we have query params to highlight
    const hasQueryParams = processed.length > baseUrlWithEnvVars.length;
    
    if (!hasQueryParams && !currentEnvironment) {
      return processed;
    }
    
    // Split by query params
    const [baseUrl, queryString] = processed.split(/\?(.+)/);
    
    return (
      <>
        {/* Split the baseUrl by components and highlight env vars */}
        {baseUrl.split(/(https?:\/\/|\/)/g).map((part, index) => {
          if (part === 'http://' || part === 'https://') {
            return <span key={`base-${index}`} style={{ color: '#61afef' }}>{part}</span>;
          } else if (part === '/') {
            return <span key={`base-${index}`} style={{ color: '#c678dd' }}>{part}</span>;
          } else {
            // Check if the original URL had a variable that was replaced in this part
            const originalPart = originalUrl.split(/(https?:\/\/|\/)/g)[index];
            if (originalPart && originalPart.includes('{{') && originalPart.includes('}}')) {
              return (
                <motion.span 
                  key={`base-${index}`}
                  style={{ 
                    color: '#7367f0',
                    fontWeight: 'bold',
                    position: 'relative',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(115, 103, 240, 0.3)',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: '3px'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    color: '#8e85f2'
                  }}
                >
                  {part}
                </motion.span>
              );
            }
            return <span key={`base-${index}`} style={{ color: '#abb2bf' }}>{part}</span>;
          }
        })}
        
        {/* If we have query params, highlight them differently */}
        {hasQueryParams && queryString && (
          <>
            <span style={{ color: '#e06c75' }}>?</span>
            {queryString.split(/(&|=)/g).map((part, index) => {
              if (part === '&') {
                return <span key={`query-${index}`} style={{ color: '#e06c75' }}>&amp;</span>;
              } else if (part === '=') {
                return <span key={`query-${index}`} style={{ color: '#e06c75' }}>=</span>;
              } else if (index % 4 === 0) { // Parameter names (every 4th item starting at 0)
                return (
                  <span 
                    key={`query-${index}`} 
                    style={{ 
                      color: '#56b6c2',
                      fontWeight: 'bold'
                    }}
                  >
                    {part}
                  </span>
                );
              } else { // Parameter values
                return <span key={`query-${index}`} style={{ color: '#98c379' }}>{part}</span>;
              }
            })}
          </>
        )}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
      style={{ 
        margin: '6px 0 16px 0',
        position: 'relative',
      }}
    >
      <div style={{ 
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(25, 25, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#f5f5f5',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Subtle glow effect in the background */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          left: '-10%',
          width: '30%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(115, 103, 240, 0.05), transparent 70%)',
          zIndex: 0,
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '0.5px'
            }}>
              <FaLink size={12} style={{ color: '#7367f0' }} />
              Processed URL
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Copy button with state feedback */}
              <CopyButton url={processedFullUrl} />
            </div>
          </div>
          
          <div style={{
            fontSize: '13px',
            fontFamily: 'SF Mono, Consolas, monospace',
            lineHeight: '1.6',
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            padding: '10px 14px',
            backgroundColor: 'rgba(15, 15, 20, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(115, 103, 240, 0.1)',
            position: 'relative',
          }}>
            {/* Render the URL with highlighted variables and params */}
            {renderProcessedUrlWithHighlight()}
          </div>
          
          {/* Environment indicator */}
          {currentEnvironment && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <FaLock size={10} style={{ color: '#7367f0' }} />
              Using <span style={{ 
                fontWeight: 'bold', 
                color: '#7367f0',
                padding: '2px 6px',
                backgroundColor: 'rgba(115, 103, 240, 0.15)',
                borderRadius: '4px'
              }}>
                {currentEnvironment.name}
              </span> environment
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessedUrlDisplay; 