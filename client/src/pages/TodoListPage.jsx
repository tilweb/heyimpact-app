import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import tokens from '../theme/tokens.js';
import { useTodos } from '../hooks/useTodos.js';
import ROUTE_META from '../utils/todoConstants.js';

const STATUS_FILTERS = [
  { key: 'all', label: 'Alle' },
  { key: 'open', label: 'Offen' },
  { key: 'done', label: 'Erledigt' },
];

function AssigneeBadge({ todo, allAssignees, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.assignee || '');
  const inputRef = useRef(null);

  const handleOpen = () => {
    setValue(todo.assignee || '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    const trimmed = value.trim();
    onUpdate(todo.id, { assignee: trimmed || null });
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <span style={{ flexShrink: 0 }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          list="assignee-edit-list"
          placeholder="Zuweisen..."
          style={{
            width: 120,
            padding: `2px ${tokens.spacing.sm}px`,
            border: `1px solid ${tokens.colors.primary}`,
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.xs,
            fontFamily: tokens.typography.fontFamily,
            outline: 'none',
          }}
        />
        <datalist id="assignee-edit-list">
          {allAssignees.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </span>
    );
  }

  return (
    <button
      onClick={handleOpen}
      title={todo.assignee ? `Zugewiesen an ${todo.assignee}` : 'Zuweisen'}
      style={{
        flexShrink: 0,
        padding: `2px ${tokens.spacing.sm}px`,
        border: `1px solid ${todo.assignee ? tokens.colors.primary : tokens.colors.border}`,
        borderRadius: tokens.radii.sm,
        fontSize: tokens.typography.fontSize.xs,
        background: todo.assignee ? `${tokens.colors.primary}15` : 'transparent',
        color: todo.assignee ? tokens.colors.primary : tokens.colors.textLight,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {todo.assignee || '+'}
    </button>
  );
}

function ExportModal({ todos, onClose }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const grouped = {};
  for (const t of todos) {
    const key = t.assignee || '';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
  });

  const lines = [];
  for (const key of sortedKeys) {
    const heading = key ? `## Todos fuer ${key}` : '## Nicht zugewiesen';
    lines.push(heading);
    lines.push('');
    for (const t of grouped[key]) {
      const check = t.done ? '[x]' : '[ ]';
      const ctx = t.routeLabel + (t.tabLabel ? ` > ${t.tabLabel}` : '');
      lines.push(`- ${check} ${t.text} (${ctx})`);
    }
    lines.push('');
  }

  const markdown = lines.join('\n').trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      textareaRef.current?.select();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tokens.colors.surface,
          borderRadius: tokens.radii.md,
          padding: tokens.spacing.xxl,
          width: 600,
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing.md,
          boxShadow: tokens.shadows.lg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, color: tokens.colors.text }}>
            Export
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: tokens.typography.fontSize.lg,
              cursor: 'pointer',
              color: tokens.colors.textLight,
            }}
          >
            ✕
          </button>
        </div>
        <textarea
          ref={textareaRef}
          readOnly
          value={markdown}
          style={{
            flex: 1,
            minHeight: 300,
            padding: tokens.spacing.md,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radii.sm,
            fontFamily: 'monospace',
            fontSize: tokens.typography.fontSize.sm,
            resize: 'vertical',
            color: tokens.colors.text,
            background: tokens.colors.background,
          }}
        />
        <button
          onClick={handleCopy}
          style={{
            alignSelf: 'flex-end',
            padding: `${tokens.spacing.sm}px ${tokens.spacing.xl}px`,
            background: tokens.colors.primary,
            color: tokens.colors.white,
            border: 'none',
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            cursor: 'pointer',
          }}
        >
          {copied ? 'Kopiert!' : 'Kopieren'}
        </button>
      </div>
    </div>
  );
}

export default function TodoListPage() {
  const { todos, toggleTodo, deleteTodo, updateTodo, allAssignees } = useTodos();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('open');
  const [routeFilter, setRouteFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [groupByAssignee, setGroupByAssignee] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const uniqueRoutes = [...new Set(todos.map((t) => t.route))];

  const filtered = todos.filter((t) => {
    if (statusFilter === 'open' && t.done) return false;
    if (statusFilter === 'done' && !t.done) return false;
    if (routeFilter !== 'all' && t.route !== routeFilter) return false;
    if (assigneeFilter === '_none' && t.assignee) return false;
    if (assigneeFilter !== 'all' && assigneeFilter !== '_none' && t.assignee !== assigneeFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleNavigate = (todo) => {
    const params = todo.tabIndex != null ? `?tab=${todo.tabIndex}` : '';
    navigate(todo.route + params);
  };

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      deleteTodo(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const buildGroups = () => {
    const groups = {};
    for (const t of sorted) {
      const key = t.assignee || '';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return Object.entries(groups).sort(([a], [b]) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
  };

  const renderTodoRow = (todo) => (
    <div
      key={todo.id}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: tokens.spacing.md,
        padding: tokens.spacing.lg,
        background: tokens.colors.surface,
        borderRadius: tokens.radii.sm,
        border: `1px solid ${tokens.colors.border}`,
        opacity: todo.done ? 0.6 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggleTodo(todo.id)}
        style={{
          marginTop: 3,
          cursor: 'pointer',
          accentColor: tokens.colors.primary,
          width: 16,
          height: 16,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: tokens.typography.fontSize.md,
            color: tokens.colors.text,
            textDecoration: todo.done ? 'line-through' : 'none',
            marginBottom: tokens.spacing.xs,
          }}
        >
          {todo.text}
        </div>
        <button
          onClick={() => handleNavigate(todo)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.primary,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
        >
          {todo.routeLabel}
          {todo.tabLabel ? ` > ${todo.tabLabel}` : ''}
        </button>
      </div>

      <AssigneeBadge todo={todo} allAssignees={allAssignees} onUpdate={updateTodo} />

      <button
        onClick={() => handleDelete(todo.id)}
        style={{
          background: confirmDelete === todo.id ? tokens.colors.error : 'none',
          color: confirmDelete === todo.id ? tokens.colors.white : tokens.colors.textLight,
          border: 'none',
          borderRadius: tokens.radii.sm,
          padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
          fontSize: tokens.typography.fontSize.sm,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {confirmDelete === todo.id ? 'Wirklich?' : '✕'}
      </button>
    </div>
  );

  return (
    <div>
      <h1
        style={{
          fontSize: tokens.typography.fontSize.xxxl,
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.text,
          marginBottom: tokens.spacing.xxxl,
        }}
      >
        Todos
      </h1>

      <div
        style={{
          display: 'flex',
          gap: tokens.spacing.lg,
          marginBottom: tokens.spacing.xxl,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: tokens.spacing.xs }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
                border: 'none',
                borderRadius: tokens.radii.sm,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight:
                  statusFilter === f.key
                    ? tokens.typography.fontWeight.semibold
                    : tokens.typography.fontWeight.regular,
                background:
                  statusFilter === f.key
                    ? tokens.colors.primary
                    : tokens.colors.borderLight,
                color:
                  statusFilter === f.key
                    ? tokens.colors.white
                    : tokens.colors.text,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            fontFamily: tokens.typography.fontFamily,
            background: tokens.colors.surface,
            color: tokens.colors.text,
          }}
        >
          <option value="all">Alle Seiten</option>
          {uniqueRoutes.map((r) => (
            <option key={r} value={r}>
              {ROUTE_META[r]?.label || r}
            </option>
          ))}
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            fontFamily: tokens.typography.fontFamily,
            background: tokens.colors.surface,
            color: tokens.colors.text,
          }}
        >
          <option value="all">Alle Zuweisungen</option>
          <option value="_none">Nicht zugewiesen</option>
          {allAssignees.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <button
          onClick={() => setGroupByAssignee((v) => !v)}
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
            border: `1px solid ${groupByAssignee ? tokens.colors.primary : tokens.colors.border}`,
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            background: groupByAssignee ? `${tokens.colors.primary}15` : tokens.colors.surface,
            color: groupByAssignee ? tokens.colors.primary : tokens.colors.text,
            cursor: 'pointer',
            fontWeight: groupByAssignee ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.regular,
          }}
        >
          Gruppieren
        </button>

        <button
          onClick={() => setShowExport(true)}
          disabled={sorted.length === 0}
          style={{
            padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            background: tokens.colors.surface,
            color: sorted.length === 0 ? tokens.colors.textLight : tokens.colors.text,
            cursor: sorted.length === 0 ? 'default' : 'pointer',
          }}
        >
          Exportieren
        </button>

        <span
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.textLight,
          }}
        >
          {sorted.length} {sorted.length === 1 ? 'Todo' : 'Todos'}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            padding: tokens.spacing.xxxxl,
            textAlign: 'center',
            color: tokens.colors.textLight,
            fontSize: tokens.typography.fontSize.lg,
          }}
        >
          {todos.length === 0
            ? 'Noch keine Todos vorhanden. Erstellen Sie Todos ueber den Button im Header.'
            : 'Keine Todos fuer diesen Filter.'}
        </div>
      ) : groupByAssignee ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xl }}>
          {buildGroups().map(([assignee, items]) => (
            <div key={assignee || '_none'}>
              <h3
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.text,
                  marginBottom: tokens.spacing.md,
                  paddingBottom: tokens.spacing.xs,
                  borderBottom: `2px solid ${tokens.colors.borderLight}`,
                }}
              >
                {assignee || 'Nicht zugewiesen'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
                {items.map(renderTodoRow)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
          {sorted.map(renderTodoRow)}
        </div>
      )}

      {showExport && (
        <ExportModal todos={sorted} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
