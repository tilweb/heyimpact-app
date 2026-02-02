import React from 'react';
import { NavLink } from 'react-router-dom';
import tokens from '../../theme/tokens.js';
import { useTodos } from '../../hooks/useTodos.js';
import { useSectionStatus } from '../../hooks/useSectionStatus.js';
import { SECTION_ROUTES, STATUS_CONFIG } from '../../utils/sectionStatusConstants.js';

const navGroups = [
  {
    label: 'ESRS Bericht',
    items: [
      { to: '/', label: 'Start', icon: '🏠' },
      { to: '/import', label: 'Dokument-Import', icon: '📄' },
      { to: '/organization', label: 'Unternehmensdaten', icon: '🏢' },
      { to: '/iro', label: 'IRO-Bewertung', icon: '📊' },
      { to: '/materiality', label: 'Wesentlichkeit', icon: '🎯' },
    ],
  },
  {
    label: 'Themen',
    items: [
      { to: '/environmental', label: 'Umwelt', icon: '🌿' },
      { to: '/social', label: 'Soziales', icon: '👥' },
      { to: '/governance', label: 'Governance', icon: '⚖️' },
    ],
  },
  {
    label: 'Abschluss',
    items: [
      { to: '/targets', label: 'Ziele & Maßnahmen', icon: '🎯' },
      { to: '/export', label: 'Export', icon: '📤' },
      { to: '/vsme', label: 'VSME-Uebersicht', icon: '📋' },
    ],
  },
  {
    label: 'Verwaltung',
    items: [
      { to: '/todos', label: 'Todos', icon: '☑', showBadge: true },
    ],
  },
];

export default function Sidebar() {
  const { openCount } = useTodos();
  const { getStatus } = useSectionStatus();
  return (
    <nav style={{
      width: tokens.layout.sidebarWidth,
      background: tokens.colors.surface,
      borderRight: `1px solid ${tokens.colors.border}`,
      overflowY: 'auto',
      flexShrink: 0,
      padding: `${tokens.spacing.lg}px 0`,
    }}>
      {navGroups.map((group) => (
        <div key={group.label} style={{ marginBottom: tokens.spacing.xl }}>
          <div style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.xxl}px`,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.textLight,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {group.label}
          </div>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing.md,
                padding: `${tokens.spacing.md}px ${tokens.spacing.xxl}px`,
                textDecoration: 'none',
                fontSize: tokens.typography.fontSize.md,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.regular,
                color: isActive ? tokens.colors.primary : tokens.colors.text,
                background: isActive ? `${tokens.colors.primary}10` : 'transparent',
                borderRight: isActive ? `3px solid ${tokens.colors.primary}` : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {SECTION_ROUTES.includes(item.to) && (
                <span style={{
                  marginLeft: 'auto',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: STATUS_CONFIG[getStatus(item.to).status]?.color || STATUS_CONFIG.draft.color,
                  flexShrink: 0,
                }} />
              )}
              {item.showBadge && openCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: tokens.colors.warning,
                  color: tokens.colors.primaryDark,
                  fontSize: 11,
                  fontWeight: tokens.typography.fontWeight.bold,
                  borderRadius: tokens.radii.full,
                  minWidth: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                }}>
                  {openCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
