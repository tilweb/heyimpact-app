import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import tokens from '../../theme/tokens.js';
import { useTodos } from '../../hooks/useTodos.js';
import { useActiveTab } from '../../context/ActiveTabContext.jsx';
import ROUTE_META from '../../utils/todoConstants.js';

export default function TodoQuickAdd({ onClose }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const location = useLocation();
  const { addTodo, todos } = useTodos();
  const { activeTab } = useActiveTab();

  const route = location.pathname;
  const routeLabel = ROUTE_META[route]?.label || route;
  const tabIndex = activeTab.index;
  const tabLabel = activeTab.label;

  const contextLabel = tabLabel ? `${routeLabel} > ${tabLabel}` : routeLabel;

  const recentTodos = todos
    .filter((t) => !t.done && t.route === route)
    .slice(-3)
    .reverse();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    addTodo(trimmed, route, routeLabel, tabIndex, tabLabel);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 4,
        width: 360,
        background: tokens.colors.surface,
        borderRadius: tokens.radii.md,
        boxShadow: tokens.shadows.lg,
        border: `1px solid ${tokens.colors.border}`,
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      <form onSubmit={handleSubmit} style={{ padding: tokens.spacing.lg }}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Todo eingeben..."
          style={{
            width: '100%',
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.md,
            fontFamily: tokens.typography.fontFamily,
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.target.style.borderColor = tokens.colors.primary)}
          onBlur={(e) => (e.target.style.borderColor = tokens.colors.border)}
        />
        <div
          style={{
            marginTop: tokens.spacing.sm,
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.textLight,
          }}
        >
          📍 {contextLabel}
        </div>
      </form>

      {recentTodos.length > 0 && (
        <div
          style={{
            borderTop: `1px solid ${tokens.colors.borderLight}`,
            padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px ${tokens.spacing.md}px`,
          }}
        >
          <div
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.textLight,
              marginBottom: tokens.spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Offene Todos dieser Seite
          </div>
          {recentTodos.map((todo) => (
            <div
              key={todo.id}
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.textSecondary,
                padding: `${tokens.spacing.xs}px 0`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              ○ {todo.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
