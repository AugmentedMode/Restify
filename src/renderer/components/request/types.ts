import { Environment } from '../../types';

export interface RequestComponentProps {
  request: any;
  onRequestChange: (updatedRequest: any) => void;
}

export interface RequestHeaderProps extends RequestComponentProps {
  onSendRequest: (request?: any) => void;
  isLoading?: boolean;
  currentEnvironment?: Environment;
}

export interface ProcessedUrlDisplayProps {
  processedBaseUrl: string;
  processedFullUrl: string;
  originalUrl: string;
  currentEnvironment?: Environment;
}

export interface ParamsTabProps extends RequestComponentProps {}

export interface HeadersTabProps extends RequestComponentProps {}

export interface BodyTabProps extends RequestComponentProps {
  formatBody: () => void;
}

export interface AuthTabProps extends RequestComponentProps {}

export interface StatusBarProps {
  lastRequestTime?: number;
  isLoading?: boolean;
} 