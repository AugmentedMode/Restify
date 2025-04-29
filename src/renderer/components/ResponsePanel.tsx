import React from 'react';
import { ApiResponse, ApiRequest, Environment } from '../types/index';
import ResponsePanel from './response/ResponsePanel';

interface ResponsePanelProps {
  response: ApiResponse | null;
  request?: ApiRequest | null;
  isLoading?: boolean;
  environments?: Environment[];
  currentEnvironmentId?: string | null;
  onAddEnvironment?: (environment: Environment) => void;
  onUpdateEnvironment?: (environment: Environment) => void;
  onDeleteEnvironment?: (environmentId: string) => void;
  onSelectEnvironment?: (environmentId: string | null) => void;
}

export default function ResponsePanelWrapper({ 
  response, 
  request,
  isLoading,
  environments,
  currentEnvironmentId,
  onAddEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment,
  onSelectEnvironment,
}: ResponsePanelProps) {
  return (
    <ResponsePanel 
      response={response} 
      request={request} 
      isLoading={isLoading}
      environments={environments}
      currentEnvironmentId={currentEnvironmentId}
      onAddEnvironment={onAddEnvironment}
      onUpdateEnvironment={onUpdateEnvironment}
      onDeleteEnvironment={onDeleteEnvironment}
      onSelectEnvironment={onSelectEnvironment}
    />
  );
}
