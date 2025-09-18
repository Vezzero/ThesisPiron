import { useState, useEffect } from "react";

export function usePaperDetails(paperId) {
  const [paper, setPaper]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!paperId) {
      setPaper(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/app/gutbrainkb/api/paper_details/?paperId=${encodeURIComponent(paperId)}`)
      .then(resp => {
        if (!resp.ok) throw new Error(resp.statusText);
        return resp.json();
      })
      .then(json => setPaper(json.paper))
      .catch(err => {
        console.error("Failed loading paper details:", err);
        setError(err.message);
        setPaper(null);
      })
      .finally(() => setLoading(false));
  }, [paperId]);

  return { paper, loading, error };
}
