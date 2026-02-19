import React, { useState, useRef, useEffect } from 'react';
import { FaCode, FaCopy, FaTrash } from 'react-icons/fa';
import { BodyType } from '../../types';
import { BodyTabProps } from './types';
import {
  FormGroup,
  TextArea,
} from '../../styles/StyledComponents';

const BodyTab: React.FC<BodyTabProps> = ({ 
  request, 
  onRequestChange,
  formatBody
}) => {
  const [lineCount, setLineCount] = useState(1);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const hasBody = !['GET', 'HEAD'].includes(request.method);

  // Update line count when body content changes
  useEffect(() => {
    if (request.body && typeof request.body === 'string') {
      const lines = request.body.split('\n').length;
      setLineCount(Math.max(lines, 1));
    } else {
      setLineCount(1);
    }
  }, [request.body]);

  // Handle textarea scroll sync
  const handleTextAreaScroll = () => {
    if (textAreaRef.current) {
      const lineNumbers = document.getElementById('line-numbers');
      if (lineNumbers) {
        lineNumbers.scrollTop = textAreaRef.current.scrollTop;
      }
    }
  };

  // Handle tab key in textarea
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab at cursor position
      const newValue = 
        textarea.value.substring(0, start) + 
        '  ' + // 2 spaces for a tab instead of 4
        textarea.value.substring(end);
      
      // Update the value
      onRequestChange({
        ...request,
        body: newValue,
      });
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.selectionStart = start + 2; // Changed from 4 to 2
          textAreaRef.current.selectionEnd = start + 2; // Changed from 4 to
        }
      }, 0);
    }
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onRequestChange({
      ...request,
      body: e.target.value,
    });
  };

  const handleBodyTypeChange = (bodyType: BodyType) => {
    onRequestChange({
      ...request,
      bodyType,
      // Clear body when switching types to avoid format confusion
      body: bodyType === 'none' ? '' : request.body,
    });
  };

  // Helper function to get example body based on type
  const getBodyPlaceholder = (): string => {
    switch (request.bodyType) {
      case 'json':
        return '{\n  "key": "value",\n  "array": [1, 2, 3],\n  "nested": {\n    "property": true\n  }\n}';
      case 'form-data':
        return 'name: John Doe\nage: 30\nfile: /path/to/file.jpg';
      case 'form-urlencoded':
        return 'name=John%20Doe&age=30&active=true';
      case 'graphql':
        return '{\n  query {\n    user(id: "123") {\n      id\n      name\n      email\n    }\n  }\n}';
      case 'xml':
        return '<?xml version="1.0"?>\n<root>\n  <item id="1">\n    <name>Example</name>\n    <value>123</value>\n  </item>\n</root>';
      case 'yaml':
        return 'user:\n  name: John Doe\n  age: 30\n  roles:\n    - admin\n    - editor';
      case 'plain-text':
        return 'Enter plain text here...';
      default:
        return '';
    }
  };

  // Generate line numbers
  const renderLineNumbers = () => {
    return Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => (
      <div
        key={num}
        style={{
          height: '1.5em',
          paddingRight: '8px',
        }}
      >
        {num}
      </div>
    ));
  };

  const copyBodyContent = () => {
    if (typeof request.body === 'string' && request.body.length > 0) {
      void navigator.clipboard.writeText(request.body);
    }
  };

  const clearBodyContent = () => {
    onRequestChange({
      ...request,
      body: '',
    });
  };

  if (!hasBody) {
    return (
      <div
        style={{
          padding: '30px',
          textAlign: 'center',
          color: 'rgba(191, 196, 214, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ opacity: 0.7, fontSize: '36px' }}>📭</div>
        <div style={{ fontSize: '16px' }}>
          {request.method} requests do not support a request body
        </div>
      </div>
    );
  }

  return (
    <FormGroup>
      <div
        style={{
          display: 'flex',
          marginBottom: '12px',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Compact Body Type Select with Format Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '0',
            border: '1px solid rgba(255,255,255,0.14)',
            flex: '1',
            maxWidth: '240px',
            position: 'relative',
          }}>
            <span style={{
              padding: '8px 12px',
              borderRight: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(186,191,208,0.74)',
              fontSize: '12px',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
            }}>
              Format
            </span>
            <select
              value={request.bodyType}
              onChange={(e) => handleBodyTypeChange(e.target.value as BodyType)}
              style={{
                flex: '1',
                padding: '8px 30px 8px 12px',
                appearance: 'none',
                backgroundColor: 'transparent',
                color: 'rgba(244,245,250,0.96)',
                border: 'none',
                fontSize: '13px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <option value="none">No Body</option>
              <option value="json">JSON</option>
              <option value="form-data">Form Data</option>
              <option value="form-urlencoded">URL Encoded</option>
              <option value="graphql">GraphQL</option>
              <option value="xml">XML</option>
              <option value="plain-text">Plain Text</option>
            </select>
            <div style={{
              position: 'absolute',
              right: '10px',
              pointerEvents: 'none',
              color: '#FF6B92',
              fontSize: '10px',
            }}>
              ▼
            </div>
          </div>
          
          {/* Filter-like Body Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: 'auto',
          }}>
            {request.bodyType !== 'none' && (
              <>
                <button
                  type="button"
                  onClick={formatBody}
                  style={{
                    background: 'rgba(255, 56, 92, 0.14)',
                    border: '1px solid rgba(255, 106, 140, 0.34)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                  }}
                >
                  <FaCode /> Format
                </button>

                <button
                  type="button"
                  onClick={copyBodyContent}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    color: 'rgba(197, 201, 216, 0.82)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  title="Copy body content"
                >
                  <FaCopy />
                </button>

                <button
                  type="button"
                  onClick={clearBodyContent}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    color: 'rgba(197, 201, 216, 0.82)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  title="Clear body content"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {request.bodyType !== 'none' && (
        <>
          <div style={{
            display: 'flex',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(12, 13, 19, 0.56)',
            position: 'relative',
            boxShadow: '0 8px 16px rgba(0,0,0,0.18)',
          }}>
            {/* Line Numbers */}
            <div
              id="line-numbers"
              style={{
                width: '50px',
                padding: '12px 8px',
                background: 'rgba(0,0,0,0.28)',
                color: 'rgba(180,185,202,0.62)',
                fontFamily: 'SF Mono, monospace',
                fontSize: '13px',
                textAlign: 'right',
                userSelect: 'none',
                borderRight: '1px solid rgba(255,255,255,0.12)',
                overflowY: 'hidden',
              }}
            >
              {renderLineNumbers()}
            </div>
            
            {/* Text Editor */}
            <TextArea
              ref={textAreaRef}
              placeholder={getBodyPlaceholder()}
              value={typeof request.body === 'string' ? request.body : ''}
              onChange={handleBodyChange}
              onScroll={handleTextAreaScroll}
              onKeyDown={handleTabKey}
              style={{
                fontFamily: 'SF Mono, monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                minHeight: '300px',
                padding: '12px',
                flex: 1,
                border: 'none',
                resize: 'vertical',
                background: 'transparent',
                color: 'rgba(245,246,250,0.92)',
                width: 'calc(100% - 50px)',
              }}
            />
          </div>
        </>
      )}
    </FormGroup>
  );
};

export default BodyTab;
