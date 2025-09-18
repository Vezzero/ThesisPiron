// src/hooks/useAllIndividuals.js
import { useState, useEffect } from "react";

export default function useAllIndividuals() {
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/app/gutbrainkb/api/list_all_individuals/")
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(json => {
        if (!cancelled) setIndividuals(json.individuals);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { individuals, loading, error };
}
