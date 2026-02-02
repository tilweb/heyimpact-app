import { useCallback, useMemo } from 'react';
import { useReport } from './useReport.js';

function generateId() {
  return 'todo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5);
}

export function useTodos() {
  const { report, updateReport } = useReport();

  const todos = useMemo(() => (report?.todos || []), [report]);

  const openCount = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  const allAssignees = useMemo(() => {
    const names = todos.map((t) => t.assignee).filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [todos]);

  const addTodo = useCallback((text, route, routeLabel, tabIndex, tabLabel, assignee) => {
    if (!report) return;
    const todo = {
      id: generateId(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
      route: route || '/',
      routeLabel: routeLabel || 'Start',
      tabIndex: tabIndex ?? null,
      tabLabel: tabLabel ?? null,
      assignee: assignee || null,
    };
    const updated = { ...report, todos: [...(report.todos || []), todo] };
    updateReport(updated);
    return todo;
  }, [report, updateReport]);

  const updateTodo = useCallback((id, fields) => {
    if (!report) return;
    const updated = {
      ...report,
      todos: (report.todos || []).map((t) =>
        t.id === id ? { ...t, ...fields } : t
      ),
    };
    updateReport(updated);
  }, [report, updateReport]);

  const toggleTodo = useCallback((id) => {
    if (!report) return;
    const updated = {
      ...report,
      todos: (report.todos || []).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    };
    updateReport(updated);
  }, [report, updateReport]);

  const deleteTodo = useCallback((id) => {
    if (!report) return;
    const updated = {
      ...report,
      todos: (report.todos || []).filter((t) => t.id !== id),
    };
    updateReport(updated);
  }, [report, updateReport]);

  return { todos, openCount, allAssignees, addTodo, updateTodo, toggleTodo, deleteTodo };
}
