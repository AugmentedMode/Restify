import Dexie from 'dexie';
import { ApiRequest, ApiResponse, Folder, RequestHistoryItem, Environment, Note } from '../types';

// Define interface for response with ID for storage
interface ResponseWithId extends ApiResponse {
  id: string;
}

// Define interface for settings entry
interface SettingsEntry {
  id: string;
  value: any;
  [key: string]: any;
}

// Define custom database schema
class RestifyDatabase extends Dexie {
  notes: Dexie.Table<Note, string>;
  collections: Dexie.Table<Folder, string>;
  requestHistory: Dexie.Table<RequestHistoryItem, string>;
  responses: Dexie.Table<ResponseWithId, string>;
  environments: Dexie.Table<Environment, string>;
  settings: Dexie.Table<SettingsEntry, string>;

  constructor() {
    super('RestifyDatabase');
    
    // Define schema with explicit indices to avoid circular references
    this.version(1).stores({
      notes: '&id, title, createdAt, updatedAt, *tags',
      collections: '&id, name',
      requestHistory: '&id, timestamp, name',
      responses: '&id',
      environments: '&id, name',
      settings: '&id'
    });
    
    // Define types for tables
    this.notes = this.table('notes');
    this.collections = this.table('collections');
    this.requestHistory = this.table('requestHistory');
    this.responses = this.table('responses');
    this.environments = this.table('environments');
    this.settings = this.table('settings');
  }

  // Migrate data from localStorage if needed
  async migrateFromLocalStorage() {
    // Check if we've already migrated
    const migrationEntry = await this.settings.get('migration');
    if (migrationEntry && migrationEntry.value && migrationEntry.value.completed) {
      return;
    }

    try {
      // Migrate notes
      const savedNotes = localStorage.getItem('api-client-notes');
      if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        if (Array.isArray(notes) && notes.length > 0) {
          await this.notes.bulkPut(notes);
          console.log('Migrated notes from localStorage to IndexedDB');
        }
      }

      // Migrate collections
      const savedCollections = localStorage.getItem('api-client-collections');
      if (savedCollections) {
        const collections = JSON.parse(savedCollections);
        if (Array.isArray(collections) && collections.length > 0) {
          await this.collections.bulkPut(collections);
          console.log('Migrated collections from localStorage to IndexedDB');
        }
      }

      // Migrate request history
      const savedHistory = localStorage.getItem('api-client-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        if (Array.isArray(history) && history.length > 0) {
          await this.requestHistory.bulkPut(history);
          console.log('Migrated request history from localStorage to IndexedDB');
        }
      }

      // Migrate responses
      const savedResponses = localStorage.getItem('api-client-responses');
      if (savedResponses) {
        const responses = JSON.parse(savedResponses);
        const responsesArray = Object.entries(responses).map(([id, response]) => ({
          id,
          ...response as ApiResponse
        }));
        
        if (responsesArray.length > 0) {
          await this.responses.bulkPut(responsesArray);
          console.log('Migrated responses from localStorage to IndexedDB');
        }
      }

      // Migrate environments
      const savedEnvironments = localStorage.getItem('api-client-environments');
      if (savedEnvironments) {
        const environments = JSON.parse(savedEnvironments);
        if (Array.isArray(environments) && environments.length > 0) {
          await this.environments.bulkPut(environments);
          console.log('Migrated environments from localStorage to IndexedDB');
        }
      }

      // Mark migration as complete using consistent settings format
      const migrationStatus: SettingsEntry = { 
        id: 'migration', 
        value: {
          completed: true, 
          timestamp: Date.now()
        }
      };
      await this.settings.put(migrationStatus);
      
      // Clear localStorage to avoid duplication
      // Keep active items for now to avoid disruption
      // localStorage.removeItem('api-client-notes');
      // localStorage.removeItem('api-client-collections');
      // localStorage.removeItem('api-client-history');
      // localStorage.removeItem('api-client-responses');
      // localStorage.removeItem('api-client-environments');
      
      console.log('Migration from localStorage to IndexedDB complete');
      
    } catch (error) {
      console.error('Failed to migrate data from localStorage:', error);
      throw error;
    }
  }
}

// Create and export a single instance of the database
export const db = new RestifyDatabase();

// Notes Services
export const NotesService = {
  async getAllNotes(): Promise<Note[]> {
    return await db.notes.toArray();
  },
  
  async getNote(id: string): Promise<Note | undefined> {
    return await db.notes.get(id);
  },
  
  async saveNote(note: Note): Promise<string> {
    return await db.notes.put(note);
  },
  
  async deleteNote(id: string): Promise<void> {
    await db.notes.delete(id);
  },
  
  async searchNotes(query: string): Promise<Note[]> {
    query = query.toLowerCase();
    return await db.notes
      .filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .toArray();
  }
};

// Collections Services
export const CollectionsService = {
  async getAllCollections(): Promise<Folder[]> {
    return await db.collections.toArray();
  },
  
  async saveCollection(collection: Folder): Promise<string> {
    return await db.collections.put(collection);
  },
  
  async deleteCollection(id: string): Promise<void> {
    await db.collections.delete(id);
  },
  
  async saveAllCollections(collections: Folder[]): Promise<void> {
    await db.collections.clear();
    if (collections.length > 0) {
      await db.collections.bulkPut(collections);
    }
  }
};

// History Services
export const HistoryService = {
  async getAllHistory(): Promise<RequestHistoryItem[]> {
    return await db.requestHistory
      .orderBy('timestamp')
      .reverse()
      .toArray();
  },
  
  async addToHistory(historyItem: RequestHistoryItem): Promise<string> {
    return await db.requestHistory.put(historyItem);
  },
  
  async clearHistory(): Promise<void> {
    await db.requestHistory.clear();
  },
  
  async getLimitedHistory(limit: number = 100): Promise<RequestHistoryItem[]> {
    return await db.requestHistory
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }
};

// Responses Services
export const ResponsesService = {
  async getResponse(requestId: string): Promise<ApiResponse | undefined> {
    const response = await db.responses.get(requestId);
    if (!response) return undefined;
    
    // Remove the id property before returning
    const { id, ...apiResponse } = response;
    return apiResponse;
  },
  
  async saveResponse(requestId: string, response: ApiResponse): Promise<string> {
    const responseWithId = {
      id: requestId,
      ...response
    };
    return await db.responses.put(responseWithId);
  },
  
  async deleteResponse(requestId: string): Promise<void> {
    await db.responses.delete(requestId);
  },
  
  async getAllResponses(): Promise<Record<string, ApiResponse>> {
    const responses = await db.responses.toArray();
    return responses.reduce((acc, response) => {
      const { id, ...apiResponse } = response;
      acc[id] = apiResponse;
      return acc;
    }, {} as Record<string, ApiResponse>);
  }
};

// Environments Services
export const EnvironmentsService = {
  async getAllEnvironments(): Promise<Environment[]> {
    return await db.environments.toArray();
  },
  
  async saveEnvironment(environment: Environment): Promise<string> {
    return await db.environments.put(environment);
  },
  
  async deleteEnvironment(id: string): Promise<void> {
    await db.environments.delete(id);
  }
};

// Settings Service
export const SettingsService = {
  async getSetting(key: string): Promise<any> {
    const result = await db.settings.get(key);
    return result ? result.value : undefined;
  },
  
  async saveSetting(key: string, value: any): Promise<string> {
    const entry: SettingsEntry = { id: key, value };
    return await db.settings.put(entry);
  }
};

// Initialize the database and run migrations
export const initializeDatabase = async () => {
  try {
    await db.migrateFromLocalStorage();
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return { success: false, error };
  }
}; 