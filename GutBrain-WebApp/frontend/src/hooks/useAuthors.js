import { useState, useEffect } from "react";
import { listAuthors } from "../services/api";

export default function useAuthors() {
  const [authors, setAuthors] = useState([]);
  const [error, setError]   = useState(null);

  useEffect(() => {
    listAuthors()
      .then(a => setAuthors(a))
      .catch(err => {
        console.error("Could not load authors:", err);
        setError(err);
      });
  }, []);

  return { authors, error };
}

