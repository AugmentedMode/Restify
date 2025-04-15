export interface AIPromptCategory {
  id: string;
  name: string;
}

export interface AIPrompt {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
} 