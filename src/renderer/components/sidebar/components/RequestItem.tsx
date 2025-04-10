import React from 'react';
import { motion } from 'framer-motion';
import { FaEllipsisV } from 'react-icons/fa';
import { RequestItemContainer, RequestItem as RequestItemStyled, ActionButton } from '../../../styles/StyledComponents';
import { ApiRequest } from '../../../types';
import { getMethodColor } from '../../../utils/uiUtils';

interface RequestItemProps {
  request: ApiRequest;
  isActive: boolean;
  onSelectRequest: (request: ApiRequest) => void;
  handleContextMenu: (
    e: React.MouseEvent,
    item: any,
    itemType: 'collection' | 'folder' | 'request',
    path: string[],
  ) => void;
  path: string[];
}

const RequestItem: React.FC<RequestItemProps> = ({
  request,
  isActive,
  onSelectRequest,
  handleContextMenu,
  path,
}) => {
  return (
    <motion.div
      transition={{ duration: 0.2 }}
      whileHover={{ x: 4 }}
    >
      <RequestItemContainer
        active={isActive}
        onClick={() => onSelectRequest(request)}
        onContextMenu={(e) => handleContextMenu(e, request, 'request', path)}
      >
        <RequestItemStyled>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            <div
              style={{
                color: getMethodColor(request.method),
                fontWeight: 600,
                marginRight: 8,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
            >
              {request.method}
            </div>
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {request.name}
            </div>
          </div>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e, request, 'request', path);
            }}
            aria-label="Menu"
            className="action-button"
          >
            <FaEllipsisV size={12} />
          </ActionButton>
        </RequestItemStyled>
      </RequestItemContainer>
    </motion.div>
  );
};

export default RequestItem; 