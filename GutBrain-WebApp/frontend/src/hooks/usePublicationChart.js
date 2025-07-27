// src/hooks/usePublicationChart.js
import { useState, useEffect } from "react";

export default function usePublicationChart(term) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!term) {
      setChartData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/list_publications_per_year/?term=${encodeURIComponent(term)}`)
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(json => {
        if (!cancelled) setChartData(json.chartData);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [term]);

  return { chartData, loading, error };
}
