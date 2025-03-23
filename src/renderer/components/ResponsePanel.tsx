import React from 'react';
import { ApiResponse } from '../types';
import ResponsePanel from './response/ResponsePanel';

interface ResponsePanelProps {
  response: ApiResponse | null;
  isLoading?: boolean;
}

export default function ResponsePanelWrapper({ 
  response, 
  isLoading,
}: ResponsePanelProps) {
  return <ResponsePanel response={response} isLoading={isLoading} />;
}
