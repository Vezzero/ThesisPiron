// hooks/useClassIndividuals.ts
import { useState, useCallback } from "react";
import { listClassIndividuals }  from "../services/api";

export function useClassIndividuals() {
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const load = useCallback(async (classIri) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listClassIndividuals(classIri);
      setIndividuals(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Unknown error");
      setIndividuals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { individuals, loading, error, load };
}
