import React, { useState, useCallback } from 'react';
import tokens from '../../theme/tokens.js';
import { useReport } from '../../hooks/useReport.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useTodos } from '../../hooks/useTodos.js';
import { useChat } from '../../context/ChatContext.jsx';
import TodoQuickAdd from '../todos/TodoQuickAdd.jsx';

export default function Header() {
  const { report, isDirty, saveReport, loading } = useReport();
  const { logout } = useAuth();
  const { openCount } = useTodos();
  const { toggleChat, isOpen: chatOpen } = useChat();
  const [saving, setSaving] = useState(false);
  const [showTodoPanel, setShowTodoPanel] = useState(false);

  const toggleTodoPanel = useCallback(() => setShowTodoPanel((v) => !v), []);
  const closeTodoPanel = useCallback(() => setShowTodoPanel(false), []);

  const handleSave = async () => {
    setSaving(true);
    try { await saveReport(); } catch {} finally { setSaving(false); }
  };

  return (
    <header style={{
      height: tokens.layout.headerHeight,
      background: tokens.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${tokens.spacing.xxl}px`,
      flexShrink: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
        <span style={{ fontSize: tokens.typography.fontSize.xxl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.white }}>
          HeyImpact
        </span>
        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.accentLight, opacity: 0.8 }}>
          ESRS Reporting
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
        {report && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.sm,
              padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: tokens.radii.sm,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.white }}>
                {report.organization?.name || 'Neuer Bericht'}
              </span>
              {(report.organization?.fiscal_year || report.metadata?.fiscal_year) && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.accentLight,
                  background: 'rgba(255,255,255,0.1)',
                  padding: `1px ${tokens.spacing.sm}px`,
                  borderRadius: tokens.radii.sm,
                }}>
                  {report.organization?.fiscal_year || report.metadata?.fiscal_year}
                </span>
              )}
            </div>
            {isDirty && (
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warning, fontWeight: tokens.typography.fontWeight.semibold }}>
                Nicht gespeichert
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              style={{
                padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
                background: isDirty ? tokens.colors.accent : 'rgba(255,255,255,0.2)',
                color: isDirty ? tokens.colors.primaryDark : 'rgba(255,255,255,0.5)',
                border: 'none',
                borderRadius: tokens.radii.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                fontSize: tokens.typography.fontSize.md,
                cursor: isDirty ? 'pointer' : 'default',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Speichert...' : 'Speichern'}
            </button>
          </>
        )}
        <button
          onClick={toggleChat}
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            background: chatOpen ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.xs,
          }}
          title="KI-Assistent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          KI
        </button>
        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleTodoPanel}
            style={{
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              background: showTodoPanel ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: tokens.radii.sm,
              fontSize: tokens.typography.fontSize.md,
              cursor: 'pointer',
              position: 'relative',
              lineHeight: 1,
            }}
            title="Todos"
          >
            ☑
            {openCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: tokens.colors.warning,
                color: tokens.colors.primaryDark,
                fontSize: 10,
                fontWeight: tokens.typography.fontWeight.bold,
                borderRadius: tokens.radii.full,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                {openCount}
              </span>
            )}
          </button>
          {showTodoPanel && <TodoQuickAdd onClose={closeTodoPanel} />}
        </div>
        <button
          onClick={logout}
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            cursor: 'pointer',
          }}
        >
          Abmelden
        </button>
      </div>
    </header>
  );
}
