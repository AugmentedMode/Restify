import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaDownload,
  FaCopy,
  FaSpinner,
  FaCode,
  FaMagic,
  FaFileCode,
  FaShieldAlt,
} from 'react-icons/fa';
import { ApiResponse, ApiRequest } from '../../types';
import {
  ResponseContainer,
  ResponseHeader,
  ResponseBody,
  TabContent,
  SettingsButton,
  StatusPill,
  ResponseMetric,
  ResponseTabs,
  ResponseTab,
} from '../../styles/StyledComponents';
import ResponseContent from './components/ResponseContent';
import CopyButton from './components/CopyButton';
import TypeScriptModal from './components/TypeScriptModal';
import { formatBytes, getSafeResponseData, generateTypeScript } from './utils';
import {
  LARGE_RESPONSE_THRESHOLD,
  VERY_LARGE_RESPONSE_THRESHOLD,
  MASSIVE_RESPONSE_THRESHOLD,
  MAX_ITEMS_TO_RENDER,
  VIRTUALIZED_CHUNK_SIZE,
} from './constants';
import SecurityAuditPanel from './components/SecurityAuditPanel';

interface ResponsePanelProps {
  response: ApiResponse | null;
  request?: ApiRequest | null;
  isLoading?: boolean;
}

function ResponsePanel({ response, request, isLoading = false }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState('body');
  const [copied, setCopied] = useState(false);
  const [showFullResponse, setShowFullResponse] = useState(false);
  const [isLargeResponse, setIsLargeResponse] = useState(false);
  const [isVeryLargeResponse, setIsVeryLargeResponse] = useState(false);
  const [isMassiveResponse, setIsMassiveResponse] = useState(false);
  const [isPrettyFormat, setIsPrettyFormat] = useState(true);
  const [isPlainTextView, setIsPlainTextView] = useState(false);
  const [isRawMode, setIsRawMode] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(MAX_ITEMS_TO_RENDER);
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: VIRTUALIZED_CHUNK_SIZE,
  });
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [generatedTypes, setGeneratedTypes] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalLines, setTotalLines] = useState(0);
  const [processedLines, setProcessedLines] = useState<React.ReactNode[]>([]);

  // Handle copying to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 600);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Format raw text
  const formatRawText = useCallback(() => {
    if (!response) return null;

    try {
      // For massive responses, don't attempt JSON formatting or pretty-printing
      if (isMassiveResponse) {
        return (
          <div
            ref={containerRef}
            style={{
              height: '100%',
              overflow: 'auto',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              padding: '8px',
              fontSize: '13px',
            }}
          >
            {typeof response.data === 'string'
              ? response.data
              : JSON.stringify(response.data, null, isRawMode ? undefined : 2)}
          </div>
        );
      }

      // For large but not massive responses, use line-by-line virtualization
      const plainText =
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data, null, isRawMode ? undefined : 2);

      const lines = plainText.split('\n');
      setTotalLines(lines.length);

      return null;
    } catch (error) {
      console.error('Error formatting raw text:', error);
      return (
        <div style={{ color: 'red', padding: '20px' }}>
          Error formatting response. The response may be too large to display.
        </div>
      );
    }
  }, [response, isMassiveResponse, isRawMode, containerRef]);

  // Toggle format handler
  const toggleFormat = useCallback(() => {
    setIsPrettyFormat((prev) => !prev);
  }, []);

  // Toggle plain text view
  const togglePlainTextView = useCallback(() => {
    setIsPlainTextView((prev) => !prev);
  }, []);

  // Toggle between raw text and formatted JSON
  const toggleRawMode = useCallback(() => {
    setIsRawMode((prev) => !prev);
  }, []);

  // Handle scroll events for virtualization
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isLargeResponse) return;

    const { scrollTop, clientHeight } = containerRef.current;

    // Calculate which lines are visible based on scroll position
    const lineHeight = 20; // Approximate line height in pixels
    const startLine = Math.floor(scrollTop / lineHeight);
    const visibleLines = Math.ceil(clientHeight / lineHeight);
    const endLine = startLine + visibleLines;

    // Only update if the visible range has changed significantly
    if (
      Math.abs(startLine - visibleRange.start) > 20 ||
      Math.abs(endLine - visibleRange.end) > 20
    ) {
      setVisibleRange({
        start: startLine,
        end: endLine + VIRTUALIZED_CHUNK_SIZE,
      });
    }
  }, [isLargeResponse, visibleRange]);

  // Add event listener for scroll
  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef && isLargeResponse) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => {
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
    return undefined;
  }, [isLargeResponse, handleScroll]);

  // Determine if response is large
  useEffect(() => {
    if (!response) return;

    if (response.size > MASSIVE_RESPONSE_THRESHOLD) {
      // For extremely large responses, force raw text view and disable pretty formatting
      setIsLargeResponse(true);
      setIsVeryLargeResponse(true);
      setIsMassiveResponse(true);
      setShowFullResponse(false);
      setIsPlainTextView(true);
      setIsRawMode(true); // Force raw mode for massive responses
    } else if (response.size > VERY_LARGE_RESPONSE_THRESHOLD) {
      setIsLargeResponse(true);
      setIsVeryLargeResponse(true);
      setIsMassiveResponse(false);
      setShowFullResponse(false);
      setIsPlainTextView(true);
      setIsRawMode(false);
    } else if (response.size > LARGE_RESPONSE_THRESHOLD) {
      setIsLargeResponse(true);
      setIsVeryLargeResponse(false);
      setIsMassiveResponse(false);
      setShowFullResponse(false);
      setIsPlainTextView(false);
      setIsRawMode(false);
    } else {
      setIsLargeResponse(false);
      setIsVeryLargeResponse(false);
      setIsMassiveResponse(false);
      setShowFullResponse(true);
      setIsPlainTextView(false);
      setIsRawMode(false);
    }

    // Reset items to show when receiving a new response
    setItemsToShow(MAX_ITEMS_TO_RENDER);
    setVisibleRange({ start: 0, end: VIRTUALIZED_CHUNK_SIZE });
  }, [response]);

  // Process response data for virtualized rendering
  useEffect(() => {
    if (!response || !isLargeResponse || isLoading) return;

    // Process the data in chunks to avoid blocking the main thread
    const processData = () => {
      try {
        // For plain text view, just stringify the data and split into lines
        if (isPlainTextView) {
          const plainText = JSON.stringify(response.data, null, 2);
          const lines = plainText.split('\n');
          setTotalLines(lines.length);

          // Only process visible lines plus some buffer
          const buffer = 50; // Extra lines to render above/below visible area
          const start = Math.max(0, visibleRange.start - buffer);
          const end = Math.min(lines.length, visibleRange.end + buffer);

          const visibleLines = lines.slice(start, end).map((line, index) => (
            <div
              key={`line-${start + index + 1}`}
              style={{ display: 'flex', lineHeight: '1.5em' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '30px',
                  textAlign: 'left',
                  paddingLeft: '2px',
                  marginRight: '8px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                  userSelect: 'none',
                }}
              >
                {start + index + 1}
              </span>
              <div>{line}</div>
            </div>
          ));

          setProcessedLines(visibleLines);
        }
      } catch (error) {
        console.error(
          'Error processing response data for virtualization:',
          error,
        );
        // Fallback to plain text view in case of error
        setIsPlainTextView(true);
      }
    };

    // Use requestIdleCallback or setTimeout to avoid blocking the UI
    const idleCallback =
      window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

    const callbackId = idleCallback(processData);

    // Cleanup
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(callbackId as any);
      } else {
        clearTimeout(callbackId as any);
      }
    };
  }, [response, isLargeResponse, visibleRange, isPlainTextView, isLoading]);

  // Handle showing more items
  const handleShowMore = () => {
    setItemsToShow((prev) => prev + MAX_ITEMS_TO_RENDER);
  };

  // Handle showing all (with warning)
  const handleShowAll = () => {
    // Show warning before enabling full view for very large responses
    if (response && response.size > 1000000) {
      if (
        !window.confirm(
          'Warning: Showing the full response may cause performance issues or crash the application. Continue anyway?',
        )
      ) {
        return;
      }
    }

    // Reset state and enable full view
    setShowFullResponse(true);
  };

  // Handle the generate types button
  const handleGenerateTypes = () => {
    if (!response || !response.data) return;
    
    try {
      const typeScript = generateTypeScript(response.data);
      setGeneratedTypes(typeScript);
      setShowTypesModal(true);
    } catch (err) {
      console.error('Failed to generate TypeScript types:', err);
    }
  };

  // Render headers tab content
  const renderHeadersContent = () => {
    if (!response) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #333',
            padding: '10px 15px',
            backgroundColor: '#1e1e1e',
          }}
        >
          <div style={{ width: '30%', fontWeight: 'bold', color: '#8a94a6' }}>
            NAME
          </div>
          <div style={{ width: '70%', fontWeight: 'bold', color: '#8a94a6' }}>
            VALUE
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {Object.entries(response.headers || {}).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                borderBottom: '1px solid #222',
                padding: '15px',
              }}
            >
              <div
                style={{ width: '30%', color: '#e0e0e0', fontWeight: 'bold' }}
              >
                {key}
              </div>
              <div style={{ width: '70%', color: '#e0e0e0' }}>{value}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            padding: '10px',
            textAlign: 'right',
            borderTop: '1px solid #333',
          }}
        >
          <CopyButton
            onClick={() => {
              const headerText = Object.entries(response.headers || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
              handleCopy(headerText);
            }}
          />
        </div>
      </div>
    );
  };

  // Render cookies tab content
  const renderCookiesContent = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #333',
            padding: '10px 15px',
            backgroundColor: '#1e1e1e',
          }}
        >
          <div style={{ width: '30%', fontWeight: 'bold', color: '#8a94a6' }}>
            NAME
          </div>
          <div style={{ width: '70%', fontWeight: 'bold', color: '#8a94a6' }}>
            VALUE
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '15px', color: '#999', textAlign: 'center' }}>
            No cookies found
          </div>
        </div>
        <div
          style={{
            padding: '10px',
            textAlign: 'right',
            borderTop: '1px solid #333',
          }}
        >
          <button
            type="button"
            style={{
              background: '#2a2a2a',
              color: '#e0e0e0',
              border: '1px solid #444',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
            }}
          >
            Manage Cookies
          </button>
        </div>
      </div>
    );
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <FaSpinner
            style={{
              fontSize: '32px',
              marginBottom: '16px',
              opacity: 0.7,
              animation: 'spin 1.5s linear infinite',
            }}
          />
          <div>Loading response...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    switch (activeTab) {
      case 'body':
        return (
          <ResponseContent
            response={response}
            activeTab={activeTab}
            isLargeResponse={isLargeResponse}
            isVeryLargeResponse={isVeryLargeResponse}
            isMassiveResponse={isMassiveResponse}
            isPrettyFormat={isPrettyFormat}
            isPlainTextView={isPlainTextView}
            isRawMode={isRawMode}
            showFullResponse={showFullResponse}
            itemsToShow={itemsToShow}
            visibleRange={visibleRange}
            processedLines={processedLines}
            totalLines={totalLines}
            containerRef={containerRef}
            getSafeResponseData={(data, isFullView) =>
              getSafeResponseData(
                data,
                isFullView,
                isVeryLargeResponse,
                itemsToShow,
              )
            }
            handleCopy={handleCopy}
            toggleRawMode={toggleRawMode}
            togglePlainTextView={togglePlainTextView}
            handleShowMore={handleShowMore}
            handleShowAll={handleShowAll}
            setShowFullResponse={setShowFullResponse}
          />
        );
      case 'headers':
        return renderHeadersContent();
      case 'cookies':
        return renderCookiesContent();
      case 'security':
        return <SecurityAuditPanel request={request || null} response={response} />;
      default:
        return null;
    }
  };

  // Get HTTP status text
  const getStatusText = (status: number): string => {
    if (status >= 200 && status < 300) return 'OK';
    if (status >= 300 && status < 400) return 'Redirect';
    if (status >= 400 && status < 500) return 'Client Error';
    if (status >= 500) return 'Server Error';
    return 'Unknown';
  };

  return (
    <ResponseContainer>
      <TypeScriptModal 
        isOpen={showTypesModal} 
        onClose={() => setShowTypesModal(false)} 
        typeScript={generatedTypes} 
      />
      <ResponseHeader>
        {response ? (
          <>
            <StatusPill
              success={response.status >= 200 && response.status < 300}
            >
              {response.status} {getStatusText(response.status)}
            </StatusPill>
            <ResponseMetric>{response.time} ms</ResponseMetric>
            <ResponseMetric>{formatBytes(response.size)}</ResponseMetric>
          </>
        ) : (
          <StatusPill success={false}>No Response</StatusPill>
        )}
      </ResponseHeader>

      <ResponseTabs>
        <ResponseTab
          active={activeTab === 'body'}
          onClick={() => setActiveTab('body')}
        >
          Preview
        </ResponseTab>
        <ResponseTab
          active={activeTab === 'headers'}
          onClick={() => setActiveTab('headers')}
        >
          Headers ({response ? Object.keys(response.headers).length : 0})
        </ResponseTab>
        <ResponseTab
          active={activeTab === 'cookies'}
          onClick={() => setActiveTab('cookies')}
        >
          Cookies
        </ResponseTab>
        <ResponseTab
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FaShieldAlt size={14} />
          Security
        </ResponseTab>
        {response && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: 'auto',
              paddingRight: '8px',
            }}
          >
            {!isMassiveResponse && !isVeryLargeResponse && (
              <SettingsButton
                onClick={toggleFormat}
                title={
                  isPrettyFormat ? 'View Simple Format' : 'View Pretty Format'
                }
              >
                {isPrettyFormat ? <FaCode /> : <FaMagic />}
              </SettingsButton>
            )}

            {isLargeResponse && (
              <SettingsButton
                onClick={toggleRawMode}
                title={isRawMode ? 'View Indented JSON' : 'View Compact JSON'}
              >
                <FaCode />
              </SettingsButton>
            )}

            <SettingsButton
              onClick={handleGenerateTypes}
              title="Generate TypeScript Types"
              style={{
                transition: 'all 0.3s ease',
              }}
            >
              <FaFileCode />
            </SettingsButton>

            <SettingsButton
              onClick={() => handleCopy(JSON.stringify(response.data, null, 2))}
              title={copied ? 'Copied!' : 'Copy Response'}
              style={{
                background: copied ? '#4a4a4a' : undefined,
                transition: 'all 0.2s ease',
                transform: copied ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              <FaCopy color={copied ? '#ff7eb9' : undefined} />
            </SettingsButton>
            <SettingsButton
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(response.data, null, 2)],
                  { type: 'application/json' },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'response.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Download Response"
            >
              <FaDownload />
            </SettingsButton>
          </div>
        )}
      </ResponseTabs>

      <TabContent>
        <ResponseBody>{renderTabContent()}</ResponseBody>
      </TabContent>
      <style>{`
        .json-with-line-numbers {
          font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          border-radius: 4px;
          padding: 0;
          overflow: auto;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(5px); }
          20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-5px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ResponseContainer>
  );
}

export default ResponsePanel;
