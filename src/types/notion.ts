export type PropertyType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multi_select' 
  | 'date' 
  | 'checkbox' 
  | 'rating' 
  | 'url';

export interface PropertyOption {
  id: string;
  label: string;
  color: string;
 }

export interface NotionProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: PropertyOption[];
  currencySymbol?: string;
 }

export type BlockType = 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'text' 
  | 'todo' 
  | 'bullet' 
  | 'numbered' 
  | 'callout' 
  | 'quote' 
  | 'divider' 
  | 'image' 
  | 'embed_widget';

export interface NotionBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  color?: string;
  icon?: string;
  widgetType?: 'finance' | 'tasks' | 'water' | 'pills' | 'cycle' | 'clock' | 'desktops';
  imageUrl?: string;
  createdAt: string;
}

export type DatabaseViewType = 'calendar' | 'board' | 'list' | 'gallery' | 'table';

export interface NotionItem {
  id: string;
  title: string;
  properties: Record<string, any>;
  blocks?: NotionBlock[];
  coverColor?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotionDatabase {
  id: string;
  name: string;
  icon: string;
  description?: string;
  properties: NotionProperty[];
  items: NotionItem[];
  defaultView: DatabaseViewType;
  groupByPropertyId?: string;
  datePropertyId?: string;
}

export type PageType = 'custom_page' | 'custom_database' | 'builtin_hub';
export type BuiltinHubType = 'finance' | 'tasks' | 'desktops' | 'pills' | 'water' | 'cycle';

export interface NotionPage {
  id: string;
  title: string;
  icon: string;
  coverColor?: string;
  type: PageType;
  builtinHubType?: BuiltinHubType;
  blocks?: NotionBlock[];
  databaseId?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTemplate {
  id: string;
  title: string;
  icon: string;
  category: 'builtin' | 'productivity' | 'lifestyle' | 'study' | 'finance' | 'health';
  description: string;
  badge?: string;
  pageType: PageType;
  builtinHubType?: BuiltinHubType;
  initialBlocks?: Omit<NotionBlock, 'id' | 'createdAt'>[];
  initialDatabase?: {
    properties: NotionProperty[];
    items: Omit<NotionItem, 'id' | 'createdAt' | 'updatedAt'>[];
    defaultView: DatabaseViewType;
    groupByPropertyId?: string;
    datePropertyId?: string;
  };
}
