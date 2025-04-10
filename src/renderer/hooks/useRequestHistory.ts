import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiRequest, ApiResponse, RequestHistoryItem } from '../types';
import { HistoryService } from '../services/DatabaseService';

export default function useRequestHistory() {
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load history from IndexedDB on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const history = await HistoryService.getLimitedHistory(100);
        setRequestHistory(history);
        setError(null);
      } catch (err) {
        console.error('Failed to load request history:', err);
        setError('Failed to load request history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Add a request to history
  const addToHistory = useCallback((
    requestOrHistoryItem: ApiRequest | RequestHistoryItem, 
    response?: ApiResponse
  ) => {
    let historyItem: RequestHistoryItem;

    if ('timestamp' in requestOrHistoryItem) {
      // It's already a history item
      historyItem = requestOrHistoryItem;
    } else {
      // It's an ApiRequest with separate response
      if (!response) {
        throw new Error('Response required when adding request to history');
      }
      
      historyItem = {
        id: uuidv4(),
        timestamp: Date.now(),
        request: { ...requestOrHistoryItem },
        response,
        name: `${requestOrHistoryItem.method} ${requestOrHistoryItem.url.split('/').pop() || requestOrHistoryItem.url}`,
      };
    }

    // Save to IndexedDB and update local state
    HistoryService.addToHistory(historyItem).then(() => {
      // Add to local state (limit to latest 100 items)
      setRequestHistory(prev => [historyItem, ...prev].slice(0, 100));
    }).catch(err => {
      console.error('Failed to save history item:', err);
    });
    
    return historyItem;
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    HistoryService.clearHistory().then(() => {
      setRequestHistory([]);
    }).catch(err => {
      console.error('Failed to clear history:', err);
    });
  }, []);

  return {
    requestHistory,
    loading,
    error,
    addToHistory,
    clearHistory,
  };
} 