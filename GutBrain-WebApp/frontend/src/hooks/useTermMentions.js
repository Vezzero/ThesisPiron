import { useState, useEffect, useCallback } from 'react';
import { fetchTermMentions } from '../services/graphServices';

export default function useTermMentions(term) {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async q => {
    setLoading(true); setError(null);
    try {
      const results = await fetchTermMentions(q);
      setMentions(results);
    } catch (e) {
      setError(e.message);
      setMentions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (term) fetchResults(term);
  }, [term, fetchResults]);

  return { mentions, loading, error, fetchResults };
}