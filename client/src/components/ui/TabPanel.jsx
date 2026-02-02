import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import tokens from '../../theme/tokens.js';
import { useActiveTab } from '../../context/ActiveTabContext.jsx';

export default function TabPanel({ tabs, defaultTab = 0, onChange, activeTab: controlledTab, onTabChange, children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const initialTab = tabFromUrl != null ? Number(tabFromUrl) : defaultTab;

  const [internalTab, setInternalTab] = useState(initialTab);
  const { setActiveTab } = useActiveTab();

  // Support controlled (activeTab + onTabChange) and uncontrolled modes
  const isControlled = controlledTab !== undefined;
  const activeTab = isControlled ? controlledTab : internalTab;

  // Handle ?tab=N from URL on mount for controlled mode
  useEffect(() => {
    if (isControlled && tabFromUrl != null) {
      const idx = Number(tabFromUrl);
      if (idx >= 0 && idx < tabs.length) {
        onTabChange?.(idx);
      }
      // Clear the tab param after applying
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear ?tab param for uncontrolled mode on mount
  useEffect(() => {
    if (!isControlled && tabFromUrl != null) {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync active tab info to context
  const getLabel = (tab) => (typeof tab === 'object' ? tab.label : tab);

  useEffect(() => {
    setActiveTab({ index: activeTab, label: getLabel(tabs[activeTab]) || null });
  }, [activeTab, tabs, setActiveTab]);

  const handleTabClick = (index) => {
    if (!isControlled) {
      setInternalTab(index);
    }
    onTabChange?.(index);
    onChange?.(index);
  };

  const getContent = (tab) => (typeof tab === 'object' ? tab.content : null);

  const tabContent = getContent(tabs[activeTab]);

  return (
    <div>
      <div style={{
        display: 'flex',
        borderBottom: `2px solid ${tokens.colors.borderLight}`,
        marginBottom: tokens.spacing.xl,
        gap: tokens.spacing.xs,
      }}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            style={{
              padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === index ? tokens.colors.primary : 'transparent'}`,
              marginBottom: -2,
              color: activeTab === index ? tokens.colors.primary : tokens.colors.textSecondary,
              fontWeight: activeTab === index ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.regular,
              fontSize: tokens.typography.fontSize.md,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: tokens.typography.fontFamily,
            }}
          >
            {getLabel(tab)}
          </button>
        ))}
      </div>
      <div>{tabContent || children}</div>
    </div>
  );
}
