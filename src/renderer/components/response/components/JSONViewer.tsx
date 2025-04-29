import React from 'react';
import { formatJSON } from '../utils';
import { MAX_ITEMS_TO_RENDER } from '../constants';
import { FaSkull } from 'react-icons/fa';

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

  if (data === null) {
    return (
      <div className="json-with-line-numbers">
        <FaSkull />
      </div>
    );
  }

  return (
    <div className="json-with-line-numbers">
      {formatJSON(data, isLargeData, maxItems)}
    </div>
  );
}

export default React.memo(JSONViewer); 