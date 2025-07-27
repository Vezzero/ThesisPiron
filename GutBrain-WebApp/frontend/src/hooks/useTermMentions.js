// src/hooks/useTermMentions.js
import { useState, useEffect, useCallback } from "react";
import { fetchTermMentions } from "../services/graphServices";

export default function useTermMentions(term) {
  const [mentions, setMentions] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchMore = useCallback(async (overrideTerm = term) => {
    setLoading(true);
    setError(null);
    try {
      const m = await fetchTermMentions(overrideTerm);
      setMentions(m);
      if (m.length > 0) {
        const resp2 = await fetch(
          `/api/list_property_term/?term=${encodeURIComponent(overrideTerm)}`
        );
        if (!resp2.ok) throw new Error(await resp2.text());
        const { relations } = await resp2.json();
        setRelations(relations);
      } else {
        setRelations([]);
      }
    } catch (e) {
      setError(e);
      setMentions([]);
      setRelations([]);
    } finally {
      setLoading(false);
    }
  }, [term]);

  useEffect(() => {
    if (term?.trim()) fetchMore(term.trim());
    else {
      setMentions([]);
      setRelations([]);
    }
  }, [term, fetchMore]);

  return { mentions, relations, loading, error, fetchMore };
}
