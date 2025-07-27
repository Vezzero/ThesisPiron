// src/hooks/usePaperDetails.js
import { useState, useEffect } from "react";

export default function usePaperDetails(paperId) {
  const [paper, setPaper]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!paperId) {
      setPaper(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/paper_details/?paperId=${encodeURIComponent(paperId)}`)
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(json => {
        if (!cancelled) setPaper(json.paper);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [paperId]);

  return { paper, loading, error };
}
