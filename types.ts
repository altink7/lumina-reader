export interface Source {
  title: string;
  uri: string;
}

export interface ReadingItem {
  id: string;
  title: string;
  author?: string;
  content: string; // The full text or summary
  type: 'book' | 'article' | 'news';
  dateAdded: number;
  coverImage?: string;
  sourceUrl?: string;
  description?: string;
  imageUrl?: string; // Added for AI generated images
}

export interface Highlight {
  id: string;
  itemId: string;
  text: string;
  note?: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  timestamp: number;
  rangeStart?: number; 
  rangeEnd?: number;
}

export interface SearchResult {
  text: string;
  sources: Source[];
}

export interface AppSettings {
  enableAIImages: boolean;
  userName: string;
  themeColor: 'teal' | 'blue' | 'violet';
}