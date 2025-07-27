import React from 'react';
import { SearchProvider } from '../contexts/SearchContext';
import TermMentions from '../components/TermMentions';

export default function TermMentionsPage() {
  return (
    <SearchProvider>
      <TermMentions />
    </SearchProvider>
  );
}