import React from 'react';
import styled from 'styled-components';
import { Environment } from '../types';
import { FaInfoCircle } from 'react-icons/fa';

const VariableBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background-color: rgba(255, 56, 92, 0.1);
  color: #FF385C;
  border-radius: 4px;
  font-size: 12px;
  margin: 0 4px;
  cursor: pointer;
  position: relative;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  margin-bottom: 5px;
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

interface EnvironmentVariableBadgeProps {
  variable: string;
  environment?: Environment;
}

const EnvironmentVariableBadge: React.FC<EnvironmentVariableBadgeProps> = ({
  variable,
  environment,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  // Extract variable name from the {{variableName}} format
  const variableName = variable.replace(/[{}]/g, '').trim();
  
  // Get the value from the environment, if available
  const value = environment?.variables[variableName] || 'undefined';
  
  return (
    <VariableBadge
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <FaInfoCircle size={10} style={{ marginRight: '4px' }} />
      {variableName}
      {showTooltip && (
        <Tooltip>
          Value: {value}
        </Tooltip>
      )}
    </VariableBadge>
  );
};

export default EnvironmentVariableBadge; 