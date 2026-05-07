import { createContext, useContext, useMemo, useState } from 'react';

const SavedCollegesContext = createContext(null);

export function SavedCollegesProvider({ children }) {
  const [savedColleges, setSavedColleges] = useState(() => {
    const stored = localStorage.getItem('campusiq_saved_colleges');
    return stored ? JSON.parse(stored) : [];
  });

  const persist = (items) => {
    localStorage.setItem('campusiq_saved_colleges', JSON.stringify(items));
    setSavedColleges(items);
  };

  const value = useMemo(() => ({
    savedColleges,
    isSaved: (id) => savedColleges.some((college) => college.id === id),
    toggleSaved(college) {
      const exists = savedColleges.some((item) => item.id === college.id);
      persist(exists ? savedColleges.filter((item) => item.id !== college.id) : [...savedColleges, college]);
    },
    removeSaved(id) {
      persist(savedColleges.filter((college) => college.id !== id));
    },
  }), [savedColleges]);

  return <SavedCollegesContext.Provider value={value}>{children}</SavedCollegesContext.Provider>;
}

export function useSavedColleges() {
  return useContext(SavedCollegesContext);
}
