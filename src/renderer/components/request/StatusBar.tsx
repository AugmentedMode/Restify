import React from 'react';
import { FaClock, FaSync } from 'react-icons/fa';
import { StatusBarProps } from './types';
import { StatusBar as StatusBarContainer, StatusBarItem } from '../../styles/StyledComponents';

const StatusBar: React.FC<StatusBarProps> = ({ lastRequestTime = 0, isLoading = false }) => {
  return (
    <StatusBarContainer>
      <div>
        {lastRequestTime > 0 && (
          <StatusBarItem>
            <FaClock />
            <span>
              Last request: {new Date(lastRequestTime).toLocaleTimeString()}
            </span>
          </StatusBarItem>
        )}
      </div>
      <StatusBarItem>
        <FaSync />
        <span>Status: {isLoading ? 'Sending request...' : 'Ready'}</span>
      </StatusBarItem>
    </StatusBarContainer>
  );
};

export default StatusBar; 