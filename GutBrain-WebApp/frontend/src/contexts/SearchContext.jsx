import React, { createContext, useState } from 'react';
import useTermMentions from '../hooks/useTermMentions';
import usePublicationChart from '../hooks/usePublicationChart';

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [term, setTerm] = useState('');
  const { mentions, loading, error, fetchResults } = useTermMentions(term);
  const publicationChart = usePublicationChart(term);

  const handleSearch = q => {
    setTerm(q);
    fetchResults(q);
  };

  return (
    <SearchContext.Provider
      value={{ term, handleSearch, mentions, loading, error, publicationChart }}
    >
      {children}
    </SearchContext.Provider>
  );
}