// src/hooks/useClassesWithIndividuals.js
import { useState, useEffect } from "react";

export function useClassesWithIndividuals() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/app/gutbrainkb/api/list_classes_with_inds/")
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((data) => {
        setClasses(data.classes);
      })
      .catch((err) => {
        console.error("Failed loading classes:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { classes, loading, error };
}
