import React from 'react';
import { ApiResponse, ApiRequest } from '../types';
import ResponsePanel from './response/ResponsePanel';

interface ResponsePanelProps {
  response: ApiResponse | null;
  request?: ApiRequest | null;
  isLoading?: boolean;
}

export default function ResponsePanelWrapper({ 
  response, 
  request,
  isLoading,
}: ResponsePanelProps) {
  return <ResponsePanel response={response} request={request} isLoading={isLoading} />;
}
