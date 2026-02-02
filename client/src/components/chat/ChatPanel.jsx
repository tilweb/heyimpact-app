import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import ChatMessages from './ChatMessages.jsx';
import ChatInput from './ChatInput.jsx';
import tokens from '../../theme/tokens.js';

const ChatPanel = () => {
  const { isOpen, closeChat, clearMessages, messages } = useChat();

  const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: tokens.layout.headerHeight,
      right: 0,
      width: 400,
      height: `calc(100vh - ${tokens.layout.headerHeight}px)`,
      backgroundColor: tokens.colors.surface,
      boxShadow: tokens.shadows.xl,
      zIndex: 99,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: tokens.spacing.lg,
        borderBottom: `1px solid ${tokens.colors.border}`,
        backgroundColor: tokens.colors.surfaceHover,
        minHeight: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: tokens.radii.sm,
            background: tokens.colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.white,
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.bold,
          }}>
            KI
          </div>
          <div>
            <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.text }}>
              KI-Assistent
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textSecondary }}>
              Berichts-Hilfe
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              title="Chat leeren"
              style={{
                width: 32,
                height: 32,
                borderRadius: tokens.radii.sm,
                border: 'none',
                backgroundColor: tokens.colors.surfaceHover,
                color: tokens.colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.border}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.surfaceHover}
            >
              <TrashIcon />
            </button>
          )}
          <button
            onClick={closeChat}
            title="Schliessen"
            style={{
              width: 32,
              height: 32,
              borderRadius: tokens.radii.sm,
              border: 'none',
              backgroundColor: tokens.colors.surfaceHover,
              color: tokens.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.border}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.surfaceHover}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
      <ChatMessages />
      <ChatInput />
    </div>
  );
};

export default ChatPanel;
