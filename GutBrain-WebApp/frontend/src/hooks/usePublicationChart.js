import { useState, useEffect } from "react";
import { listPublicationsPerYear } from "../services/api";

export default function usePublicationChart(term) {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!term) {
      setChartData(null);
      return;
    }

    setError(null);
    listPublicationsPerYear(term)
      .then(data => setChartData(data))
      .catch(err => {
        console.error("Failed loading publication chart:", err);
        setError(err);
      });
  }, [term]);

  return { chartData, error };
}
