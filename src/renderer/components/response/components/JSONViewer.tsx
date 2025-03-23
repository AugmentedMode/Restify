import React from 'react';
import { formatJSON } from '../utils';
import { MAX_ITEMS_TO_RENDER } from '../constants';

interface JSONViewerProps {
  data: any;
  isLargeData?: boolean;
  maxItems?: number;
}

// Simple JSON viewer for formatted/prettified JSON
function JSONViewer({ 
  data, 
  isLargeData = false, 
  maxItems = MAX_ITEMS_TO_RENDER 
}: JSONViewerProps) {
  return (
    <div className="json-with-line-numbers">
      {formatJSON(data, isLargeData, maxItems)}
    </div>
  );
}

export default React.memo(JSONViewer); 