import { useState, useEffect, useCallback } from 'react';
import { getHistory } from '@/lib/api';

export function useHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ verdict: 'all', dateRange: 'all' });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHistory();
      setRecords(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load history');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredRecords = records.filter((record) => {
    if (filters.verdict !== 'all' && record.verdict !== filters.verdict) return false;
    return true;
  });

  return {
    records: filteredRecords,
    allRecords: records,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchHistory,
  };
}
