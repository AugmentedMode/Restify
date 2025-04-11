export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD';

export interface RequestParam {
  name: string;
  value: string;
  enabled: boolean;
}

export interface RequestHeader {
  name: string;
  value: string;
  enabled: boolean;
}

export type BodyType = 
  | 'none'
  | 'json'
  | 'form-data'
  | 'form-urlencoded'
  | 'graphql'
  | 'xml'
  | 'yaml'
  | 'edn'
  | 'plain-text'
  | 'file';

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: RequestParam[];
  headers: RequestHeader[] | Record<string, string>;
  body: {
    mode?: string;
    raw?: string;
  } | string;
  bodyType?: BodyType;
  folderPath?: string[];
  auth?: {
    type: string;
    bearer?: string;
    basic?: {
      username: string;
      password: string;
    };
  };
}

export interface Folder {
  id: string;
  name: string;
  items: (ApiRequest | Folder)[];
  parentPath: string[];
}

export interface Environment {
  id: string;
  name: string;
  variables: { [key: string]: string };
}

export interface Secret {
  id: string;
  key: string;
  value: string;
  isMasked: boolean;
}

export interface SecretsProfile {
  id: string;
  name: string;
  secrets: Secret[];
  isEncrypted: boolean;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

export interface RequestHistoryItem {
  id: string;
  timestamp: number;
  request: ApiRequest;
  response: ApiResponse;
  name: string;
}

export interface AppState {
  collections: Folder[];
  environments: Environment[];
  currentEnvironment: string | null;
  activeRequest: string | null;
  requestHistory: string[];
  notes: Note[];
  activeNote: string | null;
  secretsProfiles: SecretsProfile[];
  activeSecretsProfile: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}
