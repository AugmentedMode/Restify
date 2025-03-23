import React from 'react';
import { lineNumberStyle, lineStyle } from '../constants';

interface PlainTextViewerProps {
  data: any;
  isRawMode?: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  processedLines: React.ReactNode[];
  totalLines: number;
  visibleRange: { start: number; end: number };
}

function PlainTextViewer({
  data,
  isRawMode = false,
  containerRef,
  processedLines,
  totalLines,
  visibleRange,
}: PlainTextViewerProps) {
  // Format text content outside of render
  const textContent = React.useMemo(() => {
    return typeof data === 'string'
      ? data
      : JSON.stringify(data, null, isRawMode ? undefined : 2);
  }, [data, isRawMode]);

  // For very large responses, show simple virtualized view
  if (totalLines > 0) {
    return (
      <div
        ref={containerRef}
        style={{
          height: '100%',
          overflow: 'auto',
          position: 'relative',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}
      >
        <div style={{ height: `${totalLines * 20}px`, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: `${visibleRange.start * 20}px`,
            }}
          >
            {processedLines}
          </div>
        </div>
      </div>
    );
  }

  // For smaller responses or when virtualization is not set up
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
      {textContent}
    </div>
  );
}

export default React.memo(PlainTextViewer); 