import { v4 as uuidv4 } from 'uuid';

export interface AIPrompt {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'restify-ai-prompts';

export class AIPromptsService {
  static getAllPrompts(): AIPrompt[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load AI prompts:', error);
      return [];
    }
  }

  static savePrompt(prompt: AIPrompt): AIPrompt {
    try {
      const prompts = this.getAllPrompts();
      const existingIndex = prompts.findIndex(p => p.id === prompt.id);
      
      // Update updatedAt timestamp
      const updatedPrompt = {
        ...prompt,
        updatedAt: Date.now()
      };
      
      if (existingIndex >= 0) {
        // Update existing prompt
        prompts[existingIndex] = updatedPrompt;
      } else {
        // Add new prompt
        prompts.push(updatedPrompt);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
      return updatedPrompt;
    } catch (error) {
      console.error('Failed to save AI prompt:', error);
      throw error;
    }
  }

  static deletePrompt(promptId: string): boolean {
    try {
      const prompts = this.getAllPrompts();
      const filteredPrompts = prompts.filter(p => p.id !== promptId);
      
      if (filteredPrompts.length === prompts.length) {
        return false; // Nothing was deleted
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPrompts));
      return true;
    } catch (error) {
      console.error('Failed to delete AI prompt:', error);
      return false;
    }
  }

  static createPrompt(title: string, content: string, category?: string): AIPrompt {
    const now = Date.now();
    const newPrompt: AIPrompt = {
      id: uuidv4(),
      title,
      content,
      category,
      createdAt: now,
      updatedAt: now
    };
    
    return this.savePrompt(newPrompt);
  }
} 