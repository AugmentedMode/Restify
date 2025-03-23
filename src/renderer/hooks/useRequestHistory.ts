import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiRequest, ApiResponse, RequestHistoryItem } from '../types';
import { saveHistory, loadHistory } from '../utils/apiUtils';

export default function useRequestHistory() {
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load history from storage on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const result = await loadHistory();
        if (result.success && result.history) {
          setRequestHistory(result.history);
        }
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

  // Save history when it changes
  useEffect(() => {
    const persistHistory = async () => {
      try {
        await saveHistory(requestHistory);
      } catch (err) {
        console.error('Failed to save request history:', err);
        setError('Failed to save request history');
      }
    };

    if (!loading) {
      persistHistory();
    }
  }, [requestHistory, loading]);

  // Add a request to history
  const addToHistory = useCallback((request: ApiRequest, response: ApiResponse) => {
    const historyItem: RequestHistoryItem = {
      id: uuidv4(),
      timestamp: Date.now(),
      request: { ...request },
      response,
      name: `${request.method} ${request.url.split('/').pop() || request.url}`,
    };

    // Add to history (limit to latest 100 items)
    setRequestHistory(prev => [historyItem, ...prev].slice(0, 100));
    
    return historyItem;
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setRequestHistory([]);
  }, []);

  return {
    requestHistory,
    loading,
    error,
    addToHistory,
    clearHistory,
  };
} 