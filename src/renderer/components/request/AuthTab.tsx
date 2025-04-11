import React from 'react';
import { AuthTabProps } from './types';

const AuthTab: React.FC<AuthTabProps> = () => {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      Authentication options will be implemented here
    </div>
  );
};

export default AuthTab; 