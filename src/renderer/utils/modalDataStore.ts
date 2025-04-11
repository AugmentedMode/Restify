import { ApiRequest, Folder } from '../types';

/**
 * A simple store to save data created in modals before
 * it can be properly integrated with the parent components
 */
class ModalDataStore {
  private lastCreatedRequest: ApiRequest | null = null;
  private lastCreatedCollection: Folder | null = null;

  // Request methods
  setLastCreatedRequest(request: ApiRequest): void {
    this.lastCreatedRequest = request;
  }

  getLastCreatedRequest(): ApiRequest | null {
    const request = this.lastCreatedRequest;
    this.lastCreatedRequest = null; // Clear after retrieving
    return request;
  }

  // Collection methods
  setLastCreatedCollection(collection: Folder): void {
    this.lastCreatedCollection = collection;
  }

  getLastCreatedCollection(): Folder | null {
    const collection = this.lastCreatedCollection;
    this.lastCreatedCollection = null; // Clear after retrieving
    return collection;
  }
}

// Create a singleton instance
export const modalDataStore = new ModalDataStore(); 