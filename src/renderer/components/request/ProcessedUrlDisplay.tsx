import React, { useState } from 'react';
import { FaCopy, FaLock, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
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
        backgroundColor: copied ? 'rgba(73,204,144,0.1)' : 'rgba(255,56,92,0.08)',
        border: '1px solid',
        borderColor: copied ? 'rgba(73,204,144,0.2)' : 'rgba(255,56,92,0.15)',
        color: copied ? 'rgba(73,204,144,0.9)' : 'rgba(255,56,92,0.9)',
        borderRadius: '4px',
        padding: '4px 6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {copied ? <FaCheckCircle size={10} /> : <FaCopy size={10} />}
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
                    color: '#FF385C',
                    fontWeight: 'bold',
                    position: 'relative',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(255,56,92,0.3)',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: '3px'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    color: '#FF5A7C'
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
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ 
        margin: '4px 0 12px 0',
        position: 'relative',
      }}
    >
      <div style={{ 
        padding: '14px',
        borderRadius: '8px',
        background: 'linear-gradient(145deg, rgba(14,14,16,0.8) 0%, rgba(22,22,26,0.8) 100%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset',
        backdropFilter: 'blur(10px)',
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
          background: 'radial-gradient(circle, rgba(255,56,92,0.05) 0%, rgba(255,56,92,0) 70%)',
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
            marginBottom: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#FF385C',
                boxShadow: '0 0 6px rgba(255,56,92,0.5)'
              }} />
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
            lineHeight: '1.5',
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            padding: '8px 10px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            border: '1px solid rgba(255,56,92,0.1)',
            position: 'relative',
          }}>
            {/* Render the URL with highlighted variables and params */}
            {renderProcessedUrlWithHighlight()}
          </div>
          
          {/* Environment indicator */}
          {currentEnvironment && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
            }}>
              <FaLock size={9} />
              Using <span style={{ 
                fontWeight: 'bold', 
                color: 'rgba(255,56,92,0.8)',
                padding: '1px 5px',
                backgroundColor: 'rgba(255,56,92,0.08)',
                borderRadius: '3px'
              }}>
                {currentEnvironment.name}
              </span> environment
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessedUrlDisplay; 