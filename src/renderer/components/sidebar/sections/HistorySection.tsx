import React from 'react';
import { motion } from 'framer-motion';
import { FaHistory, FaEraser } from 'react-icons/fa';
import {
  HistoryItemsContainer,
  EmptyHistoryMessage,
  HistoryItem,
  ActionButton,
  ActionButtons,
  CollectionHeader,
  CollectionIcon,
  CollectionTitle,
} from '../../../styles/StyledComponents';
import { RequestHistoryItem } from '../../../types';
import CollapsibleSection from '../components/CollapsibleSection';
import { getMethodColor } from '../../../utils/uiUtils';

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

interface HistorySectionProps {
  requestHistory: RequestHistoryItem[];
  expanded: boolean;
  toggleSection: () => void;
  onRestoreFromHistory: (historyItem: RequestHistoryItem) => void;
  onClearHistory: () => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
  requestHistory,
  expanded,
  toggleSection,
  onRestoreFromHistory,
  onClearHistory,
}) => {
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const sectionTitle = (
    <CollectionHeader>
      <CollectionIcon>
        <FaHistory />
      </CollectionIcon>
      <CollectionTitle>History</CollectionTitle>
    </CollectionHeader>
  );

  const sectionActions = requestHistory.length > 0 && (
    <ActionButtons>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onClearHistory();
        }}
        title="Clear History"
        className="action-button"
      >
        <FaEraser />
      </ActionButton>
    </ActionButtons>
  );

  return (
    <CollapsibleSection
      title={sectionTitle}
      expanded={expanded}
      onToggle={toggleSection}
      actions={sectionActions}
    >
      <HistoryItemsContainer style={{ overflowX: 'hidden' }}>
        {requestHistory.length === 0 ? (
          <EmptyHistoryMessage>
            No request history yet.
          </EmptyHistoryMessage>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {requestHistory
              .slice()
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 10)
              .map((historyItem) => (
                <motion.div
                  key={historyItem.id}
                  variants={itemVariants}
                  transition={{ duration: 0.2 }}
                  whileHover={{ x: 4 }}
                >
                  <HistoryItem
                    onClick={() => onRestoreFromHistory(historyItem)}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          color: getMethodColor(
                            historyItem.request.method,
                          ),
                          fontWeight: 600,
                          marginRight: 8,
                          fontSize: '0.75rem',
                        }}
                      >
                        {historyItem.request.method}
                      </div>
                      <div
                        style={{
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {historyItem.request.name ||
                          historyItem.request.url}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        opacity: 0.7,
                        marginTop: 4,
                      }}
                    >
                      {formatTimestamp(historyItem.timestamp)}
                    </div>
                  </HistoryItem>
                </motion.div>
              ))}
          </motion.div>
        )}
      </HistoryItemsContainer>
    </CollapsibleSection>
  );
};

export default HistorySection; 