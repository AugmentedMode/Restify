import React from 'react';
import { 
  FaDownload, 
  FaCopy, 
  FaChevronDown, 
  FaEllipsisH, 
  FaCode, 
  FaFileAlt, 
  FaPause,
  FaSpinner,
  FaSkull,
  FaSatelliteDish
} from 'react-icons/fa';
import { ApiResponse } from '../../../types/index';
import { formatBytes } from '../utils';
import { MASSIVE_RESPONSE_THRESHOLD, VERY_LARGE_RESPONSE_THRESHOLD } from '../constants';
import JSONViewer from './JSONViewer';
import PlainTextViewer from './PlainTextViewer';
import CopyButton from './CopyButton';

// Add styles for the tombstone animation
const tombstoneStyle = `
  @keyframes gentleFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  @keyframes subtleFade {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 0.85; }
  }
`;

// REST in Space component (replaced tombstone)
const RestInPeaceTombstone = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      color: '#888',
      textAlign: 'center',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <style>{`
      @keyframes spin-slow {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes float-gentle {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-12px); }
        100% { transform: translateY(0px); }
      }
      @keyframes twinkle-star {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.2); }
      }
      .space-star {
        position: absolute;
        width: 2px;
        height: 2px;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        animation: twinkle-star 3s infinite;
      }
      .planet-ring {
        position: absolute;
        width: 80px;
        height: 80px;
        border: 2px solid rgba(255, 56, 92, 0.1);
        border-radius: 50%;
        animation: spin-slow 20s linear infinite;
      }
    `}</style>
    
    {/* Stars background */}
    {[...Array(15)].map((_, i) => (
      <div 
        key={i} 
        className="space-star" 
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
        }}
      />
    ))}
    
    {/* Planet rings */}
    <div className="planet-ring" style={{ transform: 'rotate(10deg)' }}></div>
    <div className="planet-ring" style={{ width: '100px', height: '100px', transform: 'rotate(45deg)' }}></div>
    <div className="planet-ring" style={{ width: '60px', height: '60px', transform: 'rotate(75deg)' }}></div>
    
    <div
      style={{
        fontSize: '56px',
        marginBottom: '16px',
        color: '#FF385C',
        animation: 'float-gentle 6s ease-in-out infinite',
        zIndex: 2,
        position: 'relative',
      }}
    >
      <FaSatelliteDish />
    </div>
    
    <h3 
      style={{ 
        margin: '0 0 12px 0', 
        color: '#999', 
        fontWeight: 400, 
        fontSize: '20px',
        zIndex: 2,
      }}
    >
      lost in space
    </h3>
    
    <p 
      style={{ 
        fontSize: '14px', 
        maxWidth: '280px', 
        color: '#777',
        fontWeight: 300,
        lineHeight: 1.5,
        zIndex: 2,
        marginBottom: '12px',
      }}
    >
      the server returned null. your data appears to have drifted into the cosmic void.
    </p>
  </div>
);

interface ResponseContentProps {
  response: ApiResponse | null;
  activeTab: string;
  isLargeResponse: boolean;
  isVeryLargeResponse: boolean;
  isMassiveResponse: boolean;
  isPrettyFormat: boolean;
  isPlainTextView: boolean;
  isRawMode: boolean;
  showFullResponse: boolean;
  itemsToShow: number;
  visibleRange: { start: number; end: number };
  processedLines: React.ReactNode[];
  totalLines: number;
  containerRef: React.RefObject<HTMLDivElement>;
  getSafeResponseData: (data: any, isFullView: boolean) => any;
  handleCopy: (text: string) => Promise<void>;
  toggleRawMode: () => void;
  togglePlainTextView: () => void;
  handleShowMore: () => void;
  handleShowAll: () => void;
  setShowFullResponse: (value: boolean) => void;
  isLoading?: boolean;
}

function ResponseContent({
  response,
  activeTab,
  isLargeResponse,
  isVeryLargeResponse,
  isMassiveResponse,
  isPrettyFormat,
  isPlainTextView,
  isRawMode,
  showFullResponse,
  itemsToShow,
  visibleRange,
  processedLines,
  totalLines,
  containerRef,
  getSafeResponseData,
  handleCopy,
  toggleRawMode,
  togglePlainTextView,
  handleShowMore,
  handleShowAll,
  setShowFullResponse,
  isLoading,
}: ResponseContentProps) {
  // Only render content for the active tab
  if (activeTab !== 'body') {
    return null;
  }

  // Show loading spinner when loading
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
        <div
          style={{
            fontSize: '32px',
            marginBottom: '16px',
            opacity: 0.7,
            animation: 'spin 1.5s linear infinite',
          }}
        >
          <FaSpinner size={32} />
        </div>
        <div>Loading response...</div>
      </div>
    );
  }

  // No response yet
  if (!response) {
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
        <FaChevronDown
          style={{ fontSize: '24px', marginBottom: '16px', opacity: 0.5 }}
        />
        <div>Send a request to see the response</div>
      </div>
    );
  }

  // For very large responses, don't attempt to render content at all
  if (response.size > VERY_LARGE_RESPONSE_THRESHOLD) {
    return (
      <div style={{ padding: '20px' }}>
        <div
          style={{
            marginBottom: '20px',
            color: '#FF3B30',
            padding: '12px',
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <FaEllipsisH style={{ marginRight: '8px' }} />
          <strong>
            Large response detected ({formatBytes(response.size)})
          </strong>
          <p style={{ marginTop: '8px', marginBottom: '0' }}>
            To prevent application crashes, the content is not displayed. You
            can download the response as a file or copy it to clipboard.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
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
              style={{
                background: '#2a2a2a',
                color: '#e0e0e0',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <FaDownload /> Download Response
            </button>

            <CopyButton
              onClick={() => {
                const text =
                  typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2);
                handleCopy(text);
              }}
              text="Copy to Clipboard"
            />
          </div>

          {response.size < MASSIVE_RESPONSE_THRESHOLD && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    'Warning: Attempting to view large responses may cause the application to become unresponsive or crash. Continue anyway?',
                  )
                ) {
                  // This is handled by the parent component
                  handleShowAll();
                }
              }}
              style={{
                background: 'rgba(255, 0, 0, 0.2)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '10px 16px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FaPause /> Attempt View Anyway (May Crash)
            </button>
          )}

          <div
            style={{
              marginTop: '16px',
              fontSize: '13px',
              color: '#999',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            <p>
              <strong>Tip:</strong> For large API responses, consider using
              server-side pagination or filtering to reduce the response size.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For massive responses, use the most efficient rendering possible
  if (isMassiveResponse) {
    return (
      <>
        <div
          style={{
            marginBottom: '10px',
            color: '#FF3B30',
            padding: '8px',
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            borderRadius: '4px',
          }}
        >
          <FaEllipsisH style={{ marginRight: '8px' }} />
          Extremely large response detected ({formatBytes(response.size)}).
          Showing in raw text mode to prevent app crashes.
        </div>

        <PlainTextViewer
          data={response.data}
          isRawMode={isRawMode}
          containerRef={containerRef}
          processedLines={processedLines}
          totalLines={totalLines}
          visibleRange={visibleRange}
        />

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={toggleRawMode}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '4px',
            }}
          >
            <FaCode style={{ marginRight: '8px' }} />
            {isRawMode ? 'Show Indented JSON' : 'Show Compact JSON'}
          </button>

          <CopyButton
            onClick={() => {
              const text =
                typeof response.data === 'string'
                  ? response.data
                  : JSON.stringify(response.data, null, 2);
              handleCopy(text);
            }}
            text="Copy Full Response"
          />
        </div>
      </>
    );
  }

  // Show REST in Space animation when response exists but data is null
  if (response && response.data === null) {
    return <RestInPeaceTombstone />;
  }

  if (isLargeResponse && !showFullResponse) {
    // For very large responses or plain text view
    if (isPlainTextView || isVeryLargeResponse) {
      return (
        <>
          <div
            style={{
              marginBottom: '10px',
              color: '#FF9500',
              padding: '8px',
              backgroundColor: 'rgba(255, 149, 0, 0.1)',
              borderRadius: '4px',
            }}
          >
            <FaEllipsisH style={{ marginRight: '8px' }} />
            Very large response detected ({formatBytes(response.size)}).
            Showing in {isPlainTextView ? 'plain text' : 'simplified'} mode to
            prevent performance issues.
          </div>

          <PlainTextViewer
            data={response.data}
            isRawMode={isRawMode}
            containerRef={containerRef}
            processedLines={processedLines}
            totalLines={totalLines}
            visibleRange={visibleRange}
          />

          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={toggleRawMode}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '8px 16px',
                borderRadius: '4px',
              }}
            >
              <FaCode style={{ marginRight: '8px' }} />
              {isRawMode ? 'Show Indented JSON' : 'Show Compact JSON'}
            </button>

            <button
              type="button"
              onClick={togglePlainTextView}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '8px 16px',
                borderRadius: '4px',
              }}
            >
              <FaFileAlt style={{ marginRight: '8px' }} />
              {isPlainTextView
                ? 'Try Formatted View'
                : 'Switch to Plain Text'}
            </button>

            <button
              type="button"
              onClick={handleShowMore}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '8px 16px',
                borderRadius: '4px',
              }}
            >
              Show More Items
            </button>

            {!isVeryLargeResponse && (
              <button
                type="button"
                onClick={handleShowAll}
                style={{
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 16px',
                  borderRadius: '4px',
                }}
              >
                <FaPause style={{ marginRight: '8px' }} />
                Show Full Response (May Crash)
              </button>
            )}
          </div>
        </>
      );
    }

    // Get safe truncated data
    const safeData = getSafeResponseData(response.data, false);

    return (
      <>
        <div
          style={{
            marginBottom: '10px',
            color: '#FF9500',
            padding: '8px',
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            borderRadius: '4px',
          }}
        >
          <FaEllipsisH style={{ marginRight: '8px' }} />
          Large response detected ({formatBytes(response.size)}). Showing
          limited preview to prevent performance issues.
        </div>

        {isPrettyFormat ? (
          <JSONViewer data={safeData} isLargeData maxItems={itemsToShow} />
        ) : (
          <PlainTextViewer
            data={response.data}
            isRawMode={isRawMode}
            containerRef={containerRef}
            processedLines={processedLines}
            totalLines={totalLines}
            visibleRange={visibleRange}
          />
        )}

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={togglePlainTextView}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '4px',
            }}
          >
            <FaFileAlt style={{ marginRight: '8px' }} />
            Switch to Plain Text View
          </button>

          <button
            type="button"
            onClick={handleShowMore}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '4px',
            }}
          >
            Show More Items
          </button>

          <button
            type="button"
            onClick={handleShowAll}
            style={{
              background: 'rgba(255, 0, 0, 0.2)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '4px',
            }}
          >
            Show Full Response (May Impact Performance)
          </button>
        </div>
      </>
    );
  }

  // Full response view
  return (
    <>
      {showFullResponse && isLargeResponse && (
        <div
          style={{
            marginBottom: '10px',
            color: '#FF9500',
            padding: '8px',
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            borderRadius: '4px',
          }}
        >
          <FaEllipsisH style={{ marginRight: '8px' }} />
          Showing full response ({formatBytes(response.size)}). If you
          experience performance issues,
          <button
            type="button"
            onClick={() => setShowFullResponse(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF9500',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: 'inherit',
            }}
          >
            switch back to limited view
          </button>
        </div>
      )}

      {isPrettyFormat ? (
        <JSONViewer data={response.data} isLargeData={false} />
      ) : (
        <PlainTextViewer
          data={response.data}
          isRawMode={isRawMode}
          containerRef={containerRef}
          processedLines={processedLines}
          totalLines={totalLines}
          visibleRange={visibleRange}
        />
      )}
    </>
  );
}

export default React.memo(ResponseContent); 