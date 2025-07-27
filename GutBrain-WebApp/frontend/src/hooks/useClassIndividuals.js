// src/hooks/useClassIndividuals.js
import { useState, useEffect } from "react";

export default function useClassIndividuals(classIri) {
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!classIri) {
      setIndividuals([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/list_class_individuals/?class=${encodeURIComponent(classIri)}`)
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
  }, [classIri]);

  return { individuals, loading, error };
}
