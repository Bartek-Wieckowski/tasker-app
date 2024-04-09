import { createContext, useContext, useState } from 'react';
import { SearchGlobalContextType } from '@/types/types';

const initialState: SearchGlobalContextType = {
  searchValueGlobal: '',
  setSearchValueGlobal: () => {},
  isGlobalSearch: false,
  globalSearchResult: [],
  setIsGlobalSearch: () => {},
  setGlobalSearchResult: () => {},
};

const GlobalSearchContext = createContext<SearchGlobalContextType>(initialState);

export default function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchValueGlobal, setSearchValueGlobal] = useState(initialState.searchValueGlobal);
  const [isGlobalSearch, setIsGlobalSearch] = useState(initialState.isGlobalSearch);
  const [globalSearchResult, setGlobalSearchResult] = useState(initialState.globalSearchResult);

  return (
    <GlobalSearchContext.Provider
      value={{
        searchValueGlobal,
        setSearchValueGlobal,
        isGlobalSearch,
        globalSearchResult,
        setIsGlobalSearch,
        setGlobalSearchResult,
      }}
    >
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (!context) throw new Error('GlobalSearchContext was used outside GlobalSearchProvider');
  return context;
}
