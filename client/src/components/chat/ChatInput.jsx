import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useChatApi } from '../../hooks/useChatApi.js';
import tokens from '../../theme/tokens.js';

const ChatInput = () => {
  const [input, setInput] = useState('');
  const { isLoading } = useChat();
  const { sendMessage, cancelRequest } = useChatApi();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );

  return (
    <div style={{
      padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
      borderTop: `1px solid ${tokens.colors.border}`,
      backgroundColor: tokens.colors.surface,
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing.sm }}>
        <div style={{ flex: 1 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Frage zum Bericht stellen..."
            style={{
              width: '100%',
              padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 20,
              fontSize: tokens.typography.fontSize.md,
              lineHeight: tokens.typography.lineHeight.normal,
              resize: 'none',
              outline: 'none',
              fontFamily: tokens.typography.fontFamily,
              minHeight: 42,
              maxHeight: 120,
              backgroundColor: tokens.colors.surfaceHover,
              color: tokens.colors.text,
              transition: 'border-color 0.15s, background-color 0.15s',
              boxSizing: 'border-box',
            }}
            rows={1}
            disabled={isLoading}
            onFocus={(e) => {
              e.target.style.borderColor = tokens.colors.primary;
              e.target.style.backgroundColor = tokens.colors.surface;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = tokens.colors.border;
              e.target.style.backgroundColor = tokens.colors.surfaceHover;
            }}
          />
        </div>
        {isLoading ? (
          <button
            type="button"
            onClick={cancelRequest}
            title="Abbrechen"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: tokens.colors.error,
              color: tokens.colors.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StopIcon />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            title="Senden"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: tokens.colors.primary,
              color: tokens.colors.white,
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: input.trim() ? 1 : 0.5,
              transition: 'opacity 0.15s',
            }}
          >
            <SendIcon />
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
