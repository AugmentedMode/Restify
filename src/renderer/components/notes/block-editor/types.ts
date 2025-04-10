export enum BlockType {
  Paragraph = 'paragraph',
  Heading1 = 'heading1',
  Heading2 = 'heading2',
  Heading3 = 'heading3',
  BulletList = 'bullet-list',
  NumberedList = 'numbered-list',
  ToDo = 'todo',
  Quote = 'quote',
  Code = 'code',
  Divider = 'divider',
  Image = 'image',
  Callout = 'callout',
  Toggle = 'toggle'
}

export interface BlockData {
  id: string;
  type: BlockType;
  content: string;
  level?: number;
  checked?: boolean; // For ToDo blocks
  language?: string; // For Code blocks
  url?: string; // For Image blocks
  meta?: Record<string, any>; // For any additional block-specific data
}

export interface EditorState {
  blocks: BlockData[];
  selectedBlockId: string | null;
  menuOpen: boolean;
  menuPosition: { x: number; y: number };
  menuAnchorBlockId: string | null;
}

export interface Position {
  x: number;
  y: number;
}

export interface BlockMenuOption {
  type: BlockType;
  label: string;
  icon?: JSX.Element;
  shortcut?: string;
} 