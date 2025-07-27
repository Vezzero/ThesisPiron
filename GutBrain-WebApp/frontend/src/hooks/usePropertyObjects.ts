import { useState, useCallback } from "react";
import { listPropertyObjects } from "../services/api";

export function usePropertyObjects() {
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(
    async (termLabel: string, propIri: string) => {
      setLoading(true);
      setError(null);
      try {
        const objs = await listPropertyObjects(termLabel, propIri);
        setObjects(objs);
      } catch (e: any) {
        setError(e.message || "Unknown error");
        setObjects([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { objects, loading, error, load };
}
