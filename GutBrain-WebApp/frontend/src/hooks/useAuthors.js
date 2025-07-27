import { useState, useEffect } from "react";
import { listAuthors } from "../services/api";

export default function useAuthors() {
  const [authors, setAuthors] = useState([]);
  useEffect(() => {
    let cancelled = false;
    listAuthors()
      .then(a => { if (!cancelled) setAuthors(a); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, []);
  return authors;
}
