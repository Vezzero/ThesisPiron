// src/hooks/useClassesWithIndividuals.js
import { useState, useEffect } from "react";

export default function useClassesWithIndividuals() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/list_classes_with_inds/")
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(json => {
        if (!cancelled) setClasses(json.classes);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { classes, loading, error };
}
