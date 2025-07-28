import React from 'react';
import { SearchProvider } from '../contexts/SearchContext';
import LandingPage from '../components/LandingPage';

export default function TermMentionsPage() {
  return (
    <SearchProvider>
      <LandingPage />
    </SearchProvider>
  );
}