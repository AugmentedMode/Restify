import React, { useState } from 'react';
import { TabContainer, TabList, Tab, TabContent } from '../../styles/StyledComponents';
import ParamsTab from './ParamsTab';
import HeadersTab from './HeadersTab';
import BodyTab from './BodyTab';
import AuthTab from './AuthTab';
import { RequestComponentProps } from './types';

interface TabsContainerProps extends RequestComponentProps {
  formatBody: () => void;
}

const TabsContainer: React.FC<TabsContainerProps> = ({ 
  request, 
  onRequestChange,
  formatBody
}) => {
  const [activeTab, setActiveTab] = useState('params');

  return (
    <>
      <TabContainer>
        <TabList>
          <Tab
            active={activeTab === 'params'}
            onClick={() => setActiveTab('params')}
          >
            Params
          </Tab>
          <Tab
            active={activeTab === 'headers'}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </Tab>
          <Tab
            active={activeTab === 'body'}
            onClick={() => setActiveTab('body')}
          >
            Body
          </Tab>
          <Tab
            active={activeTab === 'auth'}
            onClick={() => setActiveTab('auth')}
          >
            Auth
          </Tab>
        </TabList>
      </TabContainer>

      <TabContent>
        {activeTab === 'params' && (
          <ParamsTab request={request} onRequestChange={onRequestChange} />
        )}

        {activeTab === 'headers' && (
          <HeadersTab request={request} onRequestChange={onRequestChange} />
        )}

        {activeTab === 'body' && (
          <BodyTab 
            request={request} 
            onRequestChange={onRequestChange}
            formatBody={formatBody}
          />
        )}

        {activeTab === 'auth' && (
          <AuthTab request={request} onRequestChange={onRequestChange} />
        )}
      </TabContent>
    </>
  );
};

export default TabsContainer; 