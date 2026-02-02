import React, { createContext, useContext, useState, useCallback } from 'react';

const ActiveTabContext = createContext(null);

export function ActiveTabProvider({ children }) {
  const [activeTab, setActiveTabState] = useState({ index: null, label: null });

  const setActiveTab = useCallback(({ index, label }) => {
    setActiveTabState({ index, label });
  }, []);

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
}

export function useActiveTab() {
  const ctx = useContext(ActiveTabContext);
  if (!ctx) throw new Error('useActiveTab must be used within ActiveTabProvider');
  return ctx;
}
