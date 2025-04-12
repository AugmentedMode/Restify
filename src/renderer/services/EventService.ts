/**
 * Service for handling application-wide events
 */
export class EventService {
  private static readonly COLLECTION_UPDATE_EVENT = 'collection-update';
  
  /**
   * Dispatch an event to notify that collections have been updated
   */
  public static notifyCollectionsUpdated() {
    console.log('[Events] Dispatching collection update event');
    const event = new CustomEvent(this.COLLECTION_UPDATE_EVENT);
    window.dispatchEvent(event);
  }
  
  /**
   * Listen for collection update events
   * @param callback The function to call when collections are updated
   */
  public static onCollectionsUpdated(callback: () => void) {
    window.addEventListener(this.COLLECTION_UPDATE_EVENT, callback);
    return () => {
      window.removeEventListener(this.COLLECTION_UPDATE_EVENT, callback);
    };
  }
}

export default EventService; 